import type { MemberType, Type } from "./data.ts";
import { type Identifier, identifierFromString } from "./identifier.ts";

/**
 * `Array<elementType>`
 */
export const Array = (elementType: Type): Type => ({
  type: "ScopeInGlobal",
  typeNameAndTypeParameter: {
    name: identifierFromString("Array"),
    arguments: [elementType],
  },
});

/**
 * `ReadonlyArray<elementType>`
 */
export const ReadonlyArray = (elementType: Type): Type => ({
  type: "ScopeInGlobal",
  typeNameAndTypeParameter: {
    name: identifierFromString("ReadonlyArray"),
    arguments: [elementType],
  },
});

/**
 * `Uint8Array`
 */
export const Uint8Array: Type = {
  type: "ScopeInGlobal",
  typeNameAndTypeParameter: {
    name: identifierFromString("Uint8Array"),
    arguments: [],
  },
};

/**
 * `URL`
 */
export const URL: Type = {
  type: "ScopeInGlobal",
  typeNameAndTypeParameter: {
    name: identifierFromString("URL"),
    arguments: [],
  },
};

/**
 * `Response`
 */
export const Response: Type = {
  type: "ScopeInGlobal",
  typeNameAndTypeParameter: {
    name: identifierFromString("Response"),
    arguments: [],
  },
};

/**
 * `Request`
 */
export const Request: Type = {
  type: "ScopeInGlobal",
  typeNameAndTypeParameter: {
    name: identifierFromString("Request"),
    arguments: [],
  },
};

/**
 * `Promise<returnType>`
 */
export const Promise = (returnType: Type): Type => ({
  type: "ScopeInGlobal",
  typeNameAndTypeParameter: {
    name: identifierFromString("Promise"),
    arguments: [returnType],
  },
});

/**
 * `Date`
 */
export const Date: Type = {
  type: "ScopeInGlobal",
  typeNameAndTypeParameter: {
    name: identifierFromString("Date"),
    arguments: [],
  },
};

/**
 * `Map<keyType, valueType>`
 */
export const Map = (keyType: Type, valueType: Type): Type => ({
  type: "ScopeInGlobal",
  typeNameAndTypeParameter: {
    name: identifierFromString("Map"),
    arguments: [keyType, valueType],
  },
});

/**
 * `ReadonlyMap<keyType, valueType>`
 */
export const ReadonlyMap = (
  keyType: Type,
  valueType: Type,
): Type => ({
  type: "ScopeInGlobal",
  typeNameAndTypeParameter: {
    name: identifierFromString("ReadonlyMap"),
    arguments: [keyType, valueType],
  },
});

/**
 * `Set<elementType>`
 */
export const Set = (elementType: Type): Type => ({
  type: "ScopeInGlobal",
  typeNameAndTypeParameter: {
    name: identifierFromString("Set"),
    arguments: [elementType],
  },
});

/**
 * `ReadonlySet<elementType>`
 */
export const ReadonlySet = (elementType: Type): Type => ({
  type: "ScopeInGlobal",
  typeNameAndTypeParameter: {
    name: identifierFromString("ReadonlySet"),
    arguments: [elementType],
  },
});

/**
 * ファイルスコープ内の型を指定する (引数なし)
 */
export const scopeInFile = (
  name: Identifier,
): Type => ({
  type: "ScopeInFile",
  typeNameAndTypeParameter: {
    name,
    arguments: [],
  },
});

/**
 * Union 型 `T | U`
 */
export const union = (tsTypeList: ReadonlyArray<Type>): Type => ({
  type: "Union",
  tsTypeList,
});

/**
 * Object 型 `{ a: string, b: number }`
 */
export const object = (
  tsMemberTypeList: ReadonlyArray<MemberType>,
): Type => ({
  type: "Object",
  tsMemberTypeList,
});
