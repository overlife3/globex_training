<%
function isBoolean(value) {
    return DataType(value) == "bool";
}
function isNumber(value) {
    return DataType(value) == "integer";
}
function isObject(value) {
    return DataType(value) == "object" && ObjectType(value) == "JsObject";
}
function isString(value) {
    return DataType(value) == "string";
}
function selectAll(query) {
    return ArraySelectAll(tools.xquery("sql: " + query + ""));
}
function selectOne(query, defaultObj) {
    return ArrayOptFirstElem(tools.xquery("sql: " + query + ""), defaultObj);
}
getSubdivisionsByQueryAndChild = function _1(query) { return "\
WITH subdivision_hierarchy AS (\
    SELECT \
        id,\
        name,\
        parent_object_id,\
        0 as level\
    FROM subdivisions \
    WHERE name LIKE '%" + query + "%' \
    \
    UNION ALL\
\
    SELECT \
        child.id,\
        child.name,\
        child.parent_object_id,\
        parent.level + 1 as level\
    FROM subdivisions child\
     INNER JOIN subdivision_hierarchy parent ON child.parent_object_id = parent.id\
)\
SELECT DISTINCT\
    id,\
    name, \
    parent_object_id,\
    level\
FROM subdivision_hierarchy\
ORDER BY \
    name"; };
function log(message, type) {
    type = IsEmptyValue(type) ? "INFO" : StrUpperCase(type);
    if (ObjectType(message) === "JsObject" || ObjectType(message) === "JsArray" || ObjectType(message) === "XmLdsSeq") {
        message = tools.object_to_text(message, "json");
    }
    var log = "[" + type + "][" + logConfig.type + "][" + logConfig.objectId + "]: " + message + "";
    LogEvent(logConfig.code, log);
}
DEV_MODE = tools_web.is_true(customWebTemplate.access.enable_anonymous_access);
function map(array, callback) {
    var result = [];
    for (i = 0; i < ArrayCount(array); i++) {
        result.push(callback(array[i], i, array));
    }
    return result;
}
function filter(array, predicate) {
    var result = [];
    for (i = 0; i < ArrayCount(array); i++) {
        if (predicate(array[i], i, array)) {
            result.push(array[i]);
        }
    }
    return result;
}
function find(array, predicate, thisArg) {
    if (array == null)
        throw new Error('"this" is null or undefined');
    var len = ArrayCount(array);
    for (k = 0; k < len; k++) {
        value = array[k];
        if (predicate(value, k, array, thisArg))
            return value;
    }
    return undefined;
}
var DEV_MODE = tools_web.is_true(customWebTemplate.access.enable_anonymous_access);
if (DEV_MODE) {
    Request.AddRespHeader("Access-Control-Allow-Origin", "*", false);
    Request.AddRespHeader("Access-Control-Expose-Headers", "Error-Message");
    Request.AddRespHeader("Access-Control-Allow-Headers", "origin, content-type, accept");
    Request.AddRespHeader("Access-Control-Allow-Credentials", "true");
}
Request.RespContentType = "application/json";
Request.AddRespHeader("Content-Security-Policy", "frame-ancestors 'self'");
Request.AddRespHeader("X-XSS-Protection", "1");
Request.AddRespHeader("X-Frame-Options", "SAMEORIGIN");
function func() {
    return "str".split("");
}
/* --- utils --- */
function getParam(name, defaultVal) {
    if (defaultVal === void 0) { defaultVal = "undefined"; }
    return tools_web.get_web_param(curParams, name, defaultVal, true, "");
}
function err(source, error, text) {
    if (text === void 0) { text = ""; }
    throw new Error("" + source + " -> " + (text ? text + " " : "") + "" + error + "");
}
/* --- global --- */
var curUserId = DEV_MODE
    ? OptInt("7000000000000000")
    : OptInt(curUserID);
