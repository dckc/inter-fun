(globalThis as any).assert = (cond: unknown, msg?: string) => {
  if (!cond) {
    throw new Error(msg);
  }
};
