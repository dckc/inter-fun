// @ts-check
import { Far } from '@endo/far';
import { fc } from '@fast-check/ava';
import { makeTagged } from '@endo/marshal';

const arbPrim = fc.oneof(
  fc.constant(undefined),
  fc.constant(null),
  fc.boolean(),
  fc.float(),
  fc.bigInt(),
  fc.string(),
  fc.string().map((n) => Symbol.for(n)) // TODO: well-known symbols
);

const arbRemotable = fc.constantFrom(
  ...['Alice', 'Bob', 'Carol', 'Dave', 'Eve', 'Fred'].map((farName) =>
    Far(farName)
  )
);

/**
 * "Keys are Passable arbitrarily-nested pass-by-copy containers
 * (CopyArray, CopyRecord, CopySet, CopyBag, CopyMap) in which every
 * non-container leaf is either a Passable primitive value or a Remotable"
 *
 * See import('@endo/patterns').Key
 */
const { passable: arbKey } = fc.letrec((tie) => ({
  // NOTE: no published values are copySet, copyMap, or copyBag (yet?)
  passable: fc.oneof(
    arbPrim,
    arbRemotable,
    tie('copyArray'),
    tie('copyRecord')
  ),
  copyArray: fc.array(tie('passable')).map(harden),
  copyRecord: fc.dictionary(fc.string(), tie('passable')).map(harden),
  tagged: fc
    .record({ tag: fc.string(), payload: tie('passable') })
    .map(({ tag, payload }) => makeTagged(tag, payload)),
}));

export { arbPrim, arbRemotable, arbKey };
