import { logConfig } from "../index";

export function log(message: string, type?: string) {
	type = IsEmptyValue(type) ? "INFO" : StrUpperCase(type);

	if (ObjectType(message) === "JsObject" || ObjectType(message) === "JsArray" || ObjectType(message) === "XmLdsSeq") {
		message = tools.object_to_text(message, "json");
	}

	const log = `[${type}][${logConfig.type}][${logConfig.objectId}]: ${message}`;
	LogEvent(logConfig.code, log);
}
