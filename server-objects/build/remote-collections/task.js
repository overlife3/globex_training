var getPersonIdFromPersonalReservesSQL =
  "\
    SELECT * \
    FROM career_reserves \
    WHERE position_type = 'adaptation'\
";
try {
  var adaptationArr = ArraySelectAll(
    tools.xquery("sql: " + getPersonIdFromPersonalReservesSQL + "")
  );
  var resArray = [];
  for (i = 0; i < ArrayCount(adaptationArr); i++) {
    isAllTasksPassed = true;
    doc_te = tools.open_doc(adaptationArr[i].id).TopElem;
    _tasks = GetOptObjectProperty(doc_te, "tasks");
    if (_tasks != undefined) {
      for (j = 0; j < ArrayCount(_tasks); j++) {
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
  RESULT = resArray;
} catch (err) {
  ERROR = err;
}
