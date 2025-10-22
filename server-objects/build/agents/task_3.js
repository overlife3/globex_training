/* --- utils --- */
/**
 * Выбирает все записи sql запроса
 * @param {string} query - sql-выражение
 */
function selectAll(query) {
    return ArraySelectAll(tools.xquery("sql: " + query + ""));
}
function selectOne(query, defaultObj) {
    return ArrayOptFirstElem(tools.xquery("sql: " + query + ""), defaultObj);
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
// получение данных из Excel файла
function GetExcelData() {
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
                var sourceList = OpenDoc(fileUrl, "format=excel");
                var workbook = sourceList.TopElem;
                return ArrayFirstElem(workbook);
            }
            catch (e) {
                alert("ОШИБКА: файл не найден либо не указан. " + e);
            }
        }
    }
    catch (e) {
        throw Error("GetExcelData -> " + e.message);
    }
}
// ------- Работа с "Должность" -------------
// Поиск должности по code, для того чтобы узнать имеется
// ли уже эта должность в платформе
function getExistPos(code) {
    return selectOne("\
        SELECT id\
        FROM positions\
        WHERE code = '" + code + "'\
    ", null);
}
// Создание документа должности
function createPos(data) {
    var new_doc = tools.new_doc_by_name("position");
    new_doc.BindToDb(DefaultDb);
    var new_doc_te = new_doc.TopElem;
    new_doc_te.name = data.name;
    new_doc_te.code = data.code;
    new_doc.Save();
    return new_doc_te.id;
}
// Обновление названия должности по id
function updatePos(id, newName) {
    var doc = tools.open_doc(id);
    var doc_te = doc.TopElem;
    doc_te.name = newName;
    doc.Save();
    return doc_te.id;
}
// работа над Должностями
function processingPos(data) {
    var pos = getExistPos(data.code);
    var posId = null;
    if (pos != null) {
        posId = updatePos(pos.id, data.name);
    }
    else {
        posId = createPos(data);
    }
    return posId;
}
// ------- Работа с "Сотрудники" -------------
// Поиск Сотрудника по имени, для того чтобы узнать имеется
// ли уже этот сотрудник в платформе
function getExistCol(data) {
    return selectOne("\
        SELECT id\
        FROM collaborators\
        WHERE fullname='" + data.name + "'\
    ", null);
}
// создание Сотрудника
function createCol(data) {
    var new_doc = tools.new_doc_by_name("collaborator");
    new_doc.BindToDb(DefaultDb);
    var new_doc_te = new_doc.TopElem;
    new_doc_te.fullname = data.name;
    new_doc_te.position_id = data.position_id;
    new_doc_te.position_name = data.position_name;
    new_doc.Save();
}
// Обновление сотрудника. Предполагает изменение должности
function updateCol(id, newData) {
    // обновляю сотрудника по имени. При обновлении может поменяться только должность
    var doc = tools.open_doc(id);
    var doc_te = doc.TopElem;
    doc_te.position_id = newData.position_id;
    doc_te.position_name = newData.position_name;
    doc.Save();
    return doc_te.id;
}
// работа над Сотрудниками
function processingCol(data) {
    var col = getExistCol(data);
    if (col != null) {
        updateCol(col.id, data);
    }
    else {
        createCol(data);
    }
}
function createDocumentDoc() {
    try {
        var data = GetExcelData();
        var rowCount = ArrayCount(data);
        for (i = 1; i < rowCount; i++) {
            obj = {
                name: data[i][0],
                position_name: data[i][1],
                position_code: data[i][2],
                position_parent_name: data[i][3],
                position_parent_code: data[i][4],
                org_name: data[i][5],
                org_code: data[i][6],
            };
            posId = processingPos({
                name: obj.position_name,
                code: obj.position_code,
            });
            processingCol({
                name: obj.name,
                position_id: posId,
                position_name: obj.position_name,
            });
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
    agentId: "7212848762131969513",
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
log('--- Начало. "Агент Получение и обработка данных из excel файла" ---');
main();
log('--- Конец. "Агент Получение и обработка данных из excel файла" ---');
