import {
  assert,
  assertEquals,
  assertMatch,
  assertNotMatch,
} from "jsr:@std/assert";
import * as jsTs from "./mod.ts";
import * as statement from "./statement.ts";
import * as type from "./type.ts";
import * as expr from "./expr.ts";
import { identifierFromString } from "./identifier.ts";

const expressRequest: jsTs.Type = {
  type: "ImportedType",
  importedType: {
    moduleName: "express",
    nameAndArguments: {
      name: identifierFromString("Request"),
      arguments: [],
    },
  },
};

const expressResponse: jsTs.Type = {
  type: "ImportedType",
  importedType: {
    moduleName: "express",
    nameAndArguments: {
      name: identifierFromString("Response"),
      arguments: [],
    },
  },
};

const sampleCode: jsTs.Module = {
  definitionList: [
    jsTs.definitionFunction({
      export: true,
      isAsync: false,
      name: identifierFromString("middleware"),
      typeParameterList: [],
      parameterList: [
        {
          name: identifierFromString("request"),
          document: "expressのリクエスト",
          type: expressRequest,
        },
        {
          name: identifierFromString("response"),
          document: "expressのレスポンス",
          type: expressResponse,
        },
      ],
      document: "ミドルウェア",
      returnType: { type: "Void" },
      statementList: [],
    }),
  ],
  statementList: [],
};
const nodeJsTypeScriptCode = jsTs.generateCodeAsString({
  code: sampleCode,
  codeType: "TypeScript",
});

Deno.test("return string", () => {
  assertEquals(typeof nodeJsTypeScriptCode, "string");
});

Deno.test("include import keyword", () => {
  assertMatch(nodeJsTypeScriptCode, /import/u);
});

Deno.test("include import path", () => {
  assertMatch(nodeJsTypeScriptCode, /express/u);
});

Deno.test("not include revered word", () => {
  const codeAsString = jsTs.generateCodeAsString({
    code: {
      definitionList: [
        jsTs.definitionFunction({
          export: true,
          isAsync: false,
          name: identifierFromString("new"),
          document: "newという名前の関数",
          typeParameterList: [],
          parameterList: [],
          returnType: { type: "Void" },
          statementList: [],
        }),
      ],
      statementList: [],
    },
    codeType: "TypeScript",
  });

  console.log("new code", codeAsString);
  assertNotMatch(codeAsString, /const new =/u);
});

Deno.test("識別子として使えない文字は, 変更される", () => {
  const codeAsString = jsTs.generateCodeAsString({
    code: {
      definitionList: [
        jsTs.definitionFunction({
          export: true,
          isAsync: false,
          name: identifierFromString("0name"),
          document: "0から始まる識別子",
          typeParameterList: [],
          parameterList: [],
          returnType: { type: "Void" },
          statementList: [],
        }),
      ],
      statementList: [],
    },
    codeType: "TypeScript",
  });
  console.log(codeAsString);
  assertNotMatch(codeAsString, /const 0name/u);
});

Deno.test("識別子の生成で識別子に使えない文字が含まれているかどうか", () => {
  const reserved: ReadonlySet<string> = new Set();
  let index = jsTs.initialIdentifierIndex;
  for (let i = 0; i < 999; i += 1) {
    const createIdentifierResult = jsTs.createIdentifier(index, reserved);
    index = createIdentifierResult.nextIdentifierIndex;
    if (!jsTs.isIdentifier(createIdentifierResult.identifier)) {
      throw new Error(
        "create not identifier. identifier=" +
          createIdentifierResult.identifier,
      );
    }
  }
});

