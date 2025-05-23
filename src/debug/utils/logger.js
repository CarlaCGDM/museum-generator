export function createLogger(enabled, prefix = '') {
  if (!enabled) return () => {};

  return (...args) => {
    const tag = prefix ? `[${prefix}]` : '';
    console.log(tag, ...args);
  };
}
