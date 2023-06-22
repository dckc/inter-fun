const BlockInfo = async () => {
  const fetch = makeFetch();
  console.warn('AMBIENT: SpreadsheetApp');
  const doc = SpreadsheetApp.getActiveSpreadsheet();

  const AGORIC_NET = doc.getRangeByName('AGORIC_NET').getValue();
  const config = await getNetworkConfig({ AGORIC_NET }, { fetch });
  const [rpc] = config.rpcAddrs;
  const status = await fetch(`${rpc}/status`).then(res => res.json());
  const {
    result: {
      node_info: { network },
      sync_info: { latest_block_height: block_height, latest_block_time: time },
    },
  } = status;
  const block_time = new Date(Date.parse(time));
  return recordsToTable([{ block_height, block_time, network }])
};