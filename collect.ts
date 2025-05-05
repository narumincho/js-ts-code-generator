import type * as d from "./data.ts";
import type { Identifier } from "./identifier.ts";

/**
 * 使われている名前, モジュールのパス
 * モジュールの識別子を作るのに使う
 */
export type UsedNameAndModulePathSet = {
  readonly usedNameSet: ReadonlySet<Identifier>;
  readonly modulePathSet: ReadonlySet<string>;
};

/**
 * グローバル空間とルートにある関数名の引数名、使っている外部モジュールのパスを集める
 */
export const collectInCode = (code: d.Module): UsedNameAndModulePathSet => {
  const rootScopeIdentifierSet = collectRootScopeIdentifier(
    code.definitionList,
  );

  return concatCollectData(
    collectList(
      code.definitionList,
      (definition) => collectInDefinition(definition, rootScopeIdentifierSet),
    ),
    collectStatementList(
      code.statementList,
      [],
      [],
      rootScopeIdentifierSet,
      new Set(),
    ),
  );
};

type RootScopeIdentifierSet = {
  rootScopeTypeNameSet: ReadonlySet<Identifier>;
  rootScopeVariableName: ReadonlySet<Identifier>;
};

/**
 * 定義の名前を収集する
 */
const collectRootScopeIdentifier = (
  definitionList: ReadonlyArray<d.Definition>,
): RootScopeIdentifierSet => {
  const typeNameSet: Set<Identifier> = new Set();
  const variableNameSet: Set<Identifier> = new Set();
  for (const definition of definitionList) {
    switch (definition.type) {
      case "typeAlias":
        typeNameSet.add(definition.typeAlias.name);
        break;

      case "function":
        variableNameSet.add(definition.function.name);
        break;

      case "variable":
        variableNameSet.add(definition.variable.name);
    }
  }
  return {
    rootScopeTypeNameSet: typeNameSet,
    rootScopeVariableName: variableNameSet,
  };
};

const collectInDefinition = (
  definition: d.Definition,
  rootScopeIdentifierSet: RootScopeIdentifierSet,
): UsedNameAndModulePathSet => {
  switch (definition.type) {
    case "typeAlias":
      return collectInTypeAlias(
        definition.typeAlias,
        rootScopeIdentifierSet,
      );

    case "function":
      return collectInFunctionDefinition(
        definition.function,
        rootScopeIdentifierSet,
      );

    case "variable":
      return collectInVariableDefinition(
        definition.variable,
        rootScopeIdentifierSet,
      );
  }
};

const collectInTypeAlias = (
  typeAlias: d.TypeAlias,
  rootScopeIdentifierSet: RootScopeIdentifierSet,
): UsedNameAndModulePathSet =>
  concatCollectData(
    concatCollectData(
      collectList(typeAlias.typeParameterList, (parameter) =>
        parameter.constraint
          ? collectInType(parameter.constraint, rootScopeIdentifierSet, [])
          : {
            modulePathSet: new Set(),
            usedNameSet: new Set(),
          }),
      {
        usedNameSet: new Set([typeAlias.name]),
        modulePathSet: new Set(),
      },
    ),
    collectInType(typeAlias.type, rootScopeIdentifierSet, [
      new Set(typeAlias.typeParameterList.map((e) =>
        e.name
      )),
    ]),
  );

const collectInFunctionDefinition = (
  function_: d.FunctionDefinition,
  rootScopeIdentifierSet: RootScopeIdentifierSet,
): UsedNameAndModulePathSet => {
  const parameterNameSet = new Set(
    function_.parameterList.map((parameter) => parameter.name),
  );
  const typeParameterNameSet = new Set(
    function_.typeParameterList.map((e) => e.name),
  );
  return concatCollectData(
    concatCollectData(
      concatCollectData(
        {
          modulePathSet: new Set(),
          usedNameSet: new Set([function_.name]),
        },
        collectList(function_.parameterList, (parameter) =>
          concatCollectData(
            {
              usedNameSet: new Set([parameter.name]),
              modulePathSet: new Set(),
            },
            collectInType(
              parameter.type,
              rootScopeIdentifierSet,
              [typeParameterNameSet],
            ),
          )),
      ),
      collectInType(
        function_.returnType,
        rootScopeIdentifierSet,
        [typeParameterNameSet],
      ),
    ),
    collectStatementList(
      function_.statementList,
      [],
      [typeParameterNameSet],
      rootScopeIdentifierSet,
      parameterNameSet,
    ),
  );
};

