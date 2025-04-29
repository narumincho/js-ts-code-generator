// c:\Users\narum\Documents\GitHub\js-ts-code-generator\statement.ts
import type {
  ForOfStatement,
  ForStatement,
  IfStatement,
  SetStatement,
  Statement,
  TsExpr,
  VariableDefinitionStatement,
} from "./data.ts";
import { identifierFromString } from "./identifier.ts";
import { callMethod } from "./expr.ts";

/**
 * ```ts
 * console.log(expr)
 * ```
 * @param expr 出力する式
 */
export const consoleLog = (expr: TsExpr): Statement => ({
  type: "EvaluateExpr",
  tsExpr: callMethod(
    {
      type: "GlobalObjects",
      tsIdentifier: identifierFromString("console"),
    },
    "log",
    [expr],
  ),
});

/**
 * return 文 `return expr;`
 * @param expr 返す式
 */
const statementReturn = (expr: TsExpr): Statement => ({
  type: "Return",
  tsExpr: expr,
});

export { statementReturn as return };

/**
 * 式の評価文 `expr;`
 * @param expr 評価する式
 */
export const evaluateExpr = (expr: TsExpr): Statement => ({
  type: "EvaluateExpr",
  tsExpr: expr,
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
 * 変数定義文 `const name = expr;` または `let name = expr;`
 * @param variableDefinitionStatement 変数定義文のデータ
 */
export const variableDefinition = (
  variableDefinitionStatement: VariableDefinitionStatement,
): Statement => ({
  type: "VariableDefinition",
  variableDefinitionStatement,
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
