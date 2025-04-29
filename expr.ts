import type * as d from "./data.ts";
import * as identifier from "./identifier.ts";

/**
 * プロパティの値を取得する。getByExprのシンタックスシュガー
 * @param expr 式
 * @param propertyName プロパティ名
 */
export const get = (expr: d.TsExpr, propertyName: string): d.TsExpr => ({
  type: "Get",
  getExpr: {
    expr,
    propertyExpr: { type: "StringLiteral", string: propertyName },
  },
});

/**
 * メソッドを呼ぶ (getとcallのシンタックスシュガー)
 * @param expr
 * @param methodName
 * @param parameterList
 */
export const callMethod = (
  expr: d.TsExpr,
  methodName: string,
  parameterList: ReadonlyArray<d.TsExpr>,
): d.TsExpr => ({
  type: "Call",
  callExpr: { expr: get(expr, methodName), parameterList },
});

/**
 * `then` メソッドを呼ぶ
 */
export const callThenMethod = (
  expr: d.TsExpr,
  thenLambda: d.LambdaExpr,
): d.TsExpr => ({
  type: "Call",
  callExpr: {
    expr: get(expr, "then"),
    parameterList: [{ type: "Lambda", lambdaExpr: thenLambda }],
  },
});

/**
 * `catch` メソッドを呼ぶ
 */
export const callCatchMethod = (
  expr: d.TsExpr,
  thenLambda: d.LambdaExpr,
): d.TsExpr => ({
  type: "Call",
  callExpr: {
    expr: get(expr, "catch"),
    parameterList: [{ type: "Lambda", lambdaExpr: thenLambda }],
  },
});

/**
 * 単項マイナス演算子 `-a`
 * @param expr 式
 */
export const minus = (expr: d.TsExpr): d.TsExpr => ({
  type: "UnaryOperator",
  unaryOperatorExpr: {
    operator: "Minus",
    expr,
  },
});

/**
 * ビット否定 `~a`
 * @param expr 式
 */
export const bitwiseNot = (expr: d.TsExpr): d.TsExpr => ({
  type: "UnaryOperator",
  unaryOperatorExpr: {
    operator: "BitwiseNot",
    expr,
  },
});

/**
 * 論理否定 `!a`
 * @param expr 式
 */
export const logicalNot = (expr: d.TsExpr): d.TsExpr => ({
  type: "UnaryOperator",
  unaryOperatorExpr: {
    operator: "LogicalNot",
    expr,
  },
});

/**
 * typeof 演算子 `typeof a`
 * @param expr 式
 */
export const typeofExpr = (expr: d.TsExpr): d.TsExpr => ({
  type: "UnaryOperator",
  unaryOperatorExpr: {
    operator: "typeof",
    expr,
  },
});

/**
 * べき乗 `a ** b`
 * @param left
 * @param right
 */
export const exponentiation = (left: d.TsExpr, right: d.TsExpr): d.TsExpr => ({
  type: "BinaryOperator",
  binaryOperatorExpr: {
    operator: "Exponentiation",
    left,
    right,
  },
});

/**
 * 数値の掛け算 `a * b`
 * @param left 左辺
 * @param right 右辺
 */
export const multiplication = (left: d.TsExpr, right: d.TsExpr): d.TsExpr => ({
  type: "BinaryOperator",
  binaryOperatorExpr: { operator: "Multiplication", left, right },
});

/**
 * 数値の割り算 `a / b`
 * @param left 左辺
 * @param right 右辺
 */
export const division = (left: d.TsExpr, right: d.TsExpr): d.TsExpr => ({
  type: "BinaryOperator",
  binaryOperatorExpr: { operator: "Division", left, right },
});

/**
 * 剰余演算 `a % b`
 * @param left 左辺
 * @param right 右辺
 */
export const modulo = (left: d.TsExpr, right: d.TsExpr): d.TsExpr => ({
  type: "BinaryOperator",
  binaryOperatorExpr: { operator: "Remainder", left, right },
});

/**
 * 数値の足し算、文字列の結合 `a + b`
 * @param left 左辺
 * @param right 右辺
 */
export const addition = (left: d.TsExpr, right: d.TsExpr): d.TsExpr => ({
  type: "BinaryOperator",
  binaryOperatorExpr: { operator: "Addition", left, right },
});

/**
 * 数値の引き算 `a - b`
 * @param left 左辺
 * @param right 右辺
 */
export const subtraction = (left: d.TsExpr, right: d.TsExpr): d.TsExpr => ({
  type: "BinaryOperator",
  binaryOperatorExpr: {
    operator: "Subtraction",
    left,
    right,
  },
});

/**
 * 左シフト `a << b`
 * @param left 左辺
 * @param right 右辺
 */
