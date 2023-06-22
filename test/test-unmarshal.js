// @ts-check
import '@endo/init';
import { makeMarshal } from '@endo/marshal';
import { keyEQ } from '@endo/patterns';

import { testProp, fc } from '@fast-check/ava';

// compare with:
// import { arbPassable } from '@endo/pass-style/tools.js';
import { arbKey } from './arbPassableKey.js';
import { makeMarshal as customMakeMarshal } from '../gapp/unmarshal.js';
import { makeProvideRemotable } from '../gapp/boardClient.js';

const smallcapsOpts = /** @type {const} */ ({
  serializeBodyFormat: 'smallcaps',
});

const makeProvideSlot = () => {
  const valToSlot = new Map();
  const provideSlot = (v) => {
    if (valToSlot.has(v)) {
      return valToSlot.get(v);
    }
    const ix = valToSlot.size;
    const boardID = `board0${ix}`;
    valToSlot.set(v, boardID);
    return boardID;
  };
  return provideSlot;
};

testProp(
  'marshal.unserialize re-implementation handles all keys',
  [arbKey],
  (t, k) => {
    // reference implementation
    const m = makeMarshal(makeProvideSlot(), undefined, smallcapsOpts);
    const { body, slots } = m.toCapData(k);

    // code under test
    const ctx = customMakeMarshal(undefined, makeProvideRemotable());

    const k2 = ctx.unserialize({ body, slots });
    const k3 = ctx.unserialize({ body, slots });
    t.deepEqual(k, k2, 'arbKey deepEqual 1st custom unmarshal');
    t.deepEqual(k, k3, 'arbKey deepEqual 2nd custom unserialize');
    t.true(keyEQ(k2, k3), '1st, 2nd custom unmarshal are keyEQ');
  }
);
