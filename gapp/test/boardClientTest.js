async function TestBoardClient(AGORIC_NET = 'devnet') {
  const fetch = makeFetch();
  const config = await getNetworkConfig({ AGORIC_NET }, { fetch });
  const svc = await makeVstorageQueryService(config.apiAddrs[0], fetch);
  const bc = makeBoardClient(svc);
  const brand = await bc.readLatestHead('published.agoricNames.brand');
  console.log(brand);
  const agoricNames = await bc.provideAgoricNames();
  console.log(agoricNames);
}
