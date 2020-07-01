import * as data from "./data";
import * as nd from "./newData";
import {
  createIdentifer,
  initialIdentiferIndex,
  isIdentifer,
} from "./identifer";
import { NodeTracing } from "inspector";

/**
 * コードを文字列にする
 * @param code コードを表すデータ
 * @param moduleMap モジュールの名をnamed importで使う名前
 * @param codeType JavaScriptかTypeScriptか
 */
export const toString = (
  code: nd.Code,
  moduleMap: ReadonlyMap<string, nd.Identifer>,
  codeType: nd.CodeType
): string => {
  const importCode =
    "/* eslint-disable */\n/* generated by js-ts-code-generator. Do not edit! */\n\n" +
    [...moduleMap.entries()]
      .map(
        ([name, identifer]) =>
          "import * as " + identifer.string + ' from "' + name + '";'
      )
      .join("\n") +
    "\n";

  const definitionCode =
    code.exportDefinitionList
      .map((definition) => definitionToString(definition, moduleMap, codeType))
      .join("") + "\n";

  const statementCode = statementListToString(
    code.statementList,
    0,
    moduleMap,
    codeType
  );

  if (code.statementList.length === 0) {
    return importCode + definitionCode;
  }
  return importCode + definitionCode + statementCode;
};

const definitionToString = (
  definition: nd.ExportDefinition,
  moduleMap: ReadonlyMap<string, nd.Identifer>,
  codeType: nd.CodeType
): string => {
  switch (definition._) {
    case "TypeAlias":
      if (codeType === "JavaScript") {
        return "";
      }
      return typeAliasToString(definition.typeAlias, moduleMap);

    case "Function":
      return exportFunctionToString(definition.function, moduleMap, codeType);

    case "Variable":
      return exportVariableToString(definition.variable, moduleMap, codeType);
  }
};

const typeAliasToString = (
  typeAlias: nd.TypeAlias,
  moduleMap: ReadonlyMap<string, nd.Identifer>
): string => {
  return (
    documentToString(typeAlias.document) +
    "export type " +
    typeAlias.name.string +
    typeParameterListToString(typeAlias.typeParameterList) +
    " = " +
    typeToString(typeAlias.type, moduleMap) +
    ";\n\n"
  );
};

const exportFunctionToString = (
  function_: nd.Function,
  moduleMap: ReadonlyMap<string, nd.Identifer>,
  codeType: nd.CodeType
): string => {
  return (
    documentToString(
      function_.document + parameterListToDocument(function_.parameterList)
    ) +
    "export const " +
    function_.name.string +
    " = " +
    typeParameterListToString(function_.typeParameterList) +
    "(" +
    function_.parameterList
      .map(
        (parameter) =>
          parameter.name.string + ": " + typeToString(parameter.type, moduleMap)
      )
      .join(", ") +
    "): " +
    typeToString(function_.returnType, moduleMap) +
    " => " +
    lambdaBodyToString(function_.statementList, 0, moduleMap, codeType) +
    ";\n\n"
  );
};

const exportVariableToString = (
  variable: nd.Variable,
  moduleMap: ReadonlyMap<string, nd.Identifer>,
  codeType: nd.CodeType
): string => {
  return (
    documentToString(variable.document) +
    "export const " +
    variable.name.string +
    ": " +
    typeToString(variable.type, moduleMap) +
    " = " +
    exprToString(variable.expr, 0, moduleMap, codeType) +
    ";\n\n"
  );
};

const documentToString = (document: string): string => {
  const documentTrimmed = document.trim();
  return documentTrimmed === ""
    ? ""
    : "\n/**\n" +
        documentTrimmed
          .split("\n")
          .map((line) => (line === "" ? " *" : " * " + line))
          .join("\n") +
        "\n */\n";
};

const parameterListToDocument = (
  parameterList: ReadonlyArray<nd.ParameterWithDocument>
): string =>
  parameterList.length === 0
    ? ""
    : "\n" +
      parameterList
        .map((parameter) =>
          parameter.document === ""
            ? ""
            : "@param " + parameter.name.string + " " + parameter.document
        )
        .join("\n");

/**
 * ラムダ式の本体 文が1つでreturn exprだった場合、returnを省略する形にする
 * @param statementList
 * @param indent
 */