const collectInVariableDefinition = (
  variable: d.VariableDefinition,
  rootScopeIdentifierSet: RootScopeIdentifierSet,
): UsedNameAndModulePathSet =>
  concatCollectData(
    concatCollectData(
      {
        modulePathSet: new Set(),
        usedNameSet: new Set([variable.name]),
      },
      collectList(
        variable.type === undefined ? [] : [variable.type],
        (element) =>
          collectInType(
            element,
            rootScopeIdentifierSet,
            [new Set()],
          ),
      ),
    ),
    collectInExpr(variable.expr, [], [], rootScopeIdentifierSet),
  );

/**
 * グローバルで使われているものを収集したり、インポートしているものを収集する
 */
const collectInExpr = (
  expr: d.Expr,
  localVariableNameSetList: ReadonlyArray<ReadonlySet<Identifier>>,
  typeParameterSetList: ReadonlyArray<ReadonlySet<Identifier>>,
  rootScopeIdentifierSet: RootScopeIdentifierSet,
): UsedNameAndModulePathSet => {
  switch (expr.type) {
    case "NumberLiteral":
    case "StringLiteral":
    case "BooleanLiteral":
    case "NullLiteral":
    case "UndefinedLiteral":
      return {
        modulePathSet: new Set(),
        usedNameSet: new Set(),
      };

    case "UnaryOperator":
      return collectInExpr(
        expr.unaryOperatorExpr.expr,
        localVariableNameSetList,
        typeParameterSetList,
        rootScopeIdentifierSet,
      );

    case "BinaryOperator":
      return concatCollectData(
        collectInExpr(
          expr.binaryOperatorExpr.left,
          localVariableNameSetList,
          typeParameterSetList,
          rootScopeIdentifierSet,
        ),
        collectInExpr(
          expr.binaryOperatorExpr.right,
          localVariableNameSetList,
          typeParameterSetList,
          rootScopeIdentifierSet,
        ),
      );
    case "ConditionalOperator":
      return concatCollectData(
        collectInExpr(
          expr.conditionalOperatorExpr.condition,
          localVariableNameSetList,
          typeParameterSetList,
          rootScopeIdentifierSet,
        ),
        concatCollectData(
          collectInExpr(
            expr.conditionalOperatorExpr.thenExpr,
            localVariableNameSetList,
            typeParameterSetList,
            rootScopeIdentifierSet,
          ),
          collectInExpr(
            expr.conditionalOperatorExpr.elseExpr,
            localVariableNameSetList,
            typeParameterSetList,
            rootScopeIdentifierSet,
          ),
        ),
      );

    case "ArrayLiteral":
      return collectList(expr.arrayItemList, (item) =>
        collectInExpr(
          item.expr,
          localVariableNameSetList,
          typeParameterSetList,
          rootScopeIdentifierSet,
        ));

    case "ObjectLiteral":
      return collectList(expr.memberList, (member) => {
        switch (member.type) {
          case "Spread":
            return collectInExpr(
              member.expr,
              localVariableNameSetList,
              typeParameterSetList,
              rootScopeIdentifierSet,
            );
          case "KeyValue":
            return collectInExpr(
              member.keyValue.value,
              localVariableNameSetList,
              typeParameterSetList,
              rootScopeIdentifierSet,
            );
        }
      });

    case "Lambda": {
      const parameterNameSet = new Set(
        expr.lambda.parameterList.map((parameter) => parameter.name),
      );
      const newTypeParameterSetList = typeParameterSetList.concat(
        new Set(
          expr.lambda.typeParameterList.map((e) => e.name),
        ),
      );
      const inParameter = collectList(
        expr.lambda.parameterList,
        (oneParameter) => {
          const inParameter: UsedNameAndModulePathSet = {
            usedNameSet: new Set([oneParameter.name]),
            modulePathSet: new Set(),
          };
          return oneParameter.type
            ? concatCollectData(
              inParameter,
              collectInType(
                oneParameter.type,
                rootScopeIdentifierSet,
                newTypeParameterSetList,
              ),
            )
            : inParameter;
        },
      );

      return concatCollectData(
        expr.lambda.returnType
          ? concatCollectData(
            inParameter,
            collectInType(
              expr.lambda.returnType,
              rootScopeIdentifierSet,
              newTypeParameterSetList,
            ),
          )
          : inParameter,
        collectStatementList(
          expr.lambda.statementList,
          localVariableNameSetList,
          newTypeParameterSetList,
          rootScopeIdentifierSet,
          parameterNameSet,
        ),
      );
    }

    case "Variable":
      return {
        modulePathSet: new Set(),
        usedNameSet: new Set(),
      };

    case "GlobalObjects":
      return {
        modulePathSet: new Set(),
        usedNameSet: new Set(),
      };

    case "ImportedVariable":
      return {
        modulePathSet: new Set([expr.importedVariable.moduleName]),
        usedNameSet: new Set([expr.importedVariable.name]),
      };

    case "Get":
      return concatCollectData(
        collectInExpr(
          expr.getExpr.expr,
          localVariableNameSetList,
          typeParameterSetList,
          rootScopeIdentifierSet,
        ),
        collectInExpr(
          expr.getExpr.propertyExpr,
          localVariableNameSetList,
          typeParameterSetList,
          rootScopeIdentifierSet,
        ),
      );

    case "Call":
      return collectCallExpr(
        expr.callExpr,
        localVariableNameSetList,
        typeParameterSetList,
        rootScopeIdentifierSet,
      );

    case "New":
      return collectCallExpr(
        expr.callExpr,
        localVariableNameSetList,
        typeParameterSetList,
        rootScopeIdentifierSet,
      );

    case "TypeAssertion":
      return concatCollectData(
        collectInExpr(
          expr.typeAssertion.expr,
          localVariableNameSetList,
          typeParameterSetList,
          rootScopeIdentifierSet,
        ),
        collectInType(
          expr.typeAssertion.type,
          rootScopeIdentifierSet,
          typeParameterSetList,
        ),
      );
    case "WithTypeArguments":
      return concatCollectData(
        collectInExpr(
          expr.withTypeArguments.expr,
          localVariableNameSetList,
          typeParameterSetList,
          rootScopeIdentifierSet,
        ),
        collectList(
          expr.withTypeArguments.types,
          (argument) =>
            collectInType(
              argument,
              rootScopeIdentifierSet,
              typeParameterSetList,
            ),
        ),
      );
  }
};

