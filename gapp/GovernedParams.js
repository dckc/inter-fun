const getInvitationDetails = amt => {
  assert(amt.value.length === 1);
  return amt.value[0];
};

const fmt = {
    /**
   * @param {NatValue} value
   * @param {number} decimalPlaces
   */
  decimal: (value, decimalPlaces) => {
    const rawNumeral = `${value}`;
    const digits = rawNumeral.length;
    const whole =
      digits > decimalPlaces
        ? rawNumeral.slice(0, digits - decimalPlaces)
        : '0';
    const frac = ('0'.repeat(decimalPlaces) + rawNumeral)
      .slice(-decimalPlaces)
      .replace(/0+$/, '');
    const dot = frac.length > 0 ? '.' : '';
    return `${whole}${dot}${frac}`;
  },

  /** @param {Amount<'nat'>} amt */
  amount: ({ brand, value }, { oracleBrand, vbankAsset }) => {
    let issuerName;
    let decimalPlaces;
    const detail = Object.values(vbankAsset).find(a => a.brand === brand);
    if (detail) {
      decimalPlaces = detail?.displayInfo?.decimalPlaces || 0;
      issuerName = detail.issuerName;
    } else {
      const obentry = Object.entries(oracleBrand).find(([_name, obrand]) => obrand === brand);
      // console.log({ obentry, brand, oracleBrand })
      assert(detail || obentry, `brand??? ${brand}`);
      decimalPlaces = 6; // XXX not published in vstorage
      issuerName = obentry[0];
    }
    return [Number(fmt.decimal(value, decimalPlaces)), issuerName];
  },
}

const paramEntryToRow = {
  [ParamTypes.AMOUNT]: (name, value, { vbankAsset, oracleBrand }) => {
    const [mag, brandName] = fmt.amount(value, { vbankAsset, oracleBrand });
    return [name, mag, brandName];
  },
  [ParamTypes.INVITATION]: (name, value, { instance }) => {
    const d = getInvitationDetails(value);
    const contractEntry = entries(instance).find(
      ([n, v]) => v === d.instance,
    );
    return [name, contractEntry ? contractEntry[0] : null, d.description];
  },
  [ParamTypes.NAT]: (name, value) => {
    // TODO: BP / basis points for DiscountStep, LowestRate, StartingRate
    const n = Number(value);
    assert(Number.isSafeInteger(n), 'overflow');
    return [name, n];
  },
  [ParamTypes.RATIO]: (name, value, { vbankAsset, oracleBrand }) => {
    const top = fmt.amount(value.numerator, { vbankAsset, oracleBrand });
    const bot = fmt.amount(value.denominator, { vbankAsset, oracleBrand });
    const x = top[0] / bot[0];
    if (value.numerator.brand === value.denominator.brand) {
      return [name, x];
    }
    return [name, x, top[1], bot[1]];
  },
  [ParamTypes.RELATIVE_TIME]: (name, value) => {
    return [name, Number(value.relValue)]
  }
}

/**
 * TODO: how to add help text?
 */
async function GovernedParams(path = 'published.auction.governance') {
  const fetch = makeFetch();
  console.warn('AMBIENT: SpreadsheetApp');
  const doc = SpreadsheetApp.getActiveSpreadsheet();

  const bc = await docBoard(doc, fetch)
  const agoricNames = await bc.provideAgoricNames();

  const params = await bc.readLatestHead(path).then(({ current }) => current);
  const rows = Object.entries(params).map(([name, { type, value }]) => {
    const coerce = paramEntryToRow[type];
    const row = coerce ? coerce(name, value, agoricNames) : [name, type, JSON.stringify(value, bigintReplacer)];
    return row;
  });
  return rows;
}
