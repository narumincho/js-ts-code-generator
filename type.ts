import type { TsMemberType, TsType } from "./data.ts";
import { identifierFromString, type TsIdentifier } from "./identifier.ts";

/**
 * `Array<elementType>`
 */
export const Array = (elementType: TsType): TsType => ({
  type: "ScopeInGlobal",
  typeNameAndTypeParameter: {
    name: identifierFromString("Array"),
    arguments: [elementType],
  },
});

/**
 * `ReadonlyArray<elementType>`
 */
export const ReadonlyArray = (elementType: TsType): TsType => ({
  type: "ScopeInGlobal",
  typeNameAndTypeParameter: {
    name: identifierFromString("ReadonlyArray"),
    arguments: [elementType],
  },
});

/**
 * `Uint8Array`
 */
export const Uint8Array: TsType = {
  type: "ScopeInGlobal",
  typeNameAndTypeParameter: {
    name: identifierFromString("Uint8Array"),
    arguments: [],
  },
};

/**
 * `URL`
 */
export const URL: TsType = {
  type: "ScopeInGlobal",
  typeNameAndTypeParameter: {
    name: identifierFromString("URL"),
    arguments: [],
  },
};

/**
 * `Response`
 */
export const Response: TsType = {
  type: "ScopeInGlobal",
  typeNameAndTypeParameter: {
    name: identifierFromString("Response"),
    arguments: [],
  },
};

/**
 * `Request`
 */
export const Request: TsType = {
  type: "ScopeInGlobal",
  typeNameAndTypeParameter: {
    name: identifierFromString("Request"),
    arguments: [],
  },
};

/**
 * `Promise<returnType>`
 */
export const Promise = (returnType: TsType): TsType => ({
  type: "ScopeInGlobal",
  typeNameAndTypeParameter: {
    name: identifierFromString("Promise"),
    arguments: [returnType],
  },
});

/**
 * `Date`
 */
export const Date: TsType = {
  type: "ScopeInGlobal",
  typeNameAndTypeParameter: {
    name: identifierFromString("Date"),
    arguments: [],
  },
};

/**
 * `Map<keyType, valueType>`
 */
export const Map = (keyType: TsType, valueType: TsType): TsType => ({
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
  keyType: TsType,
  valueType: TsType,
): TsType => ({
  type: "ScopeInGlobal",
  typeNameAndTypeParameter: {
    name: identifierFromString("ReadonlyMap"),
    arguments: [keyType, valueType],
  },
});

/**
 * `Set<elementType>`
 */
export const Set = (elementType: TsType): TsType => ({
  type: "ScopeInGlobal",
  typeNameAndTypeParameter: {
    name: identifierFromString("Set"),
    arguments: [elementType],
  },
});

/**
 * `ReadonlySet<elementType>`
 */
export const ReadonlySet = (elementType: TsType): TsType => ({
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
  name: TsIdentifier,
): TsType => ({
  type: "ScopeInFile",
  typeNameAndTypeParameter: {
    name,
    arguments: [],
  },
});

/**
 * Union 型 `T | U`
 */
export const union = (tsTypeList: ReadonlyArray<TsType>): TsType => ({
  type: "Union",
  tsTypeList,
});

/**
 * Object 型 `{ a: string, b: number }`
 */
export const object = (
  tsMemberTypeList: ReadonlyArray<TsMemberType>,
): TsType => ({
  type: "Object",
  tsMemberTypeList,
});
