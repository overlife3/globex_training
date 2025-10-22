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
        SELECT id, fullname\
        FROM collaborators\
        WHERE hire_date \
            BETWEEN DATEADD(DAY, -1, CAST(GETDATE() AS DATE)) \
            AND CAST(GETDATE() AS DATE)\
        ");
}
function createNotificationToCollaborator(colId, headOfficeId, col_te) {
    try {
        var isNotificationSended = tools.create_notification("inauguration", Int(colId), UrlAppendPath(global_settings.settings.portal_base_url, Param.IMAGE_PATH), Int(headOfficeId), col_te);
        if (isNotificationSended) {
            alert("Сообщение сформировано успешно");
        }
        else {
            alert("Сообщение не сформировано!");
        }
    }
    catch (err) {
        throw Error("createNotificationToCollaborator -> " + err.message);
    }
}
function createNotificationToManager(managerId, colsFullnameStr) {
    try {
        var isNotificationSended = tools.create_notification("inauguration_to_manager", Int(managerId), colsFullnameStr);
        if (isNotificationSended) {
            alert("Сообщение сформировано успешно");
        }
        else {
            alert("Сообщение не сформировано!");
        }
    }
    catch (err) {
        throw Error("createNotificationToManager -> " + err.message);
    }
}
function sendNotificationToManagers(managersId, colsFullNameList) {
    try {
        for (i = 0; i < ArrayCount(managersId); i++) {
            createNotificationToManager(managersId[i], colsFullNameList[i]);
        }
    }
    catch (err) {
        throw Error("sendNotificationToManagers -> " + err.message);
    }
}
function setManager_CollaboratorsFullnameList(
//функция мутирует входные массивы
managersId, managerId, colsFullNameList, colFullname) {
    try {
        var managerIdIndex = managersId.indexOf(managerId);
        if (managerIdIndex != -1) {
            colsFullNameList[managerIdIndex] =
                colsFullNameList[managerIdIndex] + ", " + colFullname;
        }
        else {
            managersId.push(managerId);
            colsFullNameList.push(colFullname);
        }
    }
    catch (err) {
        throw Error("setManager_CollaboratorsFullnameList -> " + err.message);
    }
}
/* --- start point --- */
function main() {
    try {
        var cols = getNewCollaborators();
        var managersId = [];
        var colsFullnameList = [];
        for (i = 0; i < ArrayCount(cols); i++) {
            doc_te = tools.open_doc(cols[i].id).TopElem;
            createNotificationToCollaborator(cols[i].id, Param.HEAD_OFFICE_ID, doc_te);
            managers = GetOptObjectProperty(doc_te, "func_managers");
            if (managers != undefined) {
                manager = ArrayOptFirstElem(managers, undefined);
                if (manager != undefined) {
                    setManager_CollaboratorsFullnameList(managersId, manager.person_id, colsFullnameList, cols[i].fullname);
                }
            }
        }
        sendNotificationToManagers(managersId, colsFullnameList);
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
    agentId: "7213256356558502101",
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