var DEBUG_MODE = tools_web.is_true(getParam("IS_DEBUG", undefined));
/* --- logic --- */
function getSubdivisionsByQuery(query) {
    try {
        var deps = selectAll(getSubdivisionsByQueryAndChild(query));
        var result_1 = [];
        map(deps, function _2(item) {
            result_1.push({
                name: RValue(item.name),
                id: RValue(item.id),
                parent_object_id: RValue(item.parent_object_id),
                level: RValue(item.level),
            });
        });
        return result_1;
    }
    catch (e) {
        err("getSubdivisionsByQuery", e);
    }
}
function getCollaboratorsSQLRule(query, positionParentId) {
    var queryRule = query ? "c.fullname LIKE '%" + query + "%'" : null;
    var positionParentIdRule = positionParentId
        ? "c.position_parent_id = " + positionParentId + "" : null;
    var ensureRules = filter([queryRule, positionParentIdRule], function _3(item) { return item !== null; });
    var selectRules = ensureRules.join(" AND ");
    return selectRules !== "" ? selectRules : null;
}
function getCollaboratorsByQueryWithoutSubscribe(query, positionParentId) {
    try {
        var selectRules = getCollaboratorsSQLRule(query, positionParentId);
        var str = selectRules ? "" + selectRules + " AND " : "";
        var deps = selectAll("\
      SELECT DISTINCT\
        c.id,\
        c.fullname\
      FROM collaborators c\
        LEFT JOIN subscriptions s ON c.id = s.document_id\
      WHERE\
        " + str + "\
        s.document_id IS NULL\
    ");
        var result_2 = [];
        map(deps, function _4(item) { return result_2.push({
            fullname: RValue(item.fullname),
            id: RValue(item.id),
        }); });
        return result_2;
    }
    catch (e) {
        err("getCollaboratorsByQueryWithoutSubscribe", e);
    }
}
function getCollaboratorsByQueryWithSubscribe(query, positionParentId) {
    try {
        var selectRules = getCollaboratorsSQLRule(query, positionParentId);
        var str = selectRules ? "WHERE " + selectRules + "" : "";
        var deps = selectAll("\
      SELECT DISTINCT\
        c.id,\
        c.fullname\
      FROM collaborators c\
        INNER JOIN subscriptions s ON c.id = s.document_id\
        " + str + "\
    ");
        var result_3 = [];
        map(deps, function _5(item) { return result_3.push({
            fullname: RValue(item.fullname),
            id: RValue(item.id),
        }); });
        return result_3;
    }
    catch (e) {
        err("getCollaboratorsByQueryWithSubscribe", e);
    }
}
function getCollaboratorData(colId) {
    try {
        var data = tools.open_doc(colId).TopElem;
        var changeLogsArray = ArrayDirect(GetOptObjectProperty(data, "change_logs"));
        var historyStatesArray = ArrayDirect(GetOptObjectProperty(data, "history_states"));
        var result_4 = {
            change_logs: [],
            history_states: [],
        };
        var statesList_1 = ArrayDirect(GetOptObjectProperty(lists.person_states, "person_state"));
        map(changeLogsArray, function _6(item) { return result_4.change_logs.push({
            date: RValue(item.date),
            org_name: RValue(item.org_name),
            position_name: RValue(item.position_name),
            position_parent_name: RValue(item.position_parent_name),
        }); });
        map(historyStatesArray, function _7(item) { return result_4.history_states.push({
            finish_date: RValue(item.finish_date),
            start_date: RValue(item.start_date),
            state: RValue(GetOptObjectProperty(find(statesList_1, function _8(state) { return RValue(state.id) == RValue(item.state_id); }), "name")),
        }); });
        return result_4;
    }
    catch (e) {
        err("getCollaboratorData", e);
    }
}
function getCollaboratorsBySubdivisionId(subId) {
    try {
        var deps = selectAll("\
      SELECT\
        c.id,\
        c.fullname\
      FROM collaborators c\
      WHERE c.position_parent_id=" + subId + "\
    ");
        var result_5 = [];
        map(deps, function _9(item) { return result_5.push({
            fullname: RValue(item.fullname),
            id: RValue(item.id),
        }); });
        return result_5;
    }
    catch (e) {
        err("getSubdivisionsByQuery", e);
    }
}
function subscribeCurUserToCollaborator(colId) {
    try {
        var new_doc = tools.new_doc_by_name("subscription");
        new_doc.BindToDb(DefaultDb);
        var new_doc_te = new_doc.TopElem;
        new_doc_te.document_id = colId;
        new_doc_te.person_id = curUserId;
        new_doc.Save();
    }
    catch (e) {
        err("subscribeCurUserToCollaborator", e);
    }
}
function deleteSubscribeCurUserToCollaborator(colId) {
    try {
        var subscription = selectOne("\
      SELECT \
        s.id \
      FROM subscriptions s\
      WHERE s.document_id = " + colId + " AND\
        s.type = 'document'\
      ");
        var subscriptionId = RValue(subscription.id);
        if (!isNumber(subscriptionId)) {
            throw new Error("Подписка не найдена");
        }
        DeleteDoc(UrlFromDocID(subscriptionId));
    }
    catch (e) {
        err("deleteSubscribeCurUserToCollaborator", e);
    }
}
function handler(bodyAny, method) {
    var response = { success: true, error: false, data: [] };
    if (method === "getSubdivisionsByQuery") {
        var body = bodyAny;
        var query = body.GetOptProperty("query");
        if (!isString(query)) {
            err("route_error", "Отсутствует параметр query в body");
        }
        response.data = getSubdivisionsByQuery(query);
    }
    if (method === "getCollaboratorsBySubdivisionId") {
        var body = bodyAny;
        var subdivisionId = OptInt(body.GetOptProperty("subdivisionId"));
        if (!isNumber(subdivisionId)) {
            err("route_error", "Отсутствует параметр subdivisionId в body");
        }
        response.data = getCollaboratorsBySubdivisionId(subdivisionId);
    }
    if (method === "getCollaboratorsByRule") {
        var body = bodyAny;
        var rule = body.GetOptProperty("rule");
        if (!isObject(rule)) {
            err("route_error", "Отсутствует параметр rule в body");
        }
        if (!isBoolean(rule.is_subscription)) {
            err("route_error", "Отсутствует правило is_subscription в rule");
        }
        if (rule.is_subscription) {
            response.data = getCollaboratorsByQueryWithSubscribe(GetOptObjectProperty(rule, "query"), OptInt(GetOptObjectProperty(rule, "position_parent_id")));
        }
        else {
            response.data = getCollaboratorsByQueryWithoutSubscribe(GetOptObjectProperty(rule, "query"), OptInt(GetOptObjectProperty(rule, "position_parent_id")));
        }
    }
    if (method === "getCollaboratorData") {
        var body = bodyAny;
        var colId = OptInt(body.GetOptProperty("collaboratorId"));
        if (!isNumber(colId)) {
            err("route_error", "Отсутствует параметр collaboratorId в body");
        }
        response.data = getCollaboratorData(colId);
    }
    if (method === "subscribeCurUserToCollaborator") {
        var body = bodyAny;
        var colId = OptInt(body.GetOptProperty("collaboratorId"));
        if (!isNumber(colId)) {
            err("route_error", "Отсутствует параметр collaboratorId в body");
        }
        response.data = subscribeCurUserToCollaborator(colId);
    }
    if (method === "deleteSubscribeCurUserToCollaborator") {
        var body = bodyAny;
        var colId = OptInt(body.GetOptProperty("collaboratorId"));
        if (!isNumber(colId)) {
            err("route_error", "Отсутствует параметр collaboratorId в body");
        }
        response.data = deleteSubscribeCurUserToCollaborator(colId);
    }
    return response;
}
/* --- start point --- */
function main(req, res) {
    try {
        var body = tools.read_object(req.Body);
        var method = tools_web.convert_xss(body.GetOptProperty("method"));
        if (IsEmptyValue(method) || method === "undefined") {
            err("main", "Не найдено поле method в body");
        }
        var payload = handler(body, method);
        res.Write(tools.object_to_text(payload, "json"));
    }
    catch (error) {
        if (DEV_MODE) {
            Response.Write(error);
        }
        else {
            log("[uid:" + curUserId + "] -> " + error + "", "error");
            Request.SetRespStatus(500, "");
            var res_1 = {
                data: [],
                success: false,
                error: true,
                message: "Произошла ошибка на стороне сервера",
                log: logConfig.code,
            };
            Response.Write(tools.object_to_text(res_1, "json"));
        }
    }
}
var logConfig = {
    code: "globex_web_log",
    type: "web",
    objectId: customWebTemplate.id,
};
EnableLog(logConfig.code, DEBUG_MODE);
main(Request, Response);

%>