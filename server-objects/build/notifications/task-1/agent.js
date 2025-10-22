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
function getNewCollaborators() {
    return selectAll("\
        SELECT * \
        FROM collaborators\
        WHERE hire_date \
            BETWEEN DATEADD(DAY, -1, CAST(GETDATE() AS DATE)) \
            AND CAST(GETDATE() AS DATE)\
        ");
}
function createNotification(colId, headOfficeId) {
    var isNotificationSended = tools.create_notification("inauguration", Int(colId), UrlAppendPath(global_settings.settings.portal_base_url, Param.IMAGE_PATH), Int(headOfficeId));
    if (isNotificationSended) {
        alert("Сообщение сформировано успешно");
    }
    else {
        alert("Сообщение не сформировано!");
    }
}
function sendNotifications(cols, headOfficeId) {
    for (i = 0; i < ArrayCount(cols); i++) {
        // const colDoc = tools.open_doc()
        createNotification(cols[i].id, headOfficeId); // лучше сделать связь между сотрудником и руководителем
    }
}
/* --- start point --- */
function main() {
    try {
        var cols = getNewCollaborators();
        sendNotifications(cols, Param.HEAD_OFFICE_ID);
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