export const lambdaBodyToString = (
  statementList: ReadonlyArray<nd.Statement>,
  indent: number,
  moduleMap: ReadonlyMap<string, nd.Identifer>,
  codeType: nd.CodeType
): string => {
  if (statementList.length === 1 && statementList[0]._ === "Return") {
    return exprToStringWithCombineStrength(
      nd.Expr.Lambda({
        typeParameterList: [],
        parameterList: [],
        returnType: nd.Type.Void,
        statementList: [],
      }),
      statementList[0].expr,
      indent,
      moduleMap,
      codeType
    );
  }
  return statementListToString(statementList, indent, moduleMap, codeType);
};

/**
 * 式をコードに変換する
 * @param expr 式
 */
const exprToString = (
  expr: nd.Expr,
  indent: number,
  moduleMap: ReadonlyMap<string, nd.Identifer>,
  codeType: nd.CodeType
): string => {
  switch (expr._) {
    case "NumberLiteral":
      return expr.int32.toString();

    case "StringLiteral":
      return stringLiteralValueToString(expr.string);

    case "BooleanLiteral":
      return expr.bool.toString();

    case "UndefinedLiteral":
      return "undefined";

    case "NullLiteral":
      return "null";

    case "ArrayLiteral":
      return arrayLiteralToString(
        expr.arrayItemList,
        indent,
        moduleMap,
        codeType
      );

    case "ObjectLiteral":
      return objectLiteralToString(
        expr.memberList,
        indent,
        moduleMap,
        codeType
      );

    case "UnaryOperator":
      return (
        unaryOperatorToString(expr.unaryOperatorExpr.operator) +
        exprToStringWithCombineStrength(
          expr,
          expr.unaryOperatorExpr.expr,
          indent,
          moduleMap,
          codeType
        )
      );
    case "BinaryOperator":
      return binaryOperatorExprToString(
        expr.binaryOperatorExpr,
        indent,
        moduleMap,
        codeType
      );

    case "ConditionalOperator":
      return conditionalOperatorToString(
        expr.conditionalOperatorExpr,
        indent,
        moduleMap,
        codeType
      );

    case "Lambda":
      return (
        typeParameterListToString(expr.lambdaExpr.typeParameterList) +
        "(" +
        expr.lambdaExpr.parameterList
          .map(
            (paramter) =>
              paramter.name.string +
              typeAnnotation(paramter.type, codeType, moduleMap)
          )
          .join(", ") +
        ")" +
        typeAnnotation(expr.lambdaExpr.returnType, codeType, moduleMap) +
        " => " +
        lambdaBodyToString(
          expr.lambdaExpr.statementList,
          indent,
          moduleMap,
          codeType
        )
      );

    case "Variable":
      return expr.identifer.string;

    case "GlobalObjects":
      return expr.identifer.string;

    case "ImportedVariable": {
      const nameSpaceIdentifer = moduleMap.get(
        expr.importedVariable.moduleName
      );
      if (nameSpaceIdentifer === undefined) {
        throw Error(
          "収集されなかった, モジュールがある moduleName=" +
            expr.importedVariable.moduleName
        );
      }
      return (
        nameSpaceIdentifer.string + "." + expr.importedVariable.name.string
      );
    }

    case "Get":
      return (
        exprToStringWithCombineStrength(
          expr,
          expr.getExpr.expr,
          indent,
          moduleMap,
          codeType
        ) +
        indexAccessToString(
          expr.getExpr.propertyExpr,
          indent,
          moduleMap,
          codeType
        )
      );

    case "Call":
      return callExprToString(expr, expr.callExpr, indent, moduleMap, codeType);

    case "New":
      return (
        "new " +
        callExprToString(expr, expr.callExpr, indent, moduleMap, codeType)
      );

    case "TypeAssertion":
      return (
        exprToString(expr.typeAssertion.expr, indent, moduleMap, codeType) +
        " as " +
        typeToString(expr.typeAssertion.type, moduleMap)
      );
  }
};

const callExprToString = (
  expr: nd.Expr,
  callExpr: nd.CallExpr,
  indent: number,
  moduleMap: ReadonlyMap<string, nd.Identifer>,
  codeType: nd.CodeType
) =>
  exprToStringWithCombineStrength(
    expr,
    callExpr.expr,
    indent,
    moduleMap,
    codeType
  ) +
  "(" +
  callExpr.parameterList
    .map((parameter) => exprToString(parameter, indent, moduleMap, codeType))
    .join(", ") +
  ")";

/**
 * ```ts
 * list[0] // [0]
 * data.name // .name
 * ```
 * の部分indexのExprがstringLiteralで識別子に使える文字なら`.name`のようになる
 */
