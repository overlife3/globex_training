import { ICollaborator, IFuncManager } from "../../types";

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
        SELECT id, fullname
        FROM collaborators
        WHERE hire_date 
            BETWEEN DATEADD(DAY, -1, CAST(GETDATE() AS DATE)) 
            AND CAST(GETDATE() AS DATE)
        `);
}

function createNotificationToCollaborator(
  colId: number,
  headOfficeId: number,
  col_te: XmlTopElem
) {
  try {
    const isNotificationSended = tools.create_notification(
      "inauguration",
      OptInt(colId),
      UrlAppendPath(
        global_settings.settings.portal_base_url,
        Param.IMAGE_PATH as string
      ),
      OptInt(headOfficeId),
      col_te
    );
    if (isNotificationSended) {
      alert("Сообщение сформировано успешно");
    } else {
      alert("Сообщение не сформировано!");
    }
  } catch (err) {
    throw Error("createNotificationToCollaborator -> " + err.message);
  }
}

function createNotificationToManager(
  managerId: number,
  colsFullnameStr: string
) {
  try {
    const isNotificationSended = tools.create_notification(
      "inauguration_to_manager",
      OptInt(managerId),
      colsFullnameStr
    );
    if (isNotificationSended) {
      alert("Сообщение сформировано успешно");
    } else {
      alert("Сообщение не сформировано!");
    }
  } catch (err) {
    throw Error("createNotificationToManager -> " + err.message);
  }
}

function sendNotificationToManagers(
  managersId: number[],
  colsFullNameList: string[]
) {
  try {
    for (let i = 0; i < ArrayCount(managersId); i++) {
      createNotificationToManager(managersId[i], colsFullNameList[i]);
    }
  } catch (err) {
    throw Error("sendNotificationToManagers -> " + err.message);
  }
}

function setManager_CollaboratorsFullnameList(
  //функция мутирует входные массивы
  managersId: number[],
  managerId: number,
  colsFullNameList: string[],
  colFullname: string
) {
  try {
    const managerIdIndex = managersId.indexOf(managerId);
    if (managerIdIndex != -1) {
      colsFullNameList[managerIdIndex] =
        colsFullNameList[managerIdIndex] + ", " + colFullname;
    } else {
      managersId.push(managerId);
      colsFullNameList.push(colFullname);
    }
  } catch (err) {
    throw Error("setManager_CollaboratorsFullnameList -> " + err.message);
  }
}

/* --- start point --- */
function main() {
  try {
    const cols = getNewCollaborators();
    const managersId: number[] = [];
    const colsFullnameList: string[] = [];

    for (let i = 0; i < ArrayCount(cols); i++) {
      const doc_te = tools.open_doc(cols[i].id).TopElem;
      createNotificationToCollaborator(
        cols[i].id,
        Param.HEAD_OFFICE_ID as number,
        doc_te
      );

      const managers = GetOptObjectProperty(doc_te, "func_managers") as
        | IFuncManager[]
        | undefined;

      if (managers != undefined) {
        const manager = ArrayOptFirstElem(managers, undefined) as
          | IFuncManager
          | undefined;
        if (manager != undefined) {
          setManager_CollaboratorsFullnameList(
            managersId,
            manager.person_id,
            colsFullnameList,
            cols[i].fullname
          );
        }
      }
    }

    sendNotificationToManagers(managersId, colsFullnameList);
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
  agentId: "7213256356558502101",
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

log('--- Начало. Агент "Отправка уведомлений" ---');

main();

log('--- Конец. Агент "Отправка уведомлений" ---');

export {};
