const zip = (xs, ys) => xs.map((x, i) => [x, ys[i]]);

const deeplyFulfilledObject = async obj => {
  const { fromEntries, keys, values } = Object;
  const vs = await Promise.all(values(obj));
  const pvs = zip(keys(obj), vs);
  return fromEntries(pvs);
}