const indexAccessToString = (
  indexExpr: nd.Expr,
  indent: number,
  moduleMap: ReadonlyMap<string, nd.Identifer>,
  codeType: nd.CodeType
): string => {
  if (indexExpr._ === "StringLiteral" && isIdentifer(indexExpr.string)) {
    return "." + indexExpr.string;
  }
  return "[" + exprToString(indexExpr, indent, moduleMap, codeType) + "]";
};

const conditionalOperatorToString = (
  conditionalOperator: nd.ConditionalOperatorExpr,
  indent: number,
  moduleMap: ReadonlyMap<string, nd.Identifer>,
  codeType: nd.CodeType
): string => {
  const expr = nd.Expr.ConditionalOperator(conditionalOperator);
  return (
    exprToStringWithCombineStrength(
      expr,
      conditionalOperator.condition,
      indent,
      moduleMap,
      codeType
    ) +
    "?" +
    exprToStringWithCombineStrength(
      expr,
      conditionalOperator.thenExpr,
      indent,
      moduleMap,
      codeType
    ) +
    ":" +
    exprToStringWithCombineStrength(
      expr,
      conditionalOperator.elseExpr,
      indent,
      moduleMap,
      codeType
    )
  );
};

const arrayLiteralToString = (
  itemList: ReadonlyArray<nd.ArrayItem>,
  indent: number,
  moduleMap: ReadonlyMap<string, nd.Identifer>,
  codeType: nd.CodeType
): string =>
  "[" +
  itemList
    .map(
      (item) =>
        (item.spread ? "..." : "") +
        exprToString(item.expr, indent, moduleMap, codeType)
    )
    .join(", ") +
  "]";

const objectLiteralToString = (
  memberList: ReadonlyArray<nd.Member>,
  indent: number,
  moduleMap: ReadonlyMap<string, nd.Identifer>,
  codeType: nd.CodeType
): string => {
  return (
    "{ " +
    memberList
      .map((member) => {
        switch (member._) {
          case "Spread":
            return (
              "..." + exprToString(member.expr, indent, moduleMap, codeType)
            );
          case "KeyValue":
            if (
              isIdentifer(member.keyValue.key) &&
              member.keyValue.value._ === "Variable" &&
              member.keyValue.key === member.keyValue.value.identifer.string
            ) {
              return member.keyValue.key;
            }
            return (
              (isIdentifer(member.keyValue.key)
                ? member.keyValue.key
                : stringLiteralValueToString(member.keyValue.key)) +
              ": " +
              exprToString(member.keyValue.value, indent, moduleMap, codeType)
            );
        }
      })
      .join(", ") +
    " " +
    "}"
  );
};

/**
 * 文字列を`"`で囲んでエスケープする
 */
