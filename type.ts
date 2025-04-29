// c:\Users\narum\Documents\GitHub\js-ts-code-generator\type.ts
import type * as d from "./data.ts";
import * as identifier from "./identifier.ts";

/**
 * `Array<elementType>`
 */
export const arrayType = (elementType: d.TsType): d.TsType => ({
  type: "ScopeInGlobal",
  typeNameAndTypeParameter: {
    name: identifier.identifierFromString("Array"),
    arguments: [elementType],
  },
});

/**
 * `ReadonlyArray<elementType>`
 */
export const readonlyArrayType = (elementType: d.TsType): d.TsType => ({
  type: "ScopeInGlobal",
  typeNameAndTypeParameter: {
    name: identifier.identifierFromString("ReadonlyArray"),
    arguments: [elementType],
  },
});

/**
 * `Uint8Array`
 */
export const uint8ArrayType: d.TsType = {
  type: "ScopeInGlobal",
  typeNameAndTypeParameter: {
    name: identifier.identifierFromString("Uint8Array"),
    arguments: [],
  },
};

/**
 * `URL`
 */
export const urlType: d.TsType = {
  type: "ScopeInGlobal",
  typeNameAndTypeParameter: {
    name: identifier.identifierFromString("URL"),
    arguments: [],
  },
};

/**
 * `Response`
 */
export const responseType: d.TsType = {
  type: "ScopeInGlobal",
  typeNameAndTypeParameter: {
    name: identifier.identifierFromString("Response"),
    arguments: [],
  },
};

/**
 * `Request`
 */
export const requestType: d.TsType = {
  type: "ScopeInGlobal",
  typeNameAndTypeParameter: {
    name: identifier.identifierFromString("Request"),
    arguments: [],
  },
};

/**
 * `Promise<returnType>`
 */
export const promiseType = (returnType: d.TsType): d.TsType => ({
  type: "ScopeInGlobal",
  typeNameAndTypeParameter: {
    name: identifier.identifierFromString("Promise"),
    arguments: [returnType],
  },
});

/**
 * `Date`
 */
export const dateType: d.TsType = {
  type: "ScopeInGlobal",
  typeNameAndTypeParameter: {
    name: identifier.identifierFromString("Date"),
    arguments: [],
  },
};

/**
 * `Map<keyType, valueType>`
 */
export const mapType = (keyType: d.TsType, valueType: d.TsType): d.TsType => ({
  type: "ScopeInGlobal",
  typeNameAndTypeParameter: {
    name: identifier.identifierFromString("Map"),
    arguments: [keyType, valueType],
  },
});

/**
 * `ReadonlyMap<keyType, valueType>`
 */
export const readonlyMapType = (
  keyType: d.TsType,
  valueType: d.TsType,
): d.TsType => ({
  type: "ScopeInGlobal",
  typeNameAndTypeParameter: {
    name: identifier.identifierFromString("ReadonlyMap"),
    arguments: [keyType, valueType],
  },
});

/**
 * `Set<elementType>`
 */
export const setType = (elementType: d.TsType): d.TsType => ({
  type: "ScopeInGlobal",
  typeNameAndTypeParameter: {
    name: identifier.identifierFromString("Set"),
    arguments: [elementType],
  },
});

/**
 * `ReadonlySet<elementType>`
 */
export const readonlySetType = (elementType: d.TsType): d.TsType => ({
  type: "ScopeInGlobal",
  typeNameAndTypeParameter: {
    name: identifier.identifierFromString("ReadonlySet"),
    arguments: [elementType],
  },
});

export const typeScopeInFileNoArguments = (
  name: identifier.TsIdentifier,
): d.TsType => ({
  type: "ScopeInFile",
  typeNameAndTypeParameter: {
    name,
    arguments: [],
  },
});

export const typeUnion = (tsTypeList: ReadonlyArray<d.TsType>): d.TsType => ({
  type: "Union",
  tsTypeList,
});

export const typeObject = (
  tsMemberTypeList: ReadonlyArray<d.TsMemberType>,
): d.TsType => ({
  type: "Object",
  tsMemberTypeList,
});

/**
 * ラムダ式の型を抽出する
 */
export const lambdaToType = (lambda: d.LambdaExpr): d.TsType => {
  return {
    type: "Function",
    functionType: {
      parameterList: lambda.parameterList.map((parameter) => parameter.type),
      return: lambda.returnType,
      typeParameterList: lambda.typeParameterList,
    },
  };
};
