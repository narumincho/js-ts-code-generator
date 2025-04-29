import type { LambdaExpr, TsMemberType, TsType } from "./data.ts";
import { identifierFromString, type TsIdentifier } from "./identifier.ts";

/**
 * `Array<elementType>`
 */
export const arrayType = (elementType: TsType): TsType => ({
  type: "ScopeInGlobal",
  typeNameAndTypeParameter: {
    name: identifierFromString("Array"),
    arguments: [elementType],
  },
});

/**
 * `ReadonlyArray<elementType>`
 */
export const readonlyArrayType = (elementType: TsType): TsType => ({
  type: "ScopeInGlobal",
  typeNameAndTypeParameter: {
    name: identifierFromString("ReadonlyArray"),
    arguments: [elementType],
  },
});

/**
 * `Uint8Array`
 */
export const uint8ArrayType: TsType = {
  type: "ScopeInGlobal",
  typeNameAndTypeParameter: {
    name: identifierFromString("Uint8Array"),
    arguments: [],
  },
};

/**
 * `URL`
 */
export const urlType: TsType = {
  type: "ScopeInGlobal",
  typeNameAndTypeParameter: {
    name: identifierFromString("URL"),
    arguments: [],
  },
};

/**
 * `Response`
 */
export const responseType: TsType = {
  type: "ScopeInGlobal",
  typeNameAndTypeParameter: {
    name: identifierFromString("Response"),
    arguments: [],
  },
};

/**
 * `Request`
 */
export const requestType: TsType = {
  type: "ScopeInGlobal",
  typeNameAndTypeParameter: {
    name: identifierFromString("Request"),
    arguments: [],
  },
};

/**
 * `Promise<returnType>`
 */
export const promiseType = (returnType: TsType): TsType => ({
  type: "ScopeInGlobal",
  typeNameAndTypeParameter: {
    name: identifierFromString("Promise"),
    arguments: [returnType],
  },
});

/**
 * `Date`
 */
export const dateType: TsType = {
  type: "ScopeInGlobal",
  typeNameAndTypeParameter: {
    name: identifierFromString("Date"),
    arguments: [],
  },
};

/**
 * `Map<keyType, valueType>`
 */
export const mapType = (keyType: TsType, valueType: TsType): TsType => ({
  type: "ScopeInGlobal",
  typeNameAndTypeParameter: {
    name: identifierFromString("Map"),
    arguments: [keyType, valueType],
  },
});

/**
 * `ReadonlyMap<keyType, valueType>`
 */
export const readonlyMapType = (
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
export const setType = (elementType: TsType): TsType => ({
  type: "ScopeInGlobal",
  typeNameAndTypeParameter: {
    name: identifierFromString("Set"),
    arguments: [elementType],
  },
});

/**
 * `ReadonlySet<elementType>`
 */
export const readonlySetType = (elementType: TsType): TsType => ({
  type: "ScopeInGlobal",
  typeNameAndTypeParameter: {
    name: identifierFromString("ReadonlySet"),
    arguments: [elementType],
  },
});

export const typeScopeInFileNoArguments = (
  name: TsIdentifier,
): TsType => ({
  type: "ScopeInFile",
  typeNameAndTypeParameter: {
    name,
    arguments: [],
  },
});

export const typeUnion = (tsTypeList: ReadonlyArray<TsType>): TsType => ({
  type: "Union",
  tsTypeList,
});

export const typeObject = (
  tsMemberTypeList: ReadonlyArray<TsMemberType>,
): TsType => ({
  type: "Object",
  tsMemberTypeList,
});

/**
 * ラムダ式の型を抽出する
 */
export const lambdaToType = (lambda: LambdaExpr): TsType => {
  return {
    type: "Function",
    functionType: {
      parameterList: lambda.parameterList.map((parameter) => parameter.type),
      return: lambda.returnType,
      typeParameterList: lambda.typeParameterList,
    },
  };
};
