export type LiteralUnion<T extends U, U extends string = string> = T | Omit<U, T>;