Deno.test("escape string literal", () => {
  const nodeJsCode: jsTs.Module = {
    definitionList: [
      {
        type: "variable",
        variable: {
          export: true,
          name: identifierFromString("stringValue"),
          document: "文字列リテラルでエスケープしているか調べる",
          type: { type: "String" },
          expr: expr.stringLiteral(`

          改行
          "ダブルクオーテーション"
  `),
        },
      },
    ],
    statementList: [],
  };
  const codeAsString = jsTs.generateCodeAsString({
    code: nodeJsCode,
    codeType: "TypeScript",
  });
  console.log(codeAsString);
  assertMatch(codeAsString, /\\"/u);
  assertMatch(codeAsString, /\\n/u);
});

Deno.test("include function parameter name", () => {
  const nodeJsCode: jsTs.Module = {
    definitionList: [
      jsTs.definitionFunction({
        export: true,
        isAsync: false,
        name: identifierFromString("middleware"),
        document: "ミドルウェア",
        typeParameterList: [],
        parameterList: [
          {
            name: identifierFromString("request"),
            document: "リクエスト",
            type: {
              type: "ImportedType",
              importedType: {
                moduleName: "express",
                nameAndArguments: {
                  name: identifierFromString("Request"),
                  arguments: [],
                },
              },
            },
          },
          {
            name: identifierFromString("response"),
            document: "レスポンス",
            type: {
              type: "ImportedType",
              importedType: {
                moduleName: "express",
                nameAndArguments: {
                  name: identifierFromString("Response"),
                  arguments: [],
                },
              },
            },
          },
        ],
        returnType: { type: "Void" },
        statementList: [
          {
            type: "VariableDefinition",
            variableDefinitionStatement: {
              name: identifierFromString("accept"),
              type: type.union([{ type: "String" }, { type: "Undefined" }]),
              isConst: true,
              expr: expr.get(
                expr.get(
                  expr.variable(identifierFromString("request")),
                  "headers",
                ),
                "accept",
              ),
            },
          },
          {
            type: "If",
            ifStatement: {
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
            },
          },
        ],
      }),
    ],
    statementList: [],
  };
  const code = jsTs.generateCodeAsString({
    code: nodeJsCode,
    codeType: "TypeScript",
  });
  console.log(code);
  assertMatch(code, /request/u);
});

Deno.test("get array index", () => {
  const code = jsTs.generateCodeAsString({
    code: {
      definitionList: [
        jsTs.definitionFunction({
          export: true,
          isAsync: false,
          name: identifierFromString("getZeroIndexElement"),
          document: "Uint8Arrayの0番目の要素を取得する",
          typeParameterList: [],
          parameterList: [
            {
              name: identifierFromString("array"),
              document: "Uint8Array",
              type: type.Uint8Array,
            },
          ],
          returnType: { type: "Number" },
          statementList: [
            statement.return({
              type: "Get",
              getExpr: {
                expr: expr.variable(identifierFromString("array")),
                propertyExpr: expr.numberLiteral(0),
              },
            }),
          ],
        }),
      ],
      statementList: [],
    },
    codeType: "TypeScript",
  });
  console.log(code);
  assertMatch(code, /\[0\]/u);
});

const scopedCode = jsTs.generateCodeAsString({
  code: {
    definitionList: [],
    statementList: [
      {
        type: "VariableDefinition",
        variableDefinitionStatement: {
          name: identifierFromString("sorena"),
          isConst: false,
          type: { type: "String" },
          expr: expr.stringLiteral("それな"),
        },
      },
      statement.consoleLog(expr.variable(identifierFromString("sorena"))),
    ],
  },
  codeType: "JavaScript",
});

Deno.test("statementList in { } scope curly braces", () => {
  console.log(scopedCode);
  assertMatch(scopedCode, /\{[^{]*"それな[^}]*\}/u);
});

Deno.test("ESModules Browser Code not include type ", () => {
  assertNotMatch(scopedCode, /string/);
});

Deno.test("type parameter", () => {
  const code = jsTs.generateCodeAsString({
    code: {
      definitionList: [
        jsTs.definitionFunction({
          export: true,
          isAsync: false,
          name: identifierFromString("sample"),
          document: "",
          typeParameterList: [],
          parameterList: [],
          returnType: type.Promise({ type: "String" }),
          statementList: [],
        }),
      ],
      statementList: [],
    },
    codeType: "TypeScript",
  });
  console.log(code);
  assertMatch(code, /Promise<string>/u);
});

Deno.test("object literal key is escaped", () => {
  const code = jsTs.generateCodeAsString({
    code: {
      definitionList: [],
      statementList: [
        statement.evaluateExpr(
          expr.objectLiteral([
            expr.memberKeyValue("abc", expr.numberLiteral(3)),
            expr.memberKeyValue("a b c", expr.stringLiteral("separated")),
          ]),
        ),
      ],
    },
    codeType: "TypeScript",
  });
  console.log(code);
  assertMatch(code, /"a b c"/u);
});

Deno.test("binary operator combine", () => {
  const code = jsTs.generateCodeAsString({
    code: {
      definitionList: [],
      statementList: [
        statement.evaluateExpr(
          expr.equal(
            expr.equal(
              expr.addition(
                expr.multiplication(
                  expr.numberLiteral(3),
                  expr.numberLiteral(9),
                ),
                expr.multiplication(
                  expr.numberLiteral(7),
                  expr.numberLiteral(6),
                ),
              ),
              expr.addition(
                expr.addition(expr.numberLiteral(2), expr.numberLiteral(3)),
                expr.addition(expr.numberLiteral(5), expr.numberLiteral(8)),
              ),
            ),
            expr.multiplication(
              expr.numberLiteral(5),
              expr.addition(expr.numberLiteral(7), expr.numberLiteral(8)),
            ),
          ),
        ),
      ],
    },
    codeType: "JavaScript",
  });
  console.log(code);
  assert(
    code.includes("3 * 9 + 7 * 6 === 2 + 3 + (5 + 8) === 5 * (7 + 8)"),
  );
});

Deno.test("object literal return need parenthesis", () => {
  const code = jsTs.generateCodeAsString({
    code: {
      definitionList: [
        jsTs.definitionFunction({
          export: true,
          isAsync: false,
          name: identifierFromString("returnObject"),
          document: "",
          typeParameterList: [],
          parameterList: [],
          returnType: type.object([
            {
              name: { type: "string", value: "name" },
              required: true,
              type: { type: "String" },
              document: "",
            },
            {
              name: { type: "string", value: "age" },
              required: true,
              type: { type: "Number" },
              document: "",
            },
          ]),
          statementList: [
            statement.return(
              expr.objectLiteral([
                expr.memberKeyValue("name", expr.stringLiteral("mac")),
                expr.memberKeyValue("age", expr.numberLiteral(10)),
              ]),
            ),
          ],
        }),
      ],
      statementList: [],
    },
    codeType: "TypeScript",
  });
  console.log(code);
  assertMatch(code, /\(\{.*\}\)/u);
});

Deno.test("let variable", () => {
  const v = identifierFromString("v");
  const code = jsTs.generateCodeAsString({
    code: {
      definitionList: [],
      statementList: [
        {
          type: "VariableDefinition",
          variableDefinitionStatement: {
            name: v,
            type: { type: "Number" },
            expr: expr.numberLiteral(10),
            isConst: false,
          },
        },
        {
          type: "Set",
          setStatement: {
            target: expr.variable(v),
            operatorMaybe: undefined,
            expr: expr.numberLiteral(30),
          },
        },
        {
          type: "Set",
          setStatement: {
            target: expr.variable(v),
            operatorMaybe: "Addition",
            expr: expr.numberLiteral(1),
          },
        },
      ],
    },
    codeType: "TypeScript",
  });
  console.log(code);
  assertMatch(code, /let v: number = 10;[\n ]*v = 30;[\n ]*v \+= 1;/u);
});

Deno.test("for of", () => {
  const code: jsTs.Module = {
    definitionList: [],
    statementList: [
      {
        type: "ForOf",
        forOfStatement: {
          elementVariableName: identifierFromString("element"),
          iterableExpr: {
            type: "ArrayLiteral",
            arrayItemList: [
              { expr: expr.numberLiteral(1), spread: false },
              { expr: expr.numberLiteral(2), spread: false },
              {
                expr: {
                  type: "ArrayLiteral",
                  arrayItemList: [
                    { expr: expr.numberLiteral(3), spread: false },
                    { expr: expr.numberLiteral(4), spread: false },
                    { expr: expr.numberLiteral(5), spread: false },
                  ],
                },
                spread: true,
              },
            ],
          },
          statementList: [
            statement.consoleLog(
              expr.variable(identifierFromString("element")),
            ),
          ],
        },
      },
    ],
  };
  const codeAsString = jsTs.generateCodeAsString({
    code,
    codeType: "TypeScript",
  });
  console.log(codeAsString);
  assertMatch(codeAsString, /for .* of \[1, 2, \.\.\.\[3, 4, 5\] *\]/u);
});

Deno.test("switch", () => {
  const code: jsTs.Module = {
    definitionList: [
      {
        type: "typeAlias",
        typeAlias: {
          export: true,
          name: identifierFromString("Result"),
          document: "Result型",
          namespace: [],
          typeParameterList: [
            { name: identifierFromString("error") },
            { name: identifierFromString("ok") },
          ],
          type: type.union([
            type.object([
              {
                name: { type: "string", value: "_" },
                required: true,
                type: { type: "StringLiteral", string: "Ok" },
                document: "",
              },
              {
                name: { type: "string", value: "ok" },
                required: true,
                type: type.scopeInFile(
                  identifierFromString("ok"),
                ),
                document: "",
              },
            ]),
            type.object([
              {
                name: { type: "string", value: "_" },
                required: true,
                type: { type: "StringLiteral", string: "Error" },
                document: "Error",
              },
              {
                name: { type: "string", value: "error" },
                required: true,
                type: type.scopeInFile(
                  identifierFromString("error"),
                ),
                document: "",
              },
            ]),
          ]),
        },
      },
      jsTs.definitionFunction({
        export: true,
        isAsync: false,
        name: identifierFromString("switchSample"),
        document: "switch文のテスト",
        typeParameterList: [
          { name: identifierFromString("ok") },
          { name: identifierFromString("error") },
        ],
        parameterList: [
          {
            name: identifierFromString("value"),
            document: "",
            type: {
              type: "ScopeInGlobal",
              typeNameAndArguments: {
                name: identifierFromString("Result"),
                arguments: [
                  type.scopeInFile(
                    identifierFromString("ok"),
                  ),
                  type.scopeInFile(
                    identifierFromString("error"),
                  ),
                ],
              },
            },
          },
        ],
        returnType: { type: "String" },
        statementList: [
          {
            type: "Switch",
            switchStatement: {
              expr: expr.get(
                expr.variable(identifierFromString("value")),
                "_",
              ),
              patternList: [
                {
                  caseString: "Ok",
                  statementList: [
                    statement.return(
                      expr.callMethod(
                        expr.get(
                          expr.variable(identifierFromString("value")),
                          "ok",
                        ),
                        "toString",
                        [],
                      ),
                    ),
                  ],
                },
                {
                  caseString: "Error",
                  statementList: [
                    statement.return(
                      expr.callMethod(
                        expr.get(
                          expr.variable(identifierFromString("value")),
                          "error",
                        ),
                        "toString",
                        [],
                      ),
                    ),
                  ],
                },
              ],
            },
          },
        ],
      }),
    ],
    statementList: [],
  };
  const codeAsString = jsTs.generateCodeAsString({
    code,
    codeType: "TypeScript",
  });
  console.log(codeAsString);
  assertMatch(codeAsString, /switch \(.+\) \{\n +case .+:/u);
});

Deno.test("Type Assertion", () => {
  const code: jsTs.Module = {
    definitionList: [],
    statementList: [
      statement.evaluateExpr({
        type: "TypeAssertion",
        typeAssertion: {
          expr: expr.objectLiteral([]),
          type: type.Date,
        },
      }),
    ],
  };
  const codeAsString = jsTs.generateCodeAsString({
    code,
    codeType: "TypeScript",
  });
  console.log(codeAsString);
  assertMatch(codeAsString, /as Date/u);
});

Deno.test("Type Assertion With globalThis", () => {
  const code: jsTs.Module = {
    definitionList: [
      jsTs.definitionTypeAlias({
        export: true,
        name: identifierFromString("Date"),
        document: "",
        namespace: [],
        type: { type: "String" },
        typeParameterList: [],
      }),
    ],
    statementList: [
      statement.evaluateExpr({
        type: "TypeAssertion",
        typeAssertion: {
          expr: expr.objectLiteral([]),
          type: type.Date,
        },
      }),
    ],
  };
  const codeAsString = jsTs.generateCodeAsString({
    code,
    codeType: "TypeScript",
  });
  console.log(codeAsString);
  assertMatch(codeAsString, /as globalThis.Date/u);
});

Deno.test("Type Intersection", () => {
  const code: jsTs.Module = {
    definitionList: [
      {
        type: "typeAlias",
        typeAlias: {
          export: true,
          name: identifierFromString("SampleIntersectionType"),
          document: "",
          namespace: [],
          typeParameterList: [],
          type: {
            type: "Intersection",
            intersectionType: {
              left: type.Date,
              right: type.Uint8Array,
            },
          },
        },
      },
    ],
    statementList: [],
  };
  const codeAsString = jsTs.generateCodeAsString({
    code,
    codeType: "TypeScript",
  });
  console.log(codeAsString);
  assertMatch(codeAsString, /Date & Uint8Array/u);
});

Deno.test("object literal spread syntax", () => {
  const code: jsTs.Module = {
    definitionList: [],
    statementList: [
      {
        type: "VariableDefinition",
        variableDefinitionStatement: {
          name: identifierFromString("value"),
          isConst: true,
          type: type.object([
            {
              name: { type: "string", value: "a" },
              required: true,
              type: { type: "String" },
              document: "",
            },
            {
              name: { type: "string", value: "b" },
              required: true,
              type: { type: "Number" },
              document: "",
            },
          ]),
          expr: expr.objectLiteral([
            expr.memberKeyValue("a", expr.stringLiteral("aValue")),
            expr.memberKeyValue("b", expr.numberLiteral(123)),
          ]),
        },
      },
      statement.consoleLog(
        expr.objectLiteral([
          {
            type: "Spread",
            expr: expr.variable(identifierFromString("value")),
          },
          expr.memberKeyValue("b", expr.numberLiteral(987)),
        ]),
      ),
    ],
  };
  const codeAsString = jsTs.generateCodeAsString({
    code,
    codeType: "TypeScript",
  });
  console.log(codeAsString);
  assertMatch(codeAsString, /\{ *\.\.\.value *, *b: 987 \}/u);
});

Deno.test("type property document", () => {
  const code: jsTs.Module = {
    definitionList: [
      {
        type: "typeAlias",
        typeAlias: {
          export: true,
          name: identifierFromString("Time"),
          document: "初期のdefinyで使う時間の内部表現",
          namespace: [],
          typeParameterList: [],
          type: type.object([
            {
              name: { type: "string", value: "day" },
              required: true,
              type: { type: "Number" },
              document: "1970-01-01からの経過日数. マイナスになることもある",
            },
            {
              name: { type: "string", value: "millisecond" },
              required: true,
              type: { type: "Number" },
              document: "日にちの中のミリ秒. 0 to 86399999 (=1000*60*60*24-1)",
            },
          ]),
        },
      },
    ],
    statementList: [],
  };
  const codeAsString = jsTs.generateCodeAsString({
    code,
    codeType: "TypeScript",
  });
  console.log(codeAsString);
  assertMatch(codeAsString, /日にちの中のミリ秒. 0 to 86399999/u);
});

Deno.test("output lambda type parameter", () => {
  const typeParameterIdentifier = identifierFromString("t");
  const code: jsTs.Module = {
    definitionList: [],
    statementList: [
      {
        type: "VariableDefinition",
        variableDefinitionStatement: {
          name: identifierFromString("sampleFunction"),
          isConst: true,
          type: {
            type: "Function",
            functionType: {
              typeParameterList: [{ name: typeParameterIdentifier }],
              parameterList: [
                type.scopeInFile(typeParameterIdentifier),
              ],
              return: type.object([
                {
                  name: { type: "string", value: "value" },
                  required: true,
                  document: "",
                  type: type.scopeInFile(
                    typeParameterIdentifier,
                  ),
                },
                {
                  name: { type: "string", value: "s" },
                  required: true,
                  document: "",
                  type: {
                    type: "ImportedType",
                    importedType: {
                      moduleName: "sampleModule",
                      nameAndArguments: {
                        name: identifierFromString("Type"),
                        arguments: [{ type: "Number" }],
                      },
                    },
                  },
                },
              ]),
            },
          },
          expr: {
            type: "Lambda",
            lambdaExpr: {
              isAsync: false,
              parameterList: [
                {
                  name: identifierFromString("input"),
                  type: type.scopeInFile(
                    typeParameterIdentifier,
                  ),
                },
              ],
              typeParameterList: [{ name: typeParameterIdentifier }],
              returnType: type.object([
                {
                  name: { type: "string", value: "value" },
                  required: true,
                  document: "",
                  type: type.scopeInFile(
                    typeParameterIdentifier,
                  ),
                },
              ]),
              statementList: [
                statement.return(
                  expr.objectLiteral([
                    expr.memberKeyValue(
                      "value",
                      expr.variable(identifierFromString("input")),
                    ),
                  ]),
                ),
              ],
            },
          },
        },
      },
    ],
  };
  const codeAsString = jsTs.generateCodeAsString({
    code,
    codeType: "TypeScript",
  });
  console.log(codeAsString);
  assertMatch(
    codeAsString,
    /<t extends unknown>\(input: t\): \{ readonly value: t \} =>/u,
  );
});

Deno.test("output optional type member", () => {
  const code: jsTs.Module = {
    definitionList: [
      {
        type: "variable",
        variable: {
          export: true,
          name: identifierFromString("value"),
          document: "年齢があってもなくてもいいやつ",
          type: type.object([
            {
              name: { type: "string", value: "name" },
              required: true,
              document: "名前",
              type: { type: "String" },
            },
            {
              name: { type: "string", value: "age" },
              required: false,
              document: "年齢",
              type: { type: "Number" },
            },
          ]),
          expr: expr.objectLiteral([
            expr.memberKeyValue("name", expr.stringLiteral("narumincho")),
          ]),
        },
      },
    ],
    statementList: [],
  };
  const codeAsString = jsTs.generateCodeAsString({
    code,
    codeType: "TypeScript",
  });
  console.log(codeAsString);
  assertMatch(codeAsString, /readonly age\?: number/u);
});

Deno.test("read me code", () => {
  const serverCode: jsTs.Module = {
    definitionList: [
      jsTs.definitionFunction({
        export: true,
        isAsync: false,
        name: identifierFromString("middleware"),
        document: "ミドルウェア",
        typeParameterList: [],
        parameterList: [
          {
            name: identifierFromString("request"),
            document: "リクエスト",
            type: {
              type: "ImportedType",
              importedType: {
                moduleName: "express",
                nameAndArguments: {
                  name: identifierFromString("Request"),
                  arguments: [],
                },
              },
            },
          },
          {
            name: identifierFromString("response"),
            document: "レスポンス",
            type: {
              type: "ImportedType",
              importedType: {
                moduleName: "express",
                nameAndArguments: {
                  name: identifierFromString("Response"),
                  arguments: [],
                },
              },
            },
          },
        ],
        returnType: { type: "Void" },
        statementList: [
          {
            type: "VariableDefinition",
            variableDefinitionStatement: {
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
            },
          },
          {
            type: "If",
            ifStatement: {
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
            },
          },
        ],
      }),
    ],
    statementList: [],
  };
  assertEquals(
    jsTs.generateCodeAsString({
      code: serverCode,
      codeType: "TypeScript",
    }),
    `/** generated by
 * - https://jsr.io/@narumincho/js-ts-code-generator@0.6.0
 * Do not edit!
 *
 * @module
*/

import * as a from "express";

/**
 * ミドルウェア
 * @param request リクエスト
 * @param response レスポンス
 */
export const middleware = (request: a.Request, response: a.Response): void => {
  const accept: string | undefined = request.headers.accept;
  if (accept !== undefined && accept.includes("text/html")) {
    response.setHeader("content-type", "text/html");
  }
};


`,
  );
});

Deno.test("import name", () => {
  const code: jsTs.Module = {
    definitionList: [
      {
        type: "variable",
        variable: {
          export: true,
          name: identifierFromString("a"),
          document: "a",
          expr: expr.stringLiteral("aaa"),
          type: {
            type: "ImportedType",
            importedType: {
              moduleName: "./sampleModule",
              nameAndArguments: {
                name: identifierFromString("A"),
                arguments: [],
              },
            },
          },
        },
      },
    ],
    statementList: [],
  };
  const codeAsString = jsTs.generateCodeAsString({
    code,
    codeType: "TypeScript",
  });
  console.log(codeAsString);
  assertEquals(
    codeAsString,
    `/** generated by
 * - https://jsr.io/@narumincho/js-ts-code-generator@0.6.0
 * Do not edit!
 *
 * @module
*/

import * as b from "./sampleModule";

/**
 * a
 */
export const a: b.A = "aaa";


`,
  );
});
