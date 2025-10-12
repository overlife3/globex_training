<%
function isNumber(value) {
    return DataType(value) == "integer";
}
function isString(value) {
    return DataType(value) == "string";
}
function selectAll(query) {
    return ArraySelectAll(tools.xquery("sql: " + query + ""));
}
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
        var deps = selectAll("\
			SELECT\
				s.id,\
				s.name\
			FROM subdivisions s\
			WHERE s.name LIKE '%" + query + "%'\
		");
        var result_1 = [];
        map(deps, function _1(item) { return result_1.push({
            name: RValue(item.name),
            id: RValue(item.id),
        }); });
        return result_1;
    }
    catch (e) {
        err("getSubdivisionsByQuery", e);
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
        var result_2 = [];
        map(deps, function _2(item) { return result_2.push({
            fullname: RValue(item.fullname),
            id: RValue(item.id),
        }); });
        return result_2;
    }
    catch (e) {
        err("getSubdivisionsByQuery", e);
    }
}
function handler(bodyAny, method) {
    var response = { success: true, error: false, data: [] };
    if (method === "getSubdivisionsByQuery") {
        var body = bodyAny;
        var query = body.GetOptProperty("query");
        if (!isString(query)) {
            err("route_error", "Отсутствует параметр query в query-params");
        }
        response.data = getSubdivisionsByQuery(query);
    }
    else if (method === "getCollaboratorsBySubdivisionId") {
        var body = bodyAny;
        var subdivisionId = body.GetOptProperty("subdivisionId");
        var a = OptInt(subdivisionId);
        if (!isNumber(OptInt(subdivisionId))) {
            err("route_error", "Отсутствует параметр subdivisionId в query-params");
        }
        response.data = getCollaboratorsBySubdivisionId(a);
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