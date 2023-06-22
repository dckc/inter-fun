async function TestVStorage(AGORIC_NET = 'devnet') {
  const fetch = makeFetch();
  const config = await getNetworkConfig({ AGORIC_NET }, { fetch });
  const svc = await makeVstorageQueryService(config.apiAddrs[0], fetch);
  const cresp = await svc.Children({ path: 'published.agoricNames' });
  console.log(cresp);
  const dresp = await svc.Data({ path: 'published.agoricNames.brand' });
  console.log(dresp);

  const extracted = extractStreamCellValue(dresp);
  console.log(extracted);
}
