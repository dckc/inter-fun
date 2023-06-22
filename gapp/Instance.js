
async function InstanceTable() {
  const fetch = makeFetch();
  console.warn('AMBIENT: SpreadsheetApp');
  const doc = SpreadsheetApp.getActiveSpreadsheet();

  const bc = await docBoard(doc, fetch)
  const agoricNames = await bc.provideAgoricNames();
  const instance = Object.entries(agoricNames.instance).map(([name, handle]) => {
    return {
      name,
      instanceId: bc.board.getId(handle),
    };
  });
  return recordsToTable(instance);
}
