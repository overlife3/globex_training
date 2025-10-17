function map(array, callback) {
    var result = [];
    for (i = 0; i < ArrayCount(array); i++) {
        result.push(callback(array[i], i, array));
    }
    return result;
}
/* --- utils --- */
/**
 * Выбирает все записи sql запроса
 * @param {string} query - sql-выражение
 */
function selectAll(query) {
    return ArraySelectAll(tools.xquery("sql: " + query + ""));
}
/**
 * Создает поток ошибки с объектом error
 * @param {object} source - источник ошибки
 * @param {object} errorObject - объект ошибки
 */
function HttpError(source, error) {
    throw new Error(source + " -> " + error);
}
/* --- logic --- */
function setCollaboratorsRandomPass() {
    try {
        var collaborators_id = map(OBJECTS_ID_STR.split(";"), function _1(item) { return OptInt(item); });
        for (i = 0; i < collaborators_id.length; i++) {
            collaborator_id = collaborators_id[i];
            collaborator = tools.open_doc(collaborator_id);
            collaborator_te = collaborator.TopElem;
            collaborator_te.password = tools.random_string(6);
            collaborator.Save();
        }
    }
    catch (err) {
        HttpError("setCollaboratorsRandomPass", err);
    }
}
/* --- start point --- */
function main() {
    try {
        setCollaboratorsRandomPass();
    }
    catch (err) {
        log("Выполнение прервано из-за ошибки: main -> " + err, "error");
    }
}
/* --- system --- */
var GLOBAL = {
    IS_DEBUG: tools_web.is_true(Param.IS_DEBUG),
};
var logConfig = {
    code: "globex_log",
    type: "AGENT",
    agentId: "",
};
EnableLog(logConfig.code, GLOBAL.IS_DEBUG);
/**
 * Вывод сообщения в журнал
 * @param {string} message - Сообщение
 * @param {string} type - Тип сообщения info/error
 */
function log(message, type) {
    type = IsEmptyValue(type) ? "INFO" : StrUpperCase(type);
    if (ObjectType(message) === "JsObject" ||
        ObjectType(message) === "JsArray" ||
        ObjectType(message) === "XmLdsSeq") {
        message = tools.object_to_text(message, "json");
    }
    var log = "[" + type + "][" + logConfig.type + "][" + logConfig.agentId + "]: " + message + "";
    if (LdsIsServer) {
        LogEvent(logConfig.code, log);
    }
    else if (GLOBAL.IS_DEBUG) {
        alert(log);
    }
}
log("--- Начало. Агент {название агента} ---");
main();
log("--- Конец. Агент {название агента} ---");
