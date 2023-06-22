async function TestNetworkConfig(AGORIC_NET = 'devnet') {
  const config = await getNetworkConfig({ AGORIC_NET }, { fetch: makeFetch() })
  console.log(config)
}