const collectCallExpr = (
  callExpr: d.CallExpr,
  localVariableNameSetList: ReadonlyArray<ReadonlySet<Identifier>>,
  typeParameterSetList: ReadonlyArray<ReadonlySet<Identifier>>,
  rootScopeIdentifierSet: RootScopeIdentifierSet,
) =>
  concatCollectData(
    collectInExpr(
      callExpr.expr,
      localVariableNameSetList,
      typeParameterSetList,
      rootScopeIdentifierSet,
    ),
    collectList(callExpr.parameterList, (parameter) =>
      collectInExpr(
        parameter,
        localVariableNameSetList,
        typeParameterSetList,
        rootScopeIdentifierSet,
      )),
  );

const collectStatementList = (
  statementList: ReadonlyArray<d.Statement>,
  localVariableNameSetList: ReadonlyArray<ReadonlySet<Identifier>>,
  typeParameterSetList: ReadonlyArray<ReadonlySet<Identifier>>,
  rootScopeIdentifierSet: RootScopeIdentifierSet,
  parameterNameSet: ReadonlySet<Identifier>,
): UsedNameAndModulePathSet => {
  const newLocalVariableNameSetList = localVariableNameSetList.concat(
    new Set([...parameterNameSet, ...collectNameInStatement(statementList)]),
  );
  return collectList(statementList, (statement) =>
    collectInStatement(
      statement,
      newLocalVariableNameSetList,
      typeParameterSetList,
      rootScopeIdentifierSet,
    ));
};

const collectNameInStatement = (
  statementList: ReadonlyArray<d.Statement>,
): ReadonlySet<Identifier> => {
  const identifierSet: Set<Identifier> = new Set();
  for (const statement of statementList) {
    switch (statement.type) {
      case "VariableDefinition":
        identifierSet.add(statement.variableDefinitionStatement.name);
        break;
      case "FunctionDefinition":
        identifierSet.add(statement.functionDefinitionStatement.name);
    }
  }
  return identifierSet;
};

