import type * as d from "../data.ts";
import {
  binaryOperatorToString,
  exprToString,
  lambdaBodyToString,
} from "./expr.ts";
import {
  indentNumberToString,
  stringLiteralValueToString,
  typeParameterListToString,
} from "./common.ts";
import { typeAnnotation } from "./type.ts";
import { addUsedName, type Context } from "./context.ts";

export const statementListToString = (
  statementList: ReadonlyArray<d.Statement>,
  indent: number,
  c: Context,
): string => {
  const context: Context = addUsedName(c, {
    variableNameSet: statementList
      .flatMap((statement) => {
        switch (statement.type) {
          case "EvaluateExpr":
          case "Set":
          case "If":
          case "ThrowError":
          case "Return":
          case "ReturnVoid":
          case "Continue":
            return [];
          case "VariableDefinition":
            return [statement.variableDefinitionStatement.name];
          case "FunctionDefinition":
            return [statement.functionDefinitionStatement.name];
          case "For":
          case "ForOf":
          case "WhileTrue":
          case "Break":
          case "Switch":
          case "TryCatch":
            return [];
        }
      }),
  });
  return "{\n" +
    statementList
      .map((statement) =>
        statementToString(
          statement,
          indent + 1,
          context,
        )
      )
      .join("\n") +
    "\n" +
    indentNumberToString(indent) +
    "}";
};

/**
 * 文をTypeScriptのコードに変換する
 * @param statement 文
 */
const statementToString = (
  statement: d.Statement,
  indent: number,
  context: Context,
): string => {
  const indentString = indentNumberToString(indent);
  switch (statement.type) {
    case "EvaluateExpr":
      return (
        indentString +
        exprToString(statement.tsExpr, indent, context) +
        ";"
      );

    case "Set":
      return (
        indentString +
        exprToString(
          statement.setStatement.target,
          indent,
          context,
        ) +
        " " +
        (statement.setStatement.operatorMaybe !== undefined
          ? binaryOperatorToString(statement.setStatement.operatorMaybe)
          : "") +
        "= " +
        exprToString(statement.setStatement.expr, indent, context) +
        ";"
      );

    case "If":
      return (
        indentString +
        "if (" +
        exprToString(
          statement.ifStatement.condition,
          indent,
          context,
        ) +
        ") " +
        statementListToString(
          statement.ifStatement.thenStatementList,
          indent,
          context,
        )
      );

    case "ThrowError":
      return (
        indentString +
        "throw " +
        exprToString(statement.tsExpr, indent, context) +
        ";"
      );

    case "Return":
      return (
        indentString +
        "return " +
        exprToString(statement.tsExpr, indent, context) +
        ";"
      );

    case "ReturnVoid":
      return indentString + "return;";

    case "Continue":
      return indentString + "continue;";

    case "VariableDefinition":
      return (
        indentString +
        (statement.variableDefinitionStatement.isConst ? "const" : "let") +
        " " +
        statement.variableDefinitionStatement.name +
        typeAnnotation(
          statement.variableDefinitionStatement.type,
          context,
        ) +
        " = " +
        exprToString(
          statement.variableDefinitionStatement.expr,
          indent,
          context,
        ) +
        ";"
      );

    case "FunctionDefinition":
      return functionDefinitionStatementToString(
        statement.functionDefinitionStatement,
        indent,
        context,
      );

    case "For": {
      const c: Context = addUsedName(context, {
        variableNameSet: [statement.forStatement.counterVariableName],
      });
      return (
        indentString +
        "for (let " +
        statement.forStatement.counterVariableName +
        " = 0; " +
        statement.forStatement.counterVariableName +
        " < " +
        exprToString(
          statement.forStatement.untilExpr,
          indent,
          c,
        ) +
        "; " +
        statement.forStatement.counterVariableName +
        " += 1)" +
        statementListToString(
          statement.forStatement.statementList,
          indent,
          c,
        )
      );
    }

    case "ForOf": {
      const c: Context = addUsedName(context, {
        variableNameSet: [statement.forOfStatement.elementVariableName],
      });

      return (
        indentString +
        "for (const " +
        statement.forOfStatement.elementVariableName +
        " of " +
        exprToString(
          statement.forOfStatement.iterableExpr,
          indent,
          c,
        ) +
        ")" +
        statementListToString(
          statement.forOfStatement.statementList,
          indent,
          c,
        )
      );
    }

    case "WhileTrue":
      return (
        indentString +
        "while (true) " +
        statementListToString(
          statement.statementList,
          indent,
          context,
        )
      );

    case "Break":
      return indentString + "break;";

    case "Switch":
      return switchToString(
        statement.switchStatement,
        indent,
        context,
      );

    case "TryCatch":
      return (
        indentString +
        "try " +
        statementListToString(
          statement.tryCatch.tryStatementList,
          indent,
          context,
        ) +
        " catch (" + statement.tryCatch.catchParameter + ") " +
        statementListToString(
          statement.tryCatch.catchStatementList,
          indent,
          context,
        )
      );
  }
};

const functionDefinitionStatementToString = (
  functionDefinition: d.FunctionDefinitionStatement,
  indent: number,
  c: Context,
): string => {
  const context: Context = addUsedName(c, {
    variableNameSet: functionDefinition.parameterList.map((parameter) =>
      parameter.name
    ),
    typeNameSet: functionDefinition.typeParameterList.map((parameter) =>
      parameter.name
    ),
  });
  return indentNumberToString(indent) +
    "const " +
    functionDefinition.name +
    " = " +
    typeParameterListToString(functionDefinition.typeParameterList, context) +
    "(" +
    functionDefinition.parameterList
      .map(
        (parameter) => parameter.name + typeAnnotation(parameter.type, context),
      )
      .join(", ") +
    ")" +
    typeAnnotation(functionDefinition.returnType, context) +
    " => " +
    lambdaBodyToString(
      functionDefinition.statementList,
      indent,
      context,
    ) +
    ";";
};

const switchToString = (
  switch_: d.SwitchStatement,
  indent: number,
  context: Context,
): string => {
  const indentString = indentNumberToString(indent);
  const caseIndentNumber = indent + 1;
  const caseIndentString = indentNumberToString(caseIndentNumber);
  return (
    indentString +
    "switch (" +
    exprToString(switch_.expr, indent, context) +
    ") {\n" +
    switch_.patternList
      .map(
        (pattern) =>
          caseIndentString +
          "case " +
          stringLiteralValueToString(pattern.caseString) +
          ": " +
          statementListToString(
            pattern.statementList,
            caseIndentNumber,
            context,
          ),
      )
      .join("\n") +
    "\n" +
    indentString +
    "}"
  );
};
