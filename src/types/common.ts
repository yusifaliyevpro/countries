import { Cca2Code, Cca3Code, Ccn3Code, CiocCode } from ".";

export type LiteralUnion<T> = T | (string & {});

export type Code = Cca2Code | Cca3Code | CiocCode | Ccn3Code;
