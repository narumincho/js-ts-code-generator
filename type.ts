import type { MemberType, PropertyName, Type } from "./data.ts";
import { type Identifier, identifierFromString } from "./identifier.ts";

/**
 * `Array<elementType>`
 */
export const Array = (elementType: Type): Type => ({
  type: "ScopeInGlobal",
  typeNameAndArguments: {
    name: identifierFromString("Array"),
    arguments: [elementType],
  },
});

/**
 * `ReadonlyArray<elementType>`
 */
export const ReadonlyArray = (elementType: Type): Type => ({
  type: "ScopeInGlobal",
  typeNameAndArguments: {
    name: identifierFromString("ReadonlyArray"),
    arguments: [elementType],
  },
});

/**
 * `Uint8Array`
 */
export const Uint8Array: Type = {
  type: "ScopeInGlobal",
  typeNameAndArguments: {
    name: identifierFromString("Uint8Array"),
    arguments: [],
  },
};

/**
 * `URL`
 */
export const URL: Type = {
  type: "ScopeInGlobal",
  typeNameAndArguments: {
    name: identifierFromString("URL"),
    arguments: [],
  },
};

/**
 * `Response`
 */
export const Response: Type = {
  type: "ScopeInGlobal",
  typeNameAndArguments: {
    name: identifierFromString("Response"),
    arguments: [],
  },
};

/**
 * `Request`
 */
export const Request: Type = {
  type: "ScopeInGlobal",
  typeNameAndArguments: {
    name: identifierFromString("Request"),
    arguments: [],
  },
};

/**
 * `Promise<returnType>`
 */
export const Promise = (returnType: Type): Type => ({
  type: "ScopeInGlobal",
  typeNameAndArguments: {
    name: identifierFromString("Promise"),
    arguments: [returnType],
  },
});

/**
 * `Date`
 */
export const Date: Type = {
  type: "ScopeInGlobal",
  typeNameAndArguments: {
    name: identifierFromString("Date"),
    arguments: [],
  },
};

/**
 * `Map<keyType, valueType>`
 */
export const Map = (keyType: Type, valueType: Type): Type => ({
  type: "ScopeInGlobal",
  typeNameAndArguments: {
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
  typeNameAndArguments: {
    name: identifierFromString("ReadonlyMap"),
    arguments: [keyType, valueType],
  },
});

/**
 * `Set<elementType>`
 */
export const Set = (elementType: Type): Type => ({
  type: "ScopeInGlobal",
  typeNameAndArguments: {
    name: identifierFromString("Set"),
    arguments: [elementType],
  },
});

/**
 * `ReadonlySet<elementType>`
 */
export const ReadonlySet = (elementType: Type): Type => ({
  type: "ScopeInGlobal",
  typeNameAndArguments: {
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
  typeNameAndArguments: {
    name,
    arguments: [],
  },
});

/**
 * Union 型 `T | U`
 */
export const union = (typeList: ReadonlyArray<Type>): Type => ({
  type: "Union",
  typeList,
});

/**
 * Object 型 `{ readonly a: string, readonly b: number }`
 */
export const object = (
  memberList: ReadonlyArray<ObjectMember>,
): Type => ({
  type: "Object",
  memberList: memberList.map((member): MemberType => ({
    name: member.name,
    required: member.required ?? true,
    readonly: member.readonly ?? true,
    type: member.type,
    document: member.document ?? "",
  })),
});

export type ObjectMember = {
  readonly name: PropertyName;
  /**
   * @default {true}
   */
  readonly required?: boolean;
  /**
   * @default {true}
   */
  readonly readonly?: boolean;
  readonly type: Type;
  /**
   * @default {""}
   */
  readonly document?: string;
};