const stringLiteralValueToString = (value: string): string => {
  return (
    '"' +
    value
      .replace(/\\/gu, "\\\\")
      .replace(/"/gu, '\\"')
      .replace(/\r\n|\n/gu, "\\n") +
    '"'
  );
};

type Associativity = "LeftToRight" | "RightToLeft";

const binaryOperatorAssociativity = (
  binaryOperator: nd.BinaryOperator
): Associativity => {
  switch (binaryOperator) {
    case "Exponentiation":
      return "RightToLeft";
    case "Multiplication":
    case "Division":
    case "Remainder":
    case "Addition":
    case "Subtraction":
    case "LeftShift":
    case "SignedRightShift":
    case "UnsignedRightShift":
    case "LessThan":
    case "LessThanOrEqual":
    case "Equal":
    case "NotEqual":
    case "BitwiseAnd":
    case "BitwiseXOr":
    case "BitwiseOr":
    case "LogicalAnd":
    case "LogicalOr":
      return "LeftToRight";
  }
};

const binaryOperatorExprToString = (
  binaryOperatorExpr: nd.BinaryOperatorExpr,
  indent: number,
  moduleMap: ReadonlyMap<string, nd.Identifer>,
  codeType: nd.CodeType
): string => {
  const operatorExprCombineStrength = exprCombineStrength(
    nd.Expr.BinaryOperator(binaryOperatorExpr)
  );
  const leftExprCombineStrength = exprCombineStrength(binaryOperatorExpr.left);
  const rightExprCombineStrength = exprCombineStrength(
    binaryOperatorExpr.right
  );
  const associativity = binaryOperatorAssociativity(
    binaryOperatorExpr.operator
  );

  return (
    (operatorExprCombineStrength > leftExprCombineStrength ||
    (operatorExprCombineStrength === leftExprCombineStrength &&
      associativity === "RightToLeft")
      ? "(" +
        exprToString(binaryOperatorExpr.left, indent, moduleMap, codeType) +
        ")"
      : exprToString(binaryOperatorExpr.left, indent, moduleMap, codeType)) +
    " " +
    binaryOperatorToString(binaryOperatorExpr.operator) +
    " " +
    (operatorExprCombineStrength > rightExprCombineStrength ||
    (operatorExprCombineStrength === rightExprCombineStrength &&
      associativity === "LeftToRight")
      ? "(" +
        exprToString(binaryOperatorExpr.right, indent, moduleMap, codeType) +
        ")"
      : exprToString(binaryOperatorExpr.right, indent, moduleMap, codeType))
  );
};

const unaryOperatorToString = (unaryOperator: nd.UnaryOperator): string => {
  switch (unaryOperator) {
    case "Minus":
      return "-";
    case "BitwiseNot":
      return "~";
    case "LogicalNot":
      return "!";
  }
};

const binaryOperatorToString = (binaryOperator: nd.BinaryOperator): string => {
  switch (binaryOperator) {
    case "Exponentiation":
      return "**";
    case "Multiplication":
      return "*";
    case "Division":
      return "/";
    case "Remainder":
      return "%";
    case "Addition":
      return "+";
    case "Subtraction":
      return "-";
    case "LeftShift":
      return "<<";
    case "SignedRightShift":
      return ">>";
    case "UnsignedRightShift":
      return ">>>";
    case "LessThan":
      return "<";
    case "LessThanOrEqual":
      return "<=";
    case "Equal":
      return "===";
    case "NotEqual":
      return "!==";
    case "BitwiseAnd":
      return "&";
    case "BitwiseXOr":
      return "^";
    case "BitwiseOr":
      return "|";
    case "LogicalAnd":
      return "&&";
    case "LogicalOr":
      return "||";
  }
};

const exprToStringWithCombineStrength = (
  expr: nd.Expr,
  target: nd.Expr,
  indent: number,
  moduleMap: ReadonlyMap<string, nd.Identifer>,
  codeType: nd.CodeType
): string => {
  const text = exprToString(target, indent, moduleMap, codeType);
  if (exprCombineStrength(expr) > exprCombineStrength(target)) {
    return "(" + text + ")";
  }
  return text;
};

const exprCombineStrength = (expr: nd.Expr): number => {
  switch (expr._) {
    case "NumberLiteral":
    case "StringLiteral":
    case "BooleanLiteral":
    case "NullLiteral":
    case "UndefinedLiteral":
    case "ArrayLiteral":
    case "Variable":
    case "GlobalObjects":
    case "ImportedVariable":
      return 23;
    case "Lambda":
      return 22;
    case "ObjectLiteral":
      return 21;
    case "Get":
    case "Call":
    case "New":
      return 20;
    case "UnaryOperator":
      return 17;
    case "BinaryOperator":
      return binaryOperatorCombineStrength(expr.binaryOperatorExpr.operator);
    case "ConditionalOperator":
      return 4;
    case "TypeAssertion":
      return 3;
  }
};

const binaryOperatorCombineStrength = (
  binaryOperator: nd.BinaryOperator
): number => {
  switch (binaryOperator) {
    case "Exponentiation":
      return 16;
    case "Multiplication":
    case "Division":
    case "Remainder":
      return 15;
    case "Addition":
    case "Subtraction":
      return 14;
    case "LeftShift":
    case "SignedRightShift":
    case "UnsignedRightShift":
      return 13;
    case "LessThan":
    case "LessThanOrEqual":
      return 12;
    case "Equal":
    case "NotEqual":
      return 11;
    case "BitwiseAnd":
      return 10;
    case "BitwiseXOr":
      return 9;
    case "BitwiseOr":
      return 8;
    case "LogicalAnd":
      return 6;
    case "LogicalOr":
      return 5;
  }
};

export const statementListToString = (
  statementList: ReadonlyArray<nd.Statement>,
  indent: number,
  moduleMap: ReadonlyMap<string, nd.Identifer>,
  codeType: nd.CodeType
): string =>
  "{\n" +
  statementList
    .map((statement) =>
      statementToTypeScriptCodeAsString(
        statement,
        indent + 1,
        moduleMap,
        codeType
      )
    )
    .join("\n") +
  "\n" +
  indentNumberToString(indent) +
  "}";

/**
 * 文をTypeScriptのコードに変換する
 * @param statement 文
 */
const statementToTypeScriptCodeAsString = (
  statement: nd.Statement,
  indent: number,
  moduleMap: ReadonlyMap<string, nd.Identifer>,
  codeType: nd.CodeType
): string => {
  const indentString = indentNumberToString(indent);
  switch (statement._) {
    case "EvaluateExpr":
      return (
        indentString +
        exprToString(statement.expr, indent, moduleMap, codeType) +
        ";"
      );

    case "Set":
      return (
        indentString +
        exprToString(
          statement.setStatement.target,
          indent,
          moduleMap,
          codeType
        ) +
        " " +
        (statement.setStatement.operatorMaybe._ === "Just"
          ? binaryOperatorToString(statement.setStatement.operatorMaybe.value)
          : "") +
        "= " +
        exprToString(statement.setStatement.expr, indent, moduleMap, codeType) +
        ";"
      );

    case "If":
      return (
        indentString +
        "if (" +
        exprToString(
          statement.ifStatement.condition,
          indent,
          moduleMap,
          codeType
        ) +
        ") " +
        statementListToString(
          statement.ifStatement.thenStatementList,
          indent,
          moduleMap,
          codeType
        )
      );

    case "ThrowError":
      return (
        indentString +
        "throw new Error(" +
        exprToString(statement.expr, indent, moduleMap, codeType) +
        ");"
      );

    case "Return":
      return (
        indentString +
        "return " +
        exprToString(statement.expr, indent, moduleMap, codeType) +
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
        statement.variableDefinitionStatement.name.string +
        typeAnnotation(
          statement.variableDefinitionStatement.type,
          codeType,
          moduleMap
        ) +
        " = " +
        exprToString(
          statement.variableDefinitionStatement.expr,
          indent,
          moduleMap,
          codeType
        ) +
        ";"
      );

    case "FunctionDefinition":
      return functionDefinitionStatementToString(
        statement.functionDefinitionStatement,
        indent,
        moduleMap,
        codeType
      );

    case "For":
      return (
        indentString +
        "for (let " +
        statement.forStatement.counterVariableName.string +
        " = 0; " +
        statement.forStatement.counterVariableName.string +
        " < " +
        exprToString(
          statement.forStatement.untilExpr,
          indent,
          moduleMap,
          codeType
        ) +
        "; " +
        statement.forStatement.counterVariableName.string +
        " += 1)" +
        statementListToString(
          statement.forStatement.statementList,
          indent,
          moduleMap,
          codeType
        )
      );

    case "ForOf":
      return (
        indentString +
        "for (const " +
        statement.forOfStatement.elementVariableName.string +
        " of " +
        exprToString(
          statement.forOfStatement.iterableExpr,
          indent,
          moduleMap,
          codeType
        ) +
        ")" +
        statementListToString(
          statement.forOfStatement.statementList,
          indent,
          moduleMap,
          codeType
        )
      );

    case "WhileTrue":
      return (
        indentString +
        "while (true) " +
        statementListToString(
          statement.statementList,
          indent,
          moduleMap,
          codeType
        )
      );

    case "Break":
      return indentString + "break;";

    case "Switch":
      return switchToString(
        statement.switchStatement,
        indent,
        moduleMap,
        codeType
      );
  }
};

const functionDefinitionStatementToString = (
  functionDefinition: nd.FunctionDefinitionStatement,
  indent: number,
  moduleMap: ReadonlyMap<string, nd.Identifer>,
  codeType: nd.CodeType
): string => {
  return (
    indentNumberToString(indent) +
    "const " +
    functionDefinition.name.string +
    " = " +
    typeParameterListToString(functionDefinition.typeParameterList) +
    "(" +
    functionDefinition.parameterList
      .map(
        (parameter) =>
          parameter.name.string +
          typeAnnotation(parameter.type, codeType, moduleMap)
      )
      .join(", ") +
    ")" +
    typeAnnotation(functionDefinition.returnType, codeType, moduleMap) +
    " => " +
    lambdaBodyToString(
      functionDefinition.statementList,
      indent,
      moduleMap,
      codeType
    ) +
    ";"
  );
};

const switchToString = (
  switch_: nd.SwitchStatement,
  indent: number,
  moduleMap: ReadonlyMap<string, nd.Identifer>,
  codeType: nd.CodeType
): string => {
  const indentString = indentNumberToString(indent);
  const caseIndentNumber = indent + 1;
  const caseIndentString = indentNumberToString(caseIndentNumber);
  return (
    indentString +
    "switch (" +
    exprToString(switch_.expr, indent, moduleMap, codeType) +
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
            moduleMap,
            codeType
          )
      )
      .join("\n") +
    "\n" +
    indentString +
    "}"
  );
};

