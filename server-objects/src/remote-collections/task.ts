const getPersonIdFromPersonalReservesSQL = `
    SELECT * 
    FROM career_reserves 
    WHERE position_type = 'adaptation'
`;

try {
  const adaptationArr = ArraySelectAll<{ id: number }>(
    tools.xquery(`sql: ${getPersonIdFromPersonalReservesSQL}`)
  );

  const resArray = [];

  for (let i = 0; i < ArrayCount(adaptationArr); i++) {
    let isAllTasksPassed = true;

    const doc_te = tools.open_doc(adaptationArr[i].id).TopElem;
    const _tasks = GetOptObjectProperty(doc_te, "tasks") as
      | { status: string }[]
      | undefined;
    if (_tasks != undefined) {
      for (let j = 0; j < ArrayCount(_tasks); j++) {
        if (_tasks[j].status != "passed") {
          isAllTasksPassed = false;
          break;
        }
      }
    }
    if (isAllTasksPassed) {
      resArray.push(adaptationArr[i]);
    }
  }
  const RESULT = resArray; // const потом убрать
} catch (err) {
  const ERROR = err; // const потом убрать
}
