//= require ./modules/devmode.ts
//= require ./modules/req_headers.ts

import { DEV_MODE } from "./modules/devmode";
import { log } from "./modules/log";
import { selectAll } from "./utils/query";
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

interface ISubdivisionByQueryInput {
  query?: string;
}

interface ICollaboratorsBySubdivisionIdInput {
  subdivisionId?: string;
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
      err("route_error", "Отсутствует параметр query в query-params");
    }

    response.data = getSubdivisionsByQuery(query);
  } else if (method === "getCollaboratorsBySubdivisionId") {
    const body: ICollaboratorsBySubdivisionIdInput = bodyAny;
    const subdivisionId = body.GetOptProperty("subdivisionId");
    const a = OptInt(subdivisionId);

    if (!isNumber(OptInt(subdivisionId))) {
      err("route_error", "Отсутствует параметр subdivisionId в query-params");
    }

    response.data = getCollaboratorsBySubdivisionId(a);
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
