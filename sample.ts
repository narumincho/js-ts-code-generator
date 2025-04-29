import {
  exportDefinitionFunction,
  generateCodeAsString,
  identifierFromString,
  type Module,
} from "./mod.ts";
import * as statement from "./statement.ts";
import * as type from "./type.ts";
import * as expr from "./expr.ts";

const serverModule: Module = {
  definitionList: [
    exportDefinitionFunction({
      isAsync: false,
      name: identifierFromString("middleware"),
      document: "ミドルウェア",
      typeParameterList: [],
      parameterList: [
        {
          name: identifierFromString("request"),
          document: "リクエスト",
          type: ({
            type: "ImportedType",
            importedType: {
              moduleName: "express",
              nameAndArguments: {
                name: identifierFromString("Request"),
                arguments: [],
              },
            },
          }),
        },
        {
          name: identifierFromString("response"),
          document: "レスポンス",
          type: ({
            type: "ImportedType",
            importedType: {
              moduleName: "express",
              nameAndArguments: {
                name: identifierFromString("Response"),
                arguments: [],
              },
            },
          }),
        },
      ],
      returnType: { type: "Void" },
      statementList: [
        statement.variableDefinition({
          isConst: true,
          name: identifierFromString("accept"),
          type: type.union([{ type: "String" }, { type: "Undefined" }]),
          expr: expr.get(
            expr.get(
              expr.variable(identifierFromString("request")),
              "headers",
            ),
            "accept",
          ),
        }),
        statement.if({
          condition: expr.logicalAnd(
            expr.notEqual(
              expr.variable(identifierFromString("accept")),
              { type: "UndefinedLiteral" },
            ),
            expr.callMethod(
              expr.variable(identifierFromString("accept")),
              "includes",
              [expr.stringLiteral("text/html")],
            ),
          ),
          thenStatementList: [
            statement.evaluateExpr(
              expr.callMethod(
                expr.variable(identifierFromString("response")),
                "setHeader",
                [
                  expr.stringLiteral("content-type"),
                  expr.stringLiteral("text/html"),
                ],
              ),
            ),
          ],
        }),
      ],
    }),
  ],
  statementList: [],
};
const codeAsString = generateCodeAsString({
  code: serverModule,
  codeType: "TypeScript",
});
console.log(codeAsString);
