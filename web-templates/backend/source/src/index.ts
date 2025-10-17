//= require ./modules/devmode.ts
//= require ./modules/req_headers.ts

import { DEV_MODE } from "./modules/devmode";
import { log } from "./modules/log";
import { getSubdivisionsByQueryAndChild } from "./sql";
import { selectAll, selectOne } from "./utils/query";
import { isBoolean, isNumber, isObject, isString } from "./utils/type";

/* --- types --- */
interface IRequestBodyString {
  method?: string;
}
interface ISubdivision {
  id: XmlElem<number>;
  name: XmlElem<string>;
  parent_object_id: XmlElem<number | null>;
  level: XmlElem<number>;
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
interface ISubscription {
  id: number;
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
interface ISubscribeCurUserToCollaboratorInput {
  collaboratorId?: string;
}
interface IDeleteSubscribeCurUserToCollaboratorInput {
  collaboratorId?: string;
}
interface IFilteredCollaboratorsByRule {
  query: string;
  position_id: string;
  is_subscription: boolean;
}
interface IGetFilteredCollaboratorsByRuleInput {
  rule: IFilteredCollaboratorsByRule;
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
    const deps = selectAll<ISubdivision>(getSubdivisionsByQueryAndChild(query));

    const result: {
      id: number;
      name: string;
      parent_object_id: number;
      level: number;
    }[] = [];

    deps.map((item) => {
      result.push({
        name: RValue(item.name),
        id: RValue(item.id),
        parent_object_id: RValue(item.parent_object_id),
        level: RValue(item.level),
      });
    });

    return result;
  } catch (e) {
    err("getSubdivisionsByQuery", e);
  }
}

function getCollaboratorsSQLRule(
  query: string | undefined,
  positionParentId: number | undefined
) {
  const queryRule = query ? `c.fullname LIKE '%${query}%'` : null;
  const positionParentIdRule = positionParentId
    ? `c.position_parent_id = ${positionParentId}`
    : null;

  const ensureRules = [queryRule, positionParentIdRule].filter(
    (item) => item !== null
  );
  const selectRules = ensureRules.join(" AND ");
  return selectRules !== "" ? selectRules : null;
}

function getCollaboratorsByQueryWithoutSubscribe(
  query: string | undefined,
  positionParentId: number | undefined
) {
  try {
    const selectRules = getCollaboratorsSQLRule(query, positionParentId);

    const str = selectRules ? `${selectRules} AND ` : "";

    const deps = selectAll<ICollaborator>(`
      SELECT DISTINCT
        c.id,
        c.fullname
      FROM collaborators c
        LEFT JOIN subscriptions s ON c.id = s.document_id
      WHERE
        ${str}
        s.document_id IS NULL
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
    err("getCollaboratorsByQueryWithoutSubscribe", e);
  }
}

function getCollaboratorsByQueryWithSubscribe(
  query: string | undefined,
  positionParentId: number | undefined
) {
  try {
    const selectRules = getCollaboratorsSQLRule(query, positionParentId);

    const str = selectRules ? `WHERE ${selectRules}` : "";

    const deps = selectAll<ICollaborator>(`
      SELECT DISTINCT
        c.id,
        c.fullname
      FROM collaborators c
        INNER JOIN subscriptions s ON c.id = s.document_id
        ${str}
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
    err("getCollaboratorsByQueryWithSubscribe", e);
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

function subscribeCurUserToCollaborator(colId: number) {
  try {
    const new_doc = tools.new_doc_by_name("subscription");
    new_doc.BindToDb(DefaultDb);
    const new_doc_te: any = new_doc.TopElem;
    new_doc_te.document_id = colId;
    new_doc_te.person_id = curUserId;
    new_doc.Save();
  } catch (e) {
    err("subscribeCurUserToCollaborator", e);
  }
}

function deleteSubscribeCurUserToCollaborator(colId: number) {
  try {
    const subscription: ISubscription = selectOne(`
      SELECT 
        s.id 
      FROM subscriptions s
      WHERE s.document_id = ${colId} AND
        s.type = 'document'
      `);

    const subscriptionId = RValue(subscription.id);

    if (!isNumber(subscriptionId)) {
      throw new Error("Подписка не найдена");
    }

    DeleteDoc(UrlFromDocID(subscriptionId));
  } catch (e) {
    err("deleteSubscribeCurUserToCollaborator", e);
  }
}

function handler(bodyAny: any, method: string) {
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

  if (method === "getCollaboratorsByRule") {
    const body: IGetFilteredCollaboratorsByRuleInput = bodyAny;
    const rule = body.GetOptProperty("rule");
    if (!isObject(rule)) {
      err("route_error", "Отсутствует параметр rule в body");
    }

    if (!isBoolean(rule.is_subscription)) {
      err("route_error", "Отсутствует правило is_subscription в rule");
    }

    if (rule.is_subscription) {
      response.data = getCollaboratorsByQueryWithSubscribe(
        GetOptObjectProperty(rule, "query"),
        OptInt(GetOptObjectProperty(rule, "position_parent_id"))
      );
    } else {
      response.data = getCollaboratorsByQueryWithoutSubscribe(
        GetOptObjectProperty(rule, "query"),
        OptInt(GetOptObjectProperty(rule, "position_parent_id"))
      );
    }
  }

  if (method === "getCollaboratorData") {
    const body: ICollaboratorDataInput = bodyAny;
    const colId = OptInt(body.GetOptProperty("collaboratorId"));

    if (!isNumber(colId)) {
      err("route_error", "Отсутствует параметр collaboratorId в body");
    }

    response.data = getCollaboratorData(colId);
  }

  if (method === "subscribeCurUserToCollaborator") {
    const body: ISubscribeCurUserToCollaboratorInput = bodyAny;
    const colId = OptInt(body.GetOptProperty("collaboratorId"));

    if (!isNumber(colId)) {
      err("route_error", "Отсутствует параметр collaboratorId в body");
    }

    response.data = subscribeCurUserToCollaborator(colId);
  }

  if (method === "deleteSubscribeCurUserToCollaborator") {
    const body: IDeleteSubscribeCurUserToCollaboratorInput = bodyAny;
    const colId = OptInt(body.GetOptProperty("collaboratorId"));

    if (!isNumber(colId)) {
      err("route_error", "Отсутствует параметр collaboratorId в body");
    }

    response.data = deleteSubscribeCurUserToCollaborator(colId);
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
