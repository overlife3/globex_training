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

  const adaptationArrCount = ArrayCount(adaptationArr);
  for (let i = 0; i < adaptationArrCount; i++) {
    const doc_te = tools.open_doc(adaptationArr[i].id).TopElem;
    const _tasks = GetOptObjectProperty(doc_te, "tasks") as
      | { status: string }[]
      | undefined;
    if (
      _tasks != undefined ||
      ArrayOptFind(_tasks, "This.status == 'passed'") != undefined
    ) {
      resArray.push(adaptationArr);
    }
  }
  const RESULT = resArray; // const потом убрать
} catch (err) {
  const ERROR = err; // const потом убрать
}
