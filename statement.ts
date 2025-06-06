// c:\Users\narum\Documents\GitHub\js-ts-code-generator\statement.ts
import type {
  Expr,
  ForOfStatement,
  ForStatement,
  IfStatement,
  SetStatement,
  Statement,
  Type,
} from "./data.ts";
import { type Identifier, identifierFromString } from "./identifier.ts";
import { callMethod } from "./expr.ts";

/**
 * ```ts
 * console.log(expr)
 * ```
 * @param expr 出力する式
 */
export const consoleLog = (expr: Expr): Statement => ({
  type: "EvaluateExpr",
  expr: callMethod(
    {
      type: "GlobalObjects",
      identifier: identifierFromString("console"),
    },
    "log",
    [expr],
  ),
});

/**
 * return 文 `return expr;`
 * @param expr 返す式
 */
const statementReturn = (expr: Expr): Statement => ({
  type: "Return",
  expr: expr,
});

export { statementReturn as return };

/**
 * 式の評価文 `expr;`
 * @param expr 評価する式
 */
export const evaluateExpr = (expr: Expr): Statement => ({
  type: "EvaluateExpr",
  expr: expr,
});

/**
 * if 文
 * @param ifStatement if 文のデータ
 */
const statementIf = (ifStatement: IfStatement): Statement => ({
  type: "If",
  ifStatement,
});

export { statementIf as if };

/**
 * ローカル変数定義
 */
export type VariableDefinitionStatementInput = {
  /**
   * 変数名
   */
  readonly name: Identifier;
  /**
   * 変数の型
   *
   * @default {undefined}
   */
  readonly type?: Type | undefined;
  /**
   * 式
   */
  readonly expr: Expr;
  /**
   * constかどうか. falseはlet
   *
   * @default {true}
   */
  readonly isConst?: boolean;
};

/**
 * 変数定義文 `const name = expr;` または `let name = expr;`
 */
export const variableDefinition = (
  {
    name,
    type = undefined,
    expr,
    isConst = true,
  }: VariableDefinitionStatementInput,
): Statement => ({
  type: "VariableDefinition",
  variableDefinitionStatement: {
    name,
    type,
    expr,
    isConst,
  },
});

/**
 * for 文 `for (let i = 0; i < count; ++i) { ... }`
 * @param forStatement for 文のデータ
 */
const statementFor = (forStatement: ForStatement): Statement => ({
  type: "For",
  forStatement,
});

export { statementFor as for };

/**
 * for-of 文 `for (const element of array) { ... }`
 * @param forOfStatement for-of 文のデータ
 */
export const forOf = (
  forOfStatement: ForOfStatement,
): Statement => ({
  type: "ForOf",
  forOfStatement,
});

/**
 * 代入文 `target = expr;`
 * @param setStatement 代入文のデータ
 */
export const set = (setStatement: SetStatement): Statement => ({
  type: "Set",
  setStatement,
});