const indentNumberToString = (indent: number): string => "  ".repeat(indent);

/** 関数の引数と戻り値の型を文字列にする */
const functionTypeToString = (
  functionType: nd.FunctionType,
  moduleMap: ReadonlyMap<string, nd.Identifer>
): string => {
  let index = initialIdentiferIndex;
  const parameterList: Array<{
    name: nd.Identifer;
    type: nd.Type;
  }> = [];
  for (const parameter of functionType.parameterList) {
    const indexAndIdentifer = createIdentifer(index, new Set());
    index = indexAndIdentifer.nextIdentiferIndex;
    parameterList.push({
      name: indexAndIdentifer.identifer,
      type: parameter,
    });
  }

  return (
    typeParameterListToString(functionType.typeParameterList) +
    "(" +
    parameterList
      .map(
        (parameter) =>
          parameter.name.string + ": " + typeToString(parameter.type, moduleMap)
      )
      .join(", ") +
    ") => " +
    typeToString(functionType.return, moduleMap)
  );
};

/**
 * 型パラメーターを文字列にする `<T extends unknown>` `<ok extends unknown, error extends unknown>`
 * extends unknown をつけた理由はJSXでも解釈できるようにするため
 */
const typeParameterListToString = (
  typeParameterList: ReadonlyArray<nd.Identifer>
): string => {
  if (typeParameterList.length === 0) {
    return "";
  }
  return (
    "<" +
    typeParameterList
      .map((typeParameter) => typeParameter.string + " extends unknown")
      .join(", ") +
    ">"
  );
};

