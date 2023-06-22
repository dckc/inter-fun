import { uselessCalculation } from './index';
import { enc, dec } from './fun';

/**
 * Performs a useless calculation
 *
 * @param {number} x Base value of the calculation
 *
 * @customFunction
 */
(global as any).USELESS_CALCULATION = (x: number) => uselessCalculation(x);

(global as any).enc = enc;
(global as any).dec = dec;
