async function docBoard(doc, fetch) {
  const AGORIC_NET = doc.getRangeByName('AGORIC_NET').getValue();
  const config = await getNetworkConfig({ AGORIC_NET }, { fetch });
  const svc = await makeVstorageQueryService(config.apiAddrs[0], fetch);
  const bc = makeBoardClient(svc);
  return bc;
}

const recordsToRows = records => {
  const [r0] = records;
  if (r0 === undefined) return [];
  const hd = Object.keys(r0);
  const rows = records.map(rec => hd.map(n => rec[n]));
  return { hd, rows };
}

const recordsToTable = records => {
  const { hd, rows } = recordsToRows(records);
  return [hd, ...rows];  
}

async function VBankAsset() {
  const fetch = makeFetch();
  console.warn('AMBIENT: SpreadsheetApp');
  const doc = SpreadsheetApp.getActiveSpreadsheet();

  const bc = await docBoard(doc, fetch)
  const agoricNames = await bc.provideAgoricNames();
  const assets = Object.values(agoricNames.vbankAsset).map(a => {
    return {
      issuerName: a.issuerName,
      denom: a.denom,
      brandId: bc.board.getId(a.brand),
      decimalPlaces: a.displayInfo.decimalPlaces,
    };
  });
  return recordsToTable(assets);
}
