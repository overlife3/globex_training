//= require ./modules/devmode.ts
//= require ./modules/req_headers.ts

import { DEV_MODE } from "./modules/devmode";
import { log } from "./modules/log";
import { selectAll, selectOne } from "./utils/query";
import { isNumber, isString } from "./utils/type";

/* --- types --- */
interface IRequestBodyString {
  method?: string;
}
interface ISubdivision {
  id: XmlElem<number>;
  name: XmlElem<string>;
}
interface ICollaborator {
  id: XmlElem<number>;
  fullname: XmlElem<string>;
}
interface IChangeLogsDTO {
  date: XmlElem<string>;
  position_name: XmlElem<string>;
  position_parent_name: XmlElem<string>;
  org_name: XmlElem<string>;
}
interface IHistoryStatesDTO {
  start_date: XmlElem<string>;
  finish_date: XmlElem<string>;
  state_id: XmlElem<string>;
}
interface ICollaboratorData {
  change_logs: {
    date: string;
    position_name: string;
    position_parent_name: string;
    org_name: string;
  }[];
  history_states: {
    start_date: string;
    finish_date: string;
    state: string;
  }[];
}

//"start_date", "finish_date", state_id

interface ISubdivisionByQueryInput {
  query?: string;
}
interface ICollaboratorByQueryInput {
  query?: string;
}
interface ICollaboratorsBySubdivisionIdInput {
  subdivisionId?: string;
}
interface ICollaboratorDataInput {
  collaboratorId?: string;
}

/* --- utils --- */
function getParam(name: string, defaultVal: string = "undefined") {
  return tools_web.get_web_param(curParams, name, defaultVal, true, "");
}

function err(source: string, error: unknown, text = "") {
  throw new Error(`${source} -> ${text ? text + " " : ""}${error}`);
}

/* --- global --- */
const curUserId: number = DEV_MODE
  ? OptInt("7000000000000000")
  : OptInt(curUserID);
const DEBUG_MODE = tools_web.is_true(getParam("IS_DEBUG", undefined));

/* --- logic --- */
function getSubdivisionsByQuery(query: string) {
  try {
    const deps = selectAll<ISubdivision>(`
			SELECT
				s.id,
				s.name
			FROM subdivisions s
			WHERE s.name LIKE '%${query}%'
		`);

    const result: { id: number; name: string }[] = [];

    deps.map((item) =>
      result.push({
        name: RValue(item.name),
        id: RValue(item.id),
      })
    );

    return result;
  } catch (e) {
    err("getSubdivisionsByQuery", e);
  }
}

function getCollaboratorsByQuery(query: string) {
  try {
    const deps = selectAll<ICollaborator>(`
			SELECT
				s.id,
				s.fullname
			FROM collaborators s
			WHERE s.fullname LIKE '%${query}%'
		`);

    const result: { id: number; fullname: string }[] = [];

    deps.map((item) =>
      result.push({
        fullname: RValue(item.fullname),
        id: RValue(item.id),
      })
    );

    return result;
  } catch (e) {
    err("getCollaboratorsByQuery", e);
  }
}

function getCollaboratorData(colId: number) {
  try {
    const data = tools.open_doc(colId).TopElem;
    const changeLogsArray: IChangeLogsDTO[] = ArrayDirect(
      GetOptObjectProperty(data, "change_logs") as any[]
    );
    const historyStatesArray: IHistoryStatesDTO[] = ArrayDirect(
      GetOptObjectProperty(data, "history_states") as any[]
    );

    const result: ICollaboratorData = {
      change_logs: [],
      history_states: [],
    };

    const statesList = ArrayDirect(
      GetOptObjectProperty(lists.person_states, "person_state") as any[]
    );

    changeLogsArray.map((item) =>
      result.change_logs.push({
        date: RValue(item.date),
        org_name: RValue(item.org_name),
        position_name: RValue(item.position_name),
        position_parent_name: RValue(item.position_parent_name),
      })
    );
    historyStatesArray.map((item) =>
      result.history_states.push({
        finish_date: RValue(item.finish_date),
        start_date: RValue(item.start_date),
        state: RValue(
          GetOptObjectProperty(
            statesList.find(
              (state) => RValue(state.id) == RValue(item.state_id)
            ),
            "name"
          )
        ),
      })
    );
    return result;
  } catch (e) {
    err("getCollaboratorData", e);
  }
}

function getCollaboratorsBySubdivisionId(subId: number) {
  try {
    const deps = selectAll<ICollaborator>(`
      SELECT
        c.id,
        c.fullname
      FROM collaborators c
      WHERE c.position_parent_id=${subId}
    `);

    const result: { id: number; fullname: string }[] = [];

    deps.map((item) =>
      result.push({
        fullname: RValue(item.fullname),
        id: RValue(item.id),
      })
    );

    return result;
  } catch (e) {
    err("getSubdivisionsByQuery", e);
  }
}

function handler(bodyAny: object, method: string) {
  const response = { success: true, error: false, data: [] as unknown };

  if (method === "getSubdivisionsByQuery") {
    const body: ISubdivisionByQueryInput = bodyAny;
    const query = body.GetOptProperty("query");
    if (!isString(query)) {
      err("route_error", "Отсутствует параметр query в body");
    }

    response.data = getSubdivisionsByQuery(query);
  }

  if (method === "getCollaboratorsBySubdivisionId") {
    const body: ICollaboratorsBySubdivisionIdInput = bodyAny;
    const subdivisionId = OptInt(body.GetOptProperty("subdivisionId"));

    if (!isNumber(subdivisionId)) {
      err("route_error", "Отсутствует параметр subdivisionId в body");
    }

    response.data = getCollaboratorsBySubdivisionId(subdivisionId);
  }

  if (method === "getCollaboratorsByQuery") {
    const body: ICollaboratorByQueryInput = bodyAny;
    const query = body.GetOptProperty("query");
    if (!isString(query)) {
      err("route_error", "Отсутствует параметр query в body");
    }

    response.data = getCollaboratorsByQuery(query);
  }

  if (method === "getCollaboratorData") {
    const body: ICollaboratorDataInput = bodyAny;
    const colId = OptInt(body.GetOptProperty("collaboratorId"));

    if (!isNumber(colId)) {
      err("route_error", "Отсутствует параметр collaboratorId в body");
    }

    response.data = getCollaboratorData(colId);
  }

  return response;
}

/* --- start point --- */
function main(req: Request, res: Response) {
  try {
    const body: IRequestBodyString = tools.read_object(req.Body);

    const method = tools_web.convert_xss(
      body.GetOptProperty("method") as string
    );

    if (IsEmptyValue(method) || method === "undefined") {
      err("main", "Не найдено поле method в body");
    }
    const payload = handler(body, method);

    res.Write(tools.object_to_text(payload, "json"));
  } catch (error) {
    if (DEV_MODE) {
      Response.Write(error);
    } else {
      log(`[uid:${curUserId}] -> ${error}`, "error");
      Request.SetRespStatus(500, "");
      const res = {
        data: [] as [],
        success: false,
        error: true,
        message: "Произошла ошибка на стороне сервера",
        log: logConfig.code,
      };
      Response.Write(tools.object_to_text(res, "json"));
    }
  }
}

export const logConfig = {
  code: "globex_web_log",
  type: "web",
  objectId: customWebTemplate.id,
};
EnableLog(logConfig.code, DEBUG_MODE);

main(Request, Response);

export {};
