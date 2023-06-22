const { freeze: harden } = Object; // IOU

const Fail = (strs, params) => {
  return strs.join('@@');
};

const assert = (cond, msg) => {
  if (!cond) {
    throw Error(msg);
  }
};

assert.typeof = (specimen, ty) => {
  assert(typeof specimen === ty);
};

export { Fail, assert };