export const leftShift = (left: d.TsExpr, right: d.TsExpr): d.TsExpr => ({
  type: "BinaryOperator",
  binaryOperatorExpr: {
    operator: "LeftShift",
    left,
    right,
  },
});

/**
 * 符号を維持する右シフト `a >> b`
 * @param left 左辺
 * @param right 右辺
 */
export const signedRightShift = (
  left: d.TsExpr,
  right: d.TsExpr,
): d.TsExpr => ({
  type: "BinaryOperator",
  binaryOperatorExpr: {
    operator: "SignedRightShift",
    left,
    right,
  },
});

/**
 * 符号を維持しない(0埋め)右シフト `a >>> b`
 * @param left 左辺
 * @param right 右辺
 */
export const unsignedRightShift = (
  left: d.TsExpr,
  right: d.TsExpr,
): d.TsExpr => ({
  type: "BinaryOperator",
  binaryOperatorExpr: {
    operator: "UnsignedRightShift",
    left,
    right,
  },
});

/**
 * 未満 `a < b`
 * @param left 左辺
 * @param right 右辺
 */
export const lessThan = (left: d.TsExpr, right: d.TsExpr): d.TsExpr => ({
  type: "BinaryOperator",
  binaryOperatorExpr: {
    operator: "LessThan",
    left,
    right,
  },
});

/**
 * 以下 `a <= b`
 * @param left 左辺
 * @param right 右辺
 */
export const lessThanOrEqual = (left: d.TsExpr, right: d.TsExpr): d.TsExpr => ({
  type: "BinaryOperator",
  binaryOperatorExpr: {
    operator: "LessThanOrEqual",
    left,
    right,
  },
});

/**
 * 等号 `a === b`
 * @param left 左辺
 * @param right 右辺
 */
export const equal = (left: d.TsExpr, right: d.TsExpr): d.TsExpr => ({
  type: "BinaryOperator",
  binaryOperatorExpr: {
    operator: "Equal",
    left,
    right,
  },
});

/**
 * 不等号 `a !== b`
 * @param left 左辺
 * @param right 右辺
 */
export const notEqual = (left: d.TsExpr, right: d.TsExpr): d.TsExpr => ({
  type: "BinaryOperator",
  binaryOperatorExpr: {
    operator: "NotEqual",
    left,
    right,
  },
});

/**
 * ビットAND `a & b`
 * @param left 左辺
 * @param right 右辺
 */
export const bitwiseAnd = (left: d.TsExpr, right: d.TsExpr): d.TsExpr => ({
  type: "BinaryOperator",
  binaryOperatorExpr: {
    operator: "BitwiseAnd",
    left,
    right,
  },
});

export const bitwiseXOr = (left: d.TsExpr, right: d.TsExpr): d.TsExpr => ({
  type: "BinaryOperator",
  binaryOperatorExpr: {
    operator: "BitwiseXOr",
    left,
    right,
  },
});

/**
 * ビットOR `a | b`
 * @param left 左辺
 * @param right 右辺
 */
export const bitwiseOr = (left: d.TsExpr, right: d.TsExpr): d.TsExpr => ({
  type: "BinaryOperator",
  binaryOperatorExpr: {
    operator: "BitwiseOr",
    left,
    right,
  },
});

/**
 * 論理AND `a && b`
 * @param left 左辺
 * @param right 右辺
 */
export const logicalAnd = (left: d.TsExpr, right: d.TsExpr): d.TsExpr => ({
  type: "BinaryOperator",
  binaryOperatorExpr: {
    operator: "LogicalAnd",
    left,
    right,
  },
});

/**
 * 論理OR `a || b`
 * @param left 左辺
 * @param right 右辺
 */
export const logicalOr = (left: d.TsExpr, right: d.TsExpr): d.TsExpr => ({
  type: "BinaryOperator",
  binaryOperatorExpr: {
    operator: "LogicalOr",
    left,
    right,
  },
});

/**
 * ```ts
 * a ?? b
 * ```
 */
export const nullishCoalescing = (
  left: d.TsExpr,
  right: d.TsExpr,
): d.TsExpr => ({
  type: "BinaryOperator",
  binaryOperatorExpr: {
    operator: "??",
    left,
    right,
  },
});

/**
 * ```ts
 * Number.parseInt(parameter)
 * Number.isNaN(parameter)
 * ```
 */
export const callNumberMethod = (
  methodName: string,
  parameterList: ReadonlyArray<d.TsExpr>,
): d.TsExpr =>
  callMethod(
    {
      type: "GlobalObjects",
      tsIdentifier: identifier.identifierFromString("Number"),
    },
    methodName,
    parameterList,
  );

/**
 * ```ts
 * Math.floor(parameter)
 * Math.sqrt(parameter)
 * ```
 */
