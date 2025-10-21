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
function getJSONData() {
    try {
        var fileUrl = null;
        try {
            fileUrl = Screen.AskFileOpen("", "Выбери файл&#09;*.*");
        }
        catch (err) {
            fileUrl = Param.SERVER_FILE_URL;
        }
        if (fileUrl != null) {
            try {
                return tools.read_object(LoadFileData(UrlToFilePath("x-local:/" + fileUrl + "")));
            }
            catch (e) {
                alert("ОШИБКА: файл не найден либо не указан. " + e);
            }
        }
    }
    catch (e) {
        throw Error("getJSONData -> " + e.message);
    }
}
function createDocumentDoc() {
    try {
        var data = getJSONData();
        for (i = 0; i < data.length; i++) {
            new_doc = tools.new_doc_by_name("document");
            new_doc.BindToDb(DefaultDb);
            new_doc_te = new_doc.TopElem;
            new_doc_te.name = data[i].name;
            new_doc_te.comment = data[i].description;
            new_doc_te.user_group_id = data[i].group_access_id;
            new_doc_te.create_date = Date(data[i].date);
            new_doc.Save();
        }
    }
    catch (err) {
        HttpError("createDocumentDoc", err);
    }
}
/* --- start point --- */
function main() {
    try {
        createDocumentDoc();
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
