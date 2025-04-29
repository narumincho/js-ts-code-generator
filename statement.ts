// c:\Users\narum\Documents\GitHub\js-ts-code-generator\statement.ts
import type * as d from "./data.ts";
import * as identifier from "./identifier.ts";
import { callMethod } from "./interface.ts";

/**
 * ```ts
 * console.log(expr)
 * ```
 * @param expr 出力する式
 */
export const consoleLog = (expr: d.TsExpr): d.Statement => ({
  type: "EvaluateExpr",
  tsExpr: callMethod(
    {
      type: "GlobalObjects",
      tsIdentifier: identifier.identifierFromString("console"),
    },
    "log",
    [expr],
  ),
});

/**
 * return 文 `return expr;`
 * @param expr 返す式
 */
const statementReturn = (expr: d.TsExpr): d.Statement => ({
  type: "Return",
  tsExpr: expr,
});

export { statementReturn as return };

/**
 * 式の評価文 `expr;`
 * @param expr 評価する式
 */
export const evaluateExpr = (expr: d.TsExpr): d.Statement => ({
  type: "EvaluateExpr",
  tsExpr: expr,
});

/**
 * if 文
 * @param ifStatement if 文のデータ
 */
const statementIf = (ifStatement: d.IfStatement): d.Statement => ({
  type: "If",
  ifStatement,
});

export { statementIf as if };

/**
 * 変数定義文 `const name = expr;` または `let name = expr;`
 * @param variableDefinitionStatement 変数定義文のデータ
 */
export const variableDefinition = (
  variableDefinitionStatement: d.VariableDefinitionStatement,
): d.Statement => ({
  type: "VariableDefinition",
  variableDefinitionStatement,
});

/**
 * for 文 `for (let i = 0; i < count; ++i) { ... }`
 * @param forStatement for 文のデータ
 */
const statementFor = (forStatement: d.ForStatement): d.Statement => ({
  type: "For",
  forStatement,
});

export { statementFor as for };

/**
 * for-of 文 `for (const element of array) { ... }`
 * @param forOfStatement for-of 文のデータ
 */
export const forOf = (
  forOfStatement: d.ForOfStatement,
): d.Statement => ({
  type: "ForOf",
  forOfStatement,
});

/**
 * 代入文 `target = expr;`
 * @param setStatement 代入文のデータ
 */
export const set = (setStatement: d.SetStatement): d.Statement => ({
  type: "Set",
  setStatement,
});
