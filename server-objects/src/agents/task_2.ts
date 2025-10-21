import { ICollaborator } from "../types";

/* --- types --- */
interface IError {
  code: number;
  message: string;
}
interface IData {
  name: string;
  description: string;
  date: string;
  group_access_id: number;
}

/* --- utils --- */
/**
 * Выбирает все записи sql запроса
 * @param {string} query - sql-выражение
 */
function selectAll<T>(query: string) {
  return ArraySelectAll<T>(tools.xquery(`sql: ${query}`));
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

function getJSONData() {
  try {
    let fileUrl: string | null = null;
    try {
      fileUrl = Screen.AskFileOpen("", "Выбери файл&#09;*.*");
    } catch (err) {
      fileUrl = Param.SERVER_FILE_URL as string;
    }
    if (fileUrl != null) {
      try {
        return tools.read_object(LoadFileData(UrlToFilePath(fileUrl)));
      } catch (e) {
        alert("ОШИБКА: файл не найден либо не указан. " + e);
      }
    }
  } catch (e) {
    throw Error("getJSONData -> " + e.message);
  }
}

function createDocumentDoc() {
  try {
    const data = getJSONData() as IData[];
    for (let i = 0; i < data.length; i++) {
      const new_doc = tools.new_doc_by_name("document");
      new_doc.BindToDb(DefaultDb);
      const new_doc_te: any = new_doc.TopElem;
      new_doc_te.name = data[i].name;
      new_doc_te.comment = data[i].description;
      new_doc_te.user_group_id = data[i].group_access_id;
      new_doc_te.create_date = Date(data[i].date);
      new_doc.Save();
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
  agentId: "7211871962498852513",
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

log('--- Начало. Агент "Добавление разделов портала по JSON файлу" ---');

main();

log('--- Конец. Агент "Добавление разделов портала по JSON файлу" ---');

export {};
