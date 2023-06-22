const bigintReplacer = (_n, v) => typeof v === 'bigint' ? Number(v) : v;

const infoEntryToRow = {
  ...paramEntryToRow,
  absoluteTime: (name, value) => {
    const when = new Date(Number(value.absValue) * 1000);
    return [name, when];
  },
  // TODO: BP / basis points, ...
};

async function Metrics(path = 'published.priceFeed.ATOM-USD_price_feed' /* 'published.auction.metrics' */) {
  const fetch = makeFetch();
  console.warn('AMBIENT: SpreadsheetApp');
  const doc = SpreadsheetApp.getActiveSpreadsheet();

  const bc = await docBoard(doc, fetch);
  const agoricNames = await bc.provideAgoricNames();

  const metrics = await bc.readLatestHead(path);
  const [_published, kind] = path.split('.');
  return Object.entries(metrics).map(([field, value]) => {
    if (value == null) return [field];
    const type = findFieldType(doc, kind, field);
    const coerce = infoEntryToRow[type];
    // console.log('Metrics', { field, type, value, coerce });
    const row = coerce ? coerce(field, value, agoricNames) : [field, type, JSON.stringify(value, bigintReplacer)];
    return row;
  });
}