/**
 * codeTypeがTypeScriptだった場合,`: string`のような型注釈をつける
 */
const typeAnnotation = (
  type_: nd.Type,
  codeType: nd.CodeType,
  moduleMap: ReadonlyMap<string, nd.Identifer>
): string => {
  switch (codeType) {
    case "JavaScript":
      return "";
    case "TypeScript":
      return ": " + typeToString(type_, moduleMap);
  }
};

/**
 * 型の式をコードに変換する
 * @param type_ 型の式
 */
export const typeToString = (
  type_: nd.Type,
  moduleMap: ReadonlyMap<string, nd.Identifer>
): string => {
  switch (type_._) {
    case "Number":
      return "number";

    case "String":
      return "string";

    case "Boolean":
      return "boolean";

    case "Null":
      return "null";

    case "Never":
      return "never";

    case "Void":
      return "void";

    case "Undefined":
      return "undefined";

    case "Object":
      return typeObjectToString(type_.memberTypeList, moduleMap);

    case "Function":
      return functionTypeToString(type_.functionType, moduleMap);

    case "Union":
      return type_.typeList
        .map((pattern) => typeToString(pattern, moduleMap))
        .join(" | ");

    case "Intersection":
      return (
        typeToString(type_.intersectionType.left, moduleMap) +
        " & " +
        typeToString(type_.intersectionType.right, moduleMap)
      );

    case "WithTypeParameter":
      return (
        typeToString(type_.typeWithTypeParameter.type, moduleMap) +
        (type_.typeWithTypeParameter.typeParameterList.length === 0
          ? ""
          : "<" +
            type_.typeWithTypeParameter.typeParameterList
              .map((typeParameter) => typeToString(typeParameter, moduleMap))
              .join(", ") +
            ">")
      );

    case "ScopeInFile":
      return type_.identifer.string;

    case "ScopeInGlobal":
      return type_.identifer.string;

    case "ImportedType": {
      const nameSpaceIdentifer = moduleMap.get(type_.importedType.moduleName);
      if (nameSpaceIdentifer === undefined) {
        throw Error(
          "収集されなかった, モジュールがある moduleName=" +
            type_.importedType.moduleName
        );
      }

      return nameSpaceIdentifer.string + "." + type_.importedType.name.string;
    }

    case "StringLiteral":
      return stringLiteralValueToString(type_.string);
  }
};

const typeObjectToString = (
  memberList: ReadonlyArray<nd.MemberType>,
  moduleMap: ReadonlyMap<string, nd.Identifer>
): string => {
  return (
    "{ " +
    memberList
      .map(
        (member) =>
          documentToString(member.document) +
          "readonly " +
          member.name +
          (member.required ? "" : "?") +
          ": " +
          typeToString(member.type, moduleMap)
      )
      .join("; ") +
    " }"
  );
};
