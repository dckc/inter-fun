// @ts-check
import './endo-init-shim';
import { CapData, makeMarshal } from '@endo/marshal';

// type CapData<T> = any;

// const makeMarshal = (...x: any[]): any => {
//   throw Error('not implemented');
// };

const m = makeMarshal(undefined, undefined, {
  serializeBodyFormat: 'smallcaps',
});
export const enc = (x: unknown) => m.toCapData(x);
export const dec = (capdata: CapData<unknown>) => m.fromCapData(capdata);
