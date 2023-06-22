// @ts-check
import '@endo/init';
import { makeMarshal } from '@endo/marshal';
import { arbPassable } from '@endo/pass-style/tools.js';
import { keyEQ } from '@endo/patterns';

import { testProp, fc } from '@fast-check/ava';

import { arbKey } from './arbPassableKey.js';
import { makeIdContext, makeUnmarshal } from '../gapp/unmarshal.js';

const opts = /** @type {const} */ ({ serializeBodyFormat: 'smallcaps' });

const makeIDPreservingMarshaller = () => {
  const valToSlot = new Map();
  const m = makeMarshal(
    (v) => {
      if (valToSlot.has(v)) {
        return valToSlot.get(v);
      }
      const ix = valToSlot.size;
      const boardID = `board0${ix}`;
      valToSlot.set(v, boardID);
      return boardID;
    },
    undefined,
    opts
  );
  return m;
};

testProp(
  'marshal.unserialize re-implementation handles all keys',
  [arbKey],
  (t, k) => {
    const m = makeIDPreservingMarshaller();
    const ctx = makeUnmarshal(makeIdContext());
    const { body, slots } = m.toCapData(k);
    console.log('@@@', { body, slots });
    const k2 = ctx.unserialize({ body, slots });
    const k3 = ctx.unserialize({ body, slots });
    t.deepEqual(k, k2, 'original deepEqual 1st unserialize');
    t.deepEqual(k, k3, 'original deepEqual 2nd unserialize');
    t.true(keyEQ(k2, k3), '1st, 2nd keyEQ');
  }
);
