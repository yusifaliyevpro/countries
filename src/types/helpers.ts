export type PrettifyDeep<T> = T extends (...args: any[]) => any
  ? T
  : T extends Array<infer U>
    ? Array<PrettifyDeep<U>>
    : T extends object
      ? { [K in keyof T]: PrettifyDeep<T[K]> } & {}
      : T;