export const callMathMethod = (
  methodName: string,
  parameterList: ReadonlyArray<d.TsExpr>,
): d.TsExpr =>
  callMethod(
    {
      type: "GlobalObjects",
      tsIdentifier: identifier.identifierFromString("Math"),
    },
    methodName,
    parameterList,
  );

/**
 * ```ts
 * new Date()
 * ```
 */
export const newDate: d.TsExpr = {
  type: "New",
  callExpr: {
    expr: {
      type: "GlobalObjects",
      tsIdentifier: identifier.identifierFromString("Date"),
    },
    parameterList: [],
  },
};

/**
 * ```ts
 * new Uint8Array(lengthOrIterable)
 * ```
 */
export const newUint8Array = (lengthOrIterable: d.TsExpr): d.TsExpr => ({
  type: "New",
  callExpr: {
    expr: {
      type: "GlobalObjects",
      tsIdentifier: identifier.identifierFromString("Uint8Array"),
    },
    parameterList: [lengthOrIterable],
  },
});

/**
 * ```ts
 * new URL(expr)
 * ```
 */
export const newURL = (expr: d.TsExpr): d.TsExpr => ({
  type: "New",
  callExpr: {
    expr: {
      type: "GlobalObjects",
      tsIdentifier: identifier.identifierFromString("URL"),
    },
    parameterList: [expr],
  },
});

/**
 * ```ts
 * fetch(expr)
 * ```
 */
export const callFetch = (
  input: d.TsExpr,
  init?: d.TsExpr | undefined,
): d.TsExpr => ({
  type: "Call",
  callExpr: {
    expr: {
      type: "GlobalObjects",
      tsIdentifier: identifier.identifierFromString("fetch"),
    },
    parameterList: [input, ...(init === undefined ? [] : [init])],
  },
});

/**
 * ```ts
 * new Map(initKeyValueList)
 * ```
 */
export const newMap = (initKeyValueList: d.TsExpr): d.TsExpr => ({
  type: "New",
  callExpr: {
    expr: {
      type: "GlobalObjects",
      tsIdentifier: identifier.identifierFromString("Map"),
    },
    parameterList: [initKeyValueList],
  },
});

/**
 * ```ts
 * new Set(initValueList)
 * ```
 */
export const newSet = (initValueList: d.TsExpr): d.TsExpr => ({
  type: "New",
  callExpr: {
    expr: {
      type: "GlobalObjects",
      tsIdentifier: identifier.identifierFromString("Set"),
    },
    parameterList: [initValueList],
  },
});

export const objectLiteral = (
  memberList: ReadonlyArray<d.TsMember>,
): d.TsExpr => ({
  type: "ObjectLiteral",
  tsMemberList: memberList,
});

/**
 * ```ts
 * array.map(parameter)
 * ```
 */
export const arrayMap = (array: d.TsExpr, parameter: d.TsExpr): d.TsExpr => {
  return callMethod(array, "map", [parameter]);
};

export const variable = (name: identifier.TsIdentifier): d.TsExpr => ({
  type: "Variable",
  tsIdentifier: name,
});

export const memberKeyValue = (key: string, value: d.TsExpr): d.TsMember => ({
  type: "KeyValue",
  keyValue: {
    key: stringLiteral(key),
    value,
  },
});

export const newTextDecoder: d.TsExpr = {
  type: "New",
  callExpr: {
    expr: {
      type: "GlobalObjects",
      tsIdentifier: identifier.identifierFromString("TextDecoder"),
    },
    parameterList: [],
  },
};

export const newTextEncoder: d.TsExpr = {
  type: "New",
  callExpr: {
    expr: {
      type: "GlobalObjects",
      tsIdentifier: identifier.identifierFromString("TextEncoder"),
    },
    parameterList: [],
  },
};

export const numberLiteral = (number: number): d.TsExpr => ({
  type: "NumberLiteral",
  int32: number,
});

export const stringLiteral = (string: string): d.TsExpr => ({
  type: "StringLiteral",
  string,
});

export const call = (
  expr: d.TsExpr,
  parameterList: ReadonlyArray<d.TsExpr>,
): d.TsExpr => ({
  type: "Call",
  callExpr: { expr, parameterList },
});

export const arrayLiteral = (
  arrayItemList: ReadonlyArray<d.ArrayItem>,
): d.TsExpr => ({
  type: "ArrayLiteral",
  arrayItemList,
});

export const typeAssertion = (param: d.TypeAssertion): d.TsExpr => ({
  type: "TypeAssertion",
  typeAssertion: param,
});

export const symbolToStringTag: d.TsExpr = get({
  type: "GlobalObjects",
  tsIdentifier: identifier.identifierFromString("Symbol"),
}, "toStringTag");
