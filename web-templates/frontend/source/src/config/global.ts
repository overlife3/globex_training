declare global {
  interface Window {
    _app: {
      backendID: string; // предполагаю, что нужно использовать другое название переменной, потому что, если будет несколько шаблонов, то переменная будет постоянно переопределяться (как я понял)
      appPath: string;
      baseServerPath: string;
    };
  }
}

export const backendID = window._app?.backendID ?? "7209432476467294358";
export const BACKEND_URL = `http://localhost:80/custom_web_template.html?object_id=${backendID}`;
