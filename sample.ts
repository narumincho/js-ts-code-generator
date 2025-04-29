import {
  callMethod,
  exportDefinitionFunction,
  generateCodeAsString,
  get,
  identifierFromString,
  logicalAnd,
  type Module,
  notEqual,
  statementEvaluateExpr,
  statementIf,
  statementVariableDefinition,
  stringLiteral,
  typeUnion,
  variable,
} from "./mod.ts";

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
        statementVariableDefinition({
          isConst: true,
          name: identifierFromString("accept"),
          type: typeUnion([{ type: "String" }, { type: "Undefined" }]),
          expr: get(
            get(
              variable(identifierFromString("request")),
              "headers",
            ),
            "accept",
          ),
        }),
        statementIf({
          condition: logicalAnd(
            notEqual(
              variable(identifierFromString("accept")),
              { type: "UndefinedLiteral" },
            ),
            callMethod(
              variable(identifierFromString("accept")),
              "includes",
              [stringLiteral("text/html")],
            ),
          ),
          thenStatementList: [
            statementEvaluateExpr(
              callMethod(
                variable(identifierFromString("response")),
                "setHeader",
                [
                  stringLiteral("content-type"),
                  stringLiteral("text/html"),
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
