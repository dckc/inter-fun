// @ts-check

const makeVstorageQueryService = async (endpoint, fetch) => {
  const getJSON = path => fetch(`${endpoint}${path}`, { keepalive: true }).then(res => res.json());
  return harden({
    Data: ({ path }) => getJSON(`/agoric/vstorage/data/${path}`),
    Children: ({ path }) => getJSON(`/agoric/vstorage/children/${path}`),
  })
};

/**
 * Extract one value from a the vstorage stream cell in a QueryDataResponse
 *
 * @param {QueryDataResponse} data
 * @param {number} [index=-1] index of the desired value in a deserialized stream cell
 *
 * XXX import('@agoric/cosmic-proto/vstorage/query').QueryDataResponse doesn't worksomehow
 * @typedef {Awaited<ReturnType<import('@agoric/cosmic-proto/vstorage/query.js').QueryClientImpl['Data']>>} QueryDataResponseT
 */
const extractStreamCellValue = (data, index = -1) => {
  const { value: serialized } = data;

  serialized.length > 0 || Fail`no StreamCell values: ${data}`;

  const streamCell = JSON.parse(serialized);
  if (!isStreamCell(streamCell)) {
    throw Fail`not a StreamCell: ${streamCell}`;
  }

  const { values } = streamCell;
  values.length > 0 || Fail`no StreamCell values: ${streamCell}`;

  const value = values.at(index);
  assert.typeof(value, 'string');
  return value;
};
harden(extractStreamCellValue);