const collectInStatement = (
  statement: d.Statement,
  localVariableNameSetList: ReadonlyArray<ReadonlySet<Identifier>>,
  typeParameterSetList: ReadonlyArray<ReadonlySet<Identifier>>,
  rootScopeIdentifierSet: RootScopeIdentifierSet,
): UsedNameAndModulePathSet => {
  switch (statement.type) {
    case "EvaluateExpr":
      return collectInExpr(
        statement.expr,
        localVariableNameSetList,
        typeParameterSetList,
        rootScopeIdentifierSet,
      );

    case "Set":
      return concatCollectData(
        collectInExpr(
          statement.setStatement.target,
          localVariableNameSetList,
          typeParameterSetList,
          rootScopeIdentifierSet,
        ),
        collectInExpr(
          statement.setStatement.expr,
          localVariableNameSetList,
          typeParameterSetList,
          rootScopeIdentifierSet,
        ),
      );

    case "If":
      return concatCollectData(
        collectInExpr(
          statement.ifStatement.condition,
          localVariableNameSetList,
          typeParameterSetList,
          rootScopeIdentifierSet,
        ),
        collectStatementList(
          statement.ifStatement.thenStatementList,
          localVariableNameSetList,
          typeParameterSetList,
          rootScopeIdentifierSet,
          new Set(),
        ),
      );

    case "ThrowError":
      return collectInExpr(
        statement.expr,
        localVariableNameSetList,
        typeParameterSetList,
        rootScopeIdentifierSet,
      );

    case "Return":
      return collectInExpr(
        statement.expr,
        localVariableNameSetList,
        typeParameterSetList,
        rootScopeIdentifierSet,
      );

    case "ReturnVoid":
    case "Continue":
      return {
        modulePathSet: new Set(),
        usedNameSet: new Set(),
      };

    case "VariableDefinition":
      return concatCollectData(
        collectInExpr(
          statement.variableDefinitionStatement.expr,
          localVariableNameSetList,
          typeParameterSetList,
          rootScopeIdentifierSet,
        ),
        collectInType(
          statement.variableDefinitionStatement.type,
          rootScopeIdentifierSet,
          typeParameterSetList,
        ),
      );

    case "FunctionDefinition": {
      const parameterNameSet = new Set(
        statement.functionDefinitionStatement.parameterList.map(
          (parameter) => parameter.name,
        ),
      );
      const newTypeParameterSetList = typeParameterSetList.concat(
        new Set(
          statement.functionDefinitionStatement.typeParameterList.map((e) =>
            e.name
          ),
        ),
      );
      return concatCollectData(
        collectList(
          statement.functionDefinitionStatement.parameterList,
          (parameter) =>
            collectInType(
              parameter.type,
              rootScopeIdentifierSet,
              newTypeParameterSetList,
            ),
        ),
        concatCollectData(
          collectInType(
            statement.functionDefinitionStatement.returnType,
            rootScopeIdentifierSet,
            newTypeParameterSetList,
          ),
          collectStatementList(
            statement.functionDefinitionStatement.statementList,
            localVariableNameSetList,
            newTypeParameterSetList,
            rootScopeIdentifierSet,
            parameterNameSet,
          ),
        ),
      );
    }

    case "For":
      return concatCollectData(
        collectInExpr(
          statement.forStatement.untilExpr,
          localVariableNameSetList,
          typeParameterSetList,
          rootScopeIdentifierSet,
        ),
        collectStatementList(
          statement.forStatement.statementList,
          localVariableNameSetList,
          typeParameterSetList,
          rootScopeIdentifierSet,
          new Set([statement.forStatement.counterVariableName]),
        ),
      );

    case "ForOf":
      return concatCollectData(
        collectInExpr(
          statement.forOfStatement.iterableExpr,
          localVariableNameSetList,
          typeParameterSetList,
          rootScopeIdentifierSet,
        ),
        collectStatementList(
          statement.forOfStatement.statementList,
          localVariableNameSetList,
          typeParameterSetList,
          rootScopeIdentifierSet,
          new Set([statement.forOfStatement.elementVariableName]),
        ),
      );

    case "WhileTrue":
      return collectStatementList(
        statement.statementList,
        localVariableNameSetList,
        typeParameterSetList,
        rootScopeIdentifierSet,
        new Set(),
      );
    case "Break":
      return {
        modulePathSet: new Set(),
        usedNameSet: new Set(),
      };

    case "Switch":
      return concatCollectData(
        collectInExpr(
          statement.switchStatement.expr,
          localVariableNameSetList,
          typeParameterSetList,
          rootScopeIdentifierSet,
        ),
        collectList(
          statement.switchStatement.patternList,
          (pattern) =>
            collectStatementList(
              pattern.statementList,
              localVariableNameSetList,
              typeParameterSetList,
              rootScopeIdentifierSet,
              new Set(),
            ),
        ),
      );
    case "TryCatch":
      return concatCollectData(
        collectStatementList(
          statement.tryCatch.tryStatementList,
          localVariableNameSetList,
          typeParameterSetList,
          rootScopeIdentifierSet,
          new Set(),
        ),
        collectStatementList(
          statement.tryCatch.catchStatementList,
          localVariableNameSetList,
          typeParameterSetList,
          rootScopeIdentifierSet,
          new Set([statement.tryCatch.catchParameter]),
        ),
      );
  }
};

