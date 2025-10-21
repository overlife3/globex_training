import { ICollaborator } from "../types";

/* --- types --- */
interface IError {
  code: number;
  message: string;
}
interface IData {
  name: string;
  position_name: string;
  position_code: string;
  position_parent_name: string;
  position_parent_code: string;
  org_name: string;
  org_code: string;
}

/* --- utils --- */
/**
 * Выбирает все записи sql запроса
 * @param {string} query - sql-выражение
 */
function selectAll<T>(query: string) {
  return ArraySelectAll<T>(tools.xquery(`sql: ${query}`));
}

function selectOne<T>(query: string, defaultObj?: any) {
  return ArrayOptFirstElem<T>(tools.xquery(`sql: ${query}`), defaultObj);
}

/**
 * Создает поток ошибки с объектом error
 * @param {object} source - источник ошибки
 * @param {object} errorObject - объект ошибки
 */
function HttpError(source: string, error: IError) {
  throw new Error(source + " -> " + error);
}

/* --- logic --- */

// получение данных из Excel файла
function GetExcelData() {
  try {
    let fileUrl = null;
    try {
      fileUrl = Screen.AskFileOpen("", "Выбери файл&#09;*.*") as string;
    } catch (err) {
      fileUrl = Param.SERVER_FILE_URL as string;
    }
    if (fileUrl != null) {
      try {
        const sourceList = OpenDoc(fileUrl, "format=excel");
        const workbook = sourceList.TopElem as any;
        return ArrayFirstElem(workbook);
      } catch (e) {
        alert("ОШИБКА: файл не найден либо не указан. " + e);
      }
    }
  } catch (e) {
    throw Error("GetExcelData -> " + e.message);
  }
}

// ------- Работа с "Должность" -------------

// Поиск должности по code, для того чтобы узнать имеется
// ли уже эта должность в платформе
function getExistPos(code: string): { id: number } | null {
  return selectOne(
    `
        SELECT id
        FROM positions
        WHERE code = '${code}'
    `,
    null
  );
}

// Создание документа должности
function createPos(data: { name: string; code: string }): number {
  const new_doc = tools.new_doc_by_name("position");
  new_doc.BindToDb(DefaultDb);
  const new_doc_te: any = new_doc.TopElem;
  new_doc_te.name = data.name;
  new_doc_te.code = data.code;
  new_doc.Save();

  return new_doc_te.id;
}

// Обновление названия должности по id
function updatePos(id: number, newName: string): number {
  const doc = tools.open_doc(id);
  const doc_te = doc.TopElem as any;
  doc_te.name = newName;
  doc.Save();

  return doc_te.id;
}

// работа над Должностями
function processingPos(data: { name: string; code: string }) {
  const pos = getExistPos(data.code);

  let posId = null;
  if (pos != null) {
    posId = updatePos(pos.id, data.name);
  } else {
    posId = createPos(data);
  }
  return posId;
}

// ------- Работа с "Сотрудники" -------------

// Поиск Сотрудника по имени, для того чтобы узнать имеется
// ли уже этот сотрудник в платформе
function getExistCol(data: {
  name: string;
  position_id: number;
}): { id: number } | null {
  return selectOne(
    `
        SELECT id
        FROM collaborators
        WHERE name='${data.name}'
    `,
    null
  );
}

// Функция получения Имени Фамилии Отчества из строки
function getPartsName(name: string) {
  try {
    const partsArray = String(name).split(" ");

    if (ArrayCount(partsArray) == 3) {
      return {
        lastname: partsArray[0],
        firstname: partsArray[1],
        middlename: partsArray[2],
      };
    } else if (ArrayCount(partsArray) == 2) {
      return {
        lastname: partsArray[0],
        firstname: partsArray[1],
        middlename: null,
      };
    } else {
      throw new Error("Отсутствуют имя или фамилия.");
    }
  } catch (err) {
    HttpError("getPartsName", err);
  }
}

// создание Сотрудника
function createCol(data: {
  name: string;
  position_id: number;
  position_name: string;
}) {
  const new_doc = tools.new_doc_by_name("collaborator");
  new_doc.BindToDb(DefaultDb);
  const new_doc_te: any = new_doc.TopElem;
  new_doc_te.lastname = getPartsName(data.name).lastname;
  new_doc_te.firstname = getPartsName(data.name).firstname;
  if (getPartsName(data.name).middlename != null) {
    new_doc_te.middlename = getPartsName(data.name).middlename;
  }
  new_doc_te.position_id = data.position_id;
  new_doc_te.position_name = data.position_name;
  new_doc.Save();
}

// Обновление сотрудника. Предполагает изменение должности
function updateCol(
  id: number,
  newData: {
    position_id: number;
    position_name: string;
  }
) {
  // обновляю сотрудника по имени. При обновлении может поменяться только должность
  const doc = tools.open_doc(id);
  const doc_te = doc.TopElem as any;
  doc_te.position_id = newData.position_id;
  doc_te.position_name = newData.position_name;
  doc.Save();

  return doc_te.id;
}

// работа над Сотрудниками
function processingCol(data: {
  name: string;
  position_id: number;
  position_name: string;
}) {
  const col = getExistCol(data);
  if (col != null) {
    updateCol(col.id, data);
  } else {
    createCol(data);
  }
}

function createDocumentDoc() {
  try {
    const data = GetExcelData() as any;
    const rowCount = ArrayCount(data);

    for (let i = 1; i < rowCount; i++) {
      const obj: IData = {
        name: data[i][0],
        position_name: data[i][1],
        position_code: data[i][2],
        position_parent_name: data[i][3],
        position_parent_code: data[i][4],
        org_name: data[i][5],
        org_code: data[i][6],
      };
      const posId = processingPos({
        name: obj.position_name,
        code: obj.position_code,
      });
      processingCol({
        name: obj.name,
        position_id: posId,
        position_name: obj.position_name,
      });
    }
  } catch (err) {
    HttpError("createDocumentDoc", err as IError);
  }
}

/* --- start point --- */
function main() {
  try {
    createDocumentDoc();
  } catch (err) {
    log("Выполнение прервано из-за ошибки: main -> " + err, "error");
  }
}

/* --- system --- */
const GLOBAL = {
  IS_DEBUG: tools_web.is_true(Param.IS_DEBUG),
};

const logConfig = {
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
function log(message: string, type?: string) {
  type = IsEmptyValue(type) ? "INFO" : StrUpperCase(type);

  if (
    ObjectType(message) === "JsObject" ||
    ObjectType(message) === "JsArray" ||
    ObjectType(message) === "XmLdsSeq"
  ) {
    message = tools.object_to_text(message, "json");
  }

  const log = `[${type}][${logConfig.type}][${logConfig.agentId}]: ${message}`;
  if (LdsIsServer) {
    LogEvent(logConfig.code, log);
  } else if (GLOBAL.IS_DEBUG) {
    // eslint-disable-next-line no-alert
    alert(log);
  }
}

log("--- Начало. Агент {название агента} ---");

main();

log("--- Конец. Агент {название агента} ---");

export {};
