export const DEV_MODE = tools_web.is_true(customWebTemplate.access.enable_anonymous_access);

if (DEV_MODE) {
	Request.AddRespHeader("Access-Control-Allow-Origin", "*", false);
	Request.AddRespHeader("Access-Control-Expose-Headers", "Error-Message");
	Request.AddRespHeader("Access-Control-Allow-Headers", "origin, content-type, accept");
	Request.AddRespHeader("Access-Control-Allow-Credentials", "true");
}