/**
 * グローバル空間(グローバル変数、直下の関数の引数名)に出ている型の名前を集める
 * @param type_ 型の式
 */
const collectInType = (
  type_: d.Type,
  rootScopeIdentifierSet: RootScopeIdentifierSet,
  typeParameterSetList: ReadonlyArray<ReadonlySet<Identifier>>,
): UsedNameAndModulePathSet => {
  switch (type_.type) {
    case "Number":
    case "String":
    case "Boolean":
    case "Undefined":
    case "Null":
    case "Never":
    case "Void":
    case "unknown":
    case "uniqueSymbol":
      return {
        modulePathSet: new Set(),
        usedNameSet: new Set(),
      };

    case "Object":
      return collectList(
        [...type_.memberList],
        (member) =>
          collectInType(
            member.type,
            rootScopeIdentifierSet,
            typeParameterSetList,
          ),
      );

    case "Function": {
      const newTypeParameterSetList = typeParameterSetList.concat(
        new Set(type_.functionType.typeParameterList.map((e) => e.name)),
      );
      return concatCollectData(
        collectList(
          type_.functionType.parameterList,
          (parameter) =>
            collectInType(
              parameter,
              rootScopeIdentifierSet,
              newTypeParameterSetList,
            ),
        ),
        collectInType(
          type_.functionType.return,
          rootScopeIdentifierSet,
          newTypeParameterSetList,
        ),
      );
    }

    case "Union":
      return collectList(
        type_.typeList,
        (oneType) =>
          collectInType(oneType, rootScopeIdentifierSet, typeParameterSetList),
      );

    case "Intersection":
      return concatCollectData(
        collectInType(
          type_.intersectionType.left,
          rootScopeIdentifierSet,
          typeParameterSetList,
        ),
        collectInType(
          type_.intersectionType.right,
          rootScopeIdentifierSet,
          typeParameterSetList,
        ),
      );

    case "ImportedType":
      return concatCollectData(
        {
          modulePathSet: new Set([type_.importedType.moduleName]),
          usedNameSet: new Set([type_.importedType.nameAndArguments.name]),
        },
        collectList(
          type_.importedType.nameAndArguments.arguments,
          (parameter) =>
            collectInType(
              parameter,
              rootScopeIdentifierSet,
              typeParameterSetList,
            ),
        ),
      );

    case "ScopeInFile":
      return concatCollectData(
        {
          modulePathSet: new Set(),
          usedNameSet: new Set([type_.typeNameAndArguments.name]),
        },
        collectList(
          type_.typeNameAndArguments.arguments,
          (parameter) =>
            collectInType(
              parameter,
              rootScopeIdentifierSet,
              typeParameterSetList,
            ),
        ),
      );

    case "WithNamespace":
      return concatCollectData(
        {
          modulePathSet: new Set(),
          usedNameSet: new Set([type_.typeNameAndArguments.name]),
        },
        collectList(
          type_.typeNameAndArguments.arguments,
          (parameter) =>
            collectInType(
              parameter,
              rootScopeIdentifierSet,
              typeParameterSetList,
            ),
        ),
      );

    case "ScopeInGlobal":
      return concatCollectData(
        {
          modulePathSet: new Set(),
          usedNameSet: new Set([type_.typeNameAndArguments.name]),
        },
        collectList(
          type_.typeNameAndArguments.arguments,
          (parameter) =>
            collectInType(
              parameter,
              rootScopeIdentifierSet,
              typeParameterSetList,
            ),
        ),
      );

    case "StringLiteral":
      return {
        modulePathSet: new Set(),
        usedNameSet: new Set(),
      };
  }
};

const concatCollectData = (
  collectDataA: UsedNameAndModulePathSet,
  collectDataB: UsedNameAndModulePathSet,
): UsedNameAndModulePathSet => ({
  modulePathSet: new Set([
    ...collectDataA.modulePathSet,
    ...collectDataB.modulePathSet,
  ]),
  usedNameSet: new Set([
    ...collectDataA.usedNameSet,
    ...collectDataB.usedNameSet,
  ]),
});

const collectList = <Element>(
  list: ReadonlyArray<Element>,
  collectFunc: (element: Element) => UsedNameAndModulePathSet,
): UsedNameAndModulePathSet => {
  const modulePathSet: Set<string> = new Set();
  const usedNameSet: Set<Identifier> = new Set();
  for (const element of list) {
    const result = collectFunc(element);
    for (const path of result.modulePathSet) {
      modulePathSet.add(path);
    }
    for (const name of result.usedNameSet) {
      usedNameSet.add(name);
    }
  }
  return {
    modulePathSet,
    usedNameSet,
  };
};
