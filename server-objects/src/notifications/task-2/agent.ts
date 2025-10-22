import { ICollaborator } from "../../types";

/* --- types --- */
interface IError {
  code: number;
  message: string;
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

function getNewCollaborators(): ICollaborator[] {
  return selectAll(`
        SELECT * 
        FROM collaborators
        WHERE hire_date 
            BETWEEN DATEADD(DAY, -1, CAST(GETDATE() AS DATE)) 
            AND CAST(GETDATE() AS DATE)
        `);
}

function createNotification(colId: number, headOfficeId: number) {
  const isNotificationSended = tools.create_notification(
    "inauguration",
    Int(colId),
    UrlAppendPath(
      global_settings.settings.portal_base_url,
      Param.IMAGE_PATH as string
    ),
    Int(headOfficeId)
  );
  if (isNotificationSended) {
    alert("Сообщение сформировано успешно");
  } else {
    alert("Сообщение не сформировано!");
  }
}

function sendNotifications(cols: ICollaborator[], headOfficeId: number) {
  for (let i = 0; i < ArrayCount(cols); i++) {
    createNotification(cols[i].id, headOfficeId);
  }
}

/* --- start point --- */
function main() {
  try {
    const cols = getNewCollaborators();
    sendNotifications(cols, Param.HEAD_OFFICE_ID as number);
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
