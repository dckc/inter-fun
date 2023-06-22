'use strict';
import { Fail } from './polyfill/ses.js';
import { Far } from './unmarshal.js';

/** @param {QueryDataResponseT} queryDataResponse */
const extractCapData = (queryDataResponse) => {
  const str = extractStreamCellValue(queryDataResponse);
  const x = harden(JSON.parse(str));
  assertCapData(x);
  return x;
};

const makeBoardContext = () => {
  /** @type {Map<string, {}>} */
  const idToValue = new Map();
  /** @type {Map<unknown, string>} */
  const valueToId = new Map();

  /**
   * Provide a remotable for each slot.
   *
   * @param {string} slot
   * @param {string} [iface] non-empty if present
   */
  const provide = (slot, iface) => {
    if (idToValue.has(slot)) {
      return idToValue.get(slot) || Fail`cannot happen`; // XXX check this statically?
    }
    if (!iface) throw Fail`1st occurrence must provide iface`;
    const json = { _: iface };
    // XXX ok to leave iface alone?
    /** @type {{}} */
    const value = Far(iface, { toJSON: () => json });
    idToValue.set(slot, value);
    valueToId.set(value, slot);
    return value;
  };

  /** Read-only board */
  const board = {
    /** @param {unknown} value */
    getId: (value) => {
      valueToId.has(value) || Fail`unknown value: ${value}`;
      return valueToId.get(value) || Fail`cannot happen`; // XXX check this statically?
    },

    /** @param {string} id */
    getValue: (id) => {
      assert.typeof(id, 'string');
      idToValue.has(id) || Fail`unknown id: ${id}`;
      return idToValue.get(id) || Fail`cannot happen`; // XXX check this statically?
    },
  };

  const marshaller = makeMarshal(board.getId, provide, {
    serializeBodyFormat: 'smallcaps',
  });

  return harden({
    board,
    register: provide,
    marshaller,
    /**
     * Unmarshall capData, creating a Remotable for each boardID slot.
     *
     * @type {(cd: import("@endo/marshal").CapData<string>) => unknown }
     */
    ingest: marshaller.fromCapData,
  });
};


// XXX where is this originally defined? vat-bank?
/**
 * @typedef {{
 *   brand: Brand<'nat'>,
 *   denom: string,
 *   displayInfo: DisplayInfo,
 *   issuer: Issuer<'nat'>,
 *   issuerName: string,
 *   proposedName: string,
 * }} VBankAssetDetail
 */
const kindInfo = /** @type {const} */ ({
  brand: {
    // shape: BrandShape,
    coerce: (x) => /** @type {Brand} */ (x),
  },
  oracleBrand: {
    // shape: BrandShape,
    coerce: (x) => /** @type {Brand} */ (x),
  },
  instance: {
    // shape: InstanceShape,
    coerce: (x) => /** @type {Instance} */ (x),
  },
  vbankAsset: {
    // shape: AssetDetailShape,
    coerce: (x) => /** @type {VBankAssetDetail} */ (x),
  },
});


/**
 * @param {ReturnType<typeof makeBoardContext>} boardCtx
 * @param {import('@agoric/cosmic-proto/vstorage/query.js').QueryClientImpl} queryService
 */
const makeAgoricNames = async (boardCtx, queryService) => {
  /**
   * @template T
   * @param {keyof typeof kindInfo} kind
   * @param {(x: any) => T} _coerce
   */
  const getKind = async (kind, _coerce) => {
    const queryDataResponse = await queryService.Data({
      path: `published.agoricNames.${kind}`,
    });
    const capData = extractCapData(queryDataResponse);
    const xs = boardCtx.ingest(capData);
    // mustMatch(xs, M.arrayOf([M.string(), kindInfo[kind].shape]));
    /** @type {[string, ReturnType<typeof _coerce>][]} */
    // @ts-expect-error runtime checked
    const entries = xs;
    const record = harden(Object.fromEntries(entries));
    return record;
  };
  const agoricNames = await deeplyFulfilledObject(
    harden({
      brand: getKind('brand', kindInfo.brand.coerce),
      oracleBrand: getKind('oracleBrand', kindInfo.oracleBrand.coerce),
      instance: getKind('instance', kindInfo.instance.coerce),
      vbankAsset: getKind('vbankAsset', kindInfo.vbankAsset.coerce),
    })
  );
  return agoricNames;
};

/**
 * A boardClient unmarshals vstorage query responses preserving object identiy.
 *
 * @param {import('@agoric/cosmic-proto/vstorage/query.js').QueryClientImpl} queryService
 */
const makeBoardClient = (queryService) => {
  const boardCtx = makeBoardContext();
  /** @type {Awaited<ReturnType<makeAgoricNames>>} */
  let agoricNames;

  return harden({
    queryService,
    board: boardCtx.board,
    provideAgoricNames: async () => {
      if (agoricNames) return agoricNames;
      agoricNames = await makeAgoricNames(boardCtx, queryService);
      return agoricNames;
    },
    /** @type {(path: string) => Promise<unknown>} */
    readLatestHead: (path) =>
      queryService
        .Data({ path })
        .then((response) => boardCtx.ingest(extractCapData(response))),
  });
};

export { makeProvideRemotable };
