import type { Identifier } from "./identifier.ts";

export type NonEmptyArray<T> = readonly [T, ...ReadonlyArray<T>];

/**
 * 出力するコードの種類
 */
export type CodeType = "JavaScript" | "TypeScript";

/**
 * TypeScriptやJavaScriptのコードを表現する. TypeScriptでも出力できるように型情報をつける必要がある
 */
export type Module = {
  /**
   * 外部に公開する定義
   */
  readonly definitionList: ReadonlyArray<Definition>;
  /**
   * 定義した後に実行するコード
   */
  readonly statementList: ReadonlyArray<Statement>;
};

export type Definition =
  | { readonly type: "typeAlias"; readonly typeAlias: TypeAlias }
  | { readonly type: "function"; readonly function: FunctionDefinition }
  | { readonly type: "variable"; readonly variable: VariableDefinition };

/**
 * JavaScript の 文
 */
export type Statement =
  | { readonly type: "EvaluateExpr"; readonly expr: Expr }
  | { readonly type: "Set"; readonly setStatement: SetStatement }
  | { readonly type: "If"; readonly ifStatement: IfStatement }
  | { readonly type: "ThrowError"; readonly expr: Expr }
  | { readonly type: "Return"; readonly expr: Expr }
  | { readonly type: "ReturnVoid" }
  | { readonly type: "Continue" }
  | {
    readonly type: "VariableDefinition";
    readonly variableDefinitionStatement: VariableDefinitionStatement;
  }
  | {
    readonly type: "FunctionDefinition";
    readonly functionDefinitionStatement: FunctionDefinitionStatement;
  }
  | { readonly type: "For"; readonly forStatement: ForStatement }
  | { readonly type: "ForOf"; readonly forOfStatement: ForOfStatement }
  | {
    readonly type: "WhileTrue";
    readonly statementList: ReadonlyArray<Statement>;
  }
  | { readonly type: "Break" }
  | { readonly type: "Switch"; readonly switchStatement: SwitchStatement }
  | {
    readonly type: "TryCatch";
    readonly tryCatch: TryCatchStatement;
  };

/**
 * TypeAlias. `export type T = {}`
 */
export type TypeAlias = {
  /** 外部に公開するか */
  readonly export: boolean;

  /**
   * 名前空間
   */
  readonly namespace: ReadonlyArray<Identifier>;
  /**
   * 型の名前
   */
  readonly name: Identifier;
  /**
   * 型パラメーターのリスト
   */
  readonly typeParameterList: ReadonlyArray<TypeParameter>;
  /**
   * ドキュメント
   */
  readonly document: string;
  /**
   * 型本体
   */
  readonly type: Type;
};

/**
 * 外部に公開する関数
 */
export type FunctionDefinition = {
  /** 外部に公開するか */
  readonly export: boolean;

  readonly isAsync: boolean;
  /**
   * 外部に公開する関数の名前
   */
  readonly name: Identifier;
  /**
   * ドキュメント
   */
  readonly document: string;
  /**
   * 型パラメーターのリスト
   */
  readonly typeParameterList: ReadonlyArray<TypeParameter>;
  /**
   * パラメーター
   */
  readonly parameterList: ReadonlyArray<ParameterWithDocument>;
  /**
   * 戻り値の型
   */
  readonly returnType: Type;
  /**
   * 関数の本体
   */
  readonly statementList: ReadonlyArray<Statement>;
};

/**
 * JavaScript の 式
 */
export type Expr =
  | { readonly type: "NumberLiteral"; readonly int32: number }
  | { readonly type: "StringLiteral"; readonly string: string }
  | { readonly type: "BooleanLiteral"; readonly bool: boolean }
  | { readonly type: "NullLiteral" }
  | { readonly type: "UndefinedLiteral" }
  | {
    readonly type: "UnaryOperator";
    readonly unaryOperatorExpr: UnaryOperatorExpr;
  }
  | {
    readonly type: "BinaryOperator";
    readonly binaryOperatorExpr: BinaryOperatorExpr;
  }
  | {
    readonly type: "ConditionalOperator";
    readonly conditionalOperatorExpr: ConditionalOperatorExpr;
  }
  | {
    readonly type: "ArrayLiteral";
    readonly arrayItemList: ReadonlyArray<ArrayItem>;
  }
  | {
    readonly type: "ObjectLiteral";
    readonly memberList: ReadonlyArray<Member>;
  }
  | { readonly type: "Lambda"; readonly lambda: Lambda }
  | { readonly type: "Variable"; readonly identifier: Identifier }
  | { readonly type: "GlobalObjects"; readonly identifier: Identifier }
  | {
    readonly type: "ImportedVariable";
    readonly importedVariable: ImportedVariable;
  }
  | { readonly type: "Get"; readonly getExpr: GetExpr }
  | { readonly type: "Call"; readonly callExpr: CallExpr }
  | { readonly type: "New"; readonly callExpr: CallExpr }
  | { readonly type: "TypeAssertion"; readonly typeAssertion: TypeAssertion }
  | {
    readonly type: "WithTypeArguments";
    readonly withTypeArguments: WithTypeArguments;
  };

export type VariableDefinition = {
  /**
   * 変数の名前
   */
  readonly name: Identifier;
  /**
   * ドキュメント
   */
  readonly document: string;
  /**
   * 変数の型
   */
  readonly type: Type | undefined;
  /**
   * 変数の式
   */
  readonly expr: Expr;

  /** 外部に公開するか */
  readonly export: boolean;
};

export type Type =
  | { readonly type: "Number" }
  | { readonly type: "String" }
  | { readonly type: "Boolean" }
  | { readonly type: "Undefined" }
  | { readonly type: "Null" }
  | { readonly type: "Never" }
  | { readonly type: "Void" }
  | { readonly type: "unknown" }
  | {
    readonly type: "Object";
    readonly memberList: ReadonlyArray<MemberType>;
  }
  | { readonly type: "Function"; readonly functionType: FunctionType }
  | { readonly type: "Union"; readonly typeList: ReadonlyArray<Type> }
  | {
    readonly type: "Intersection";
    readonly intersectionType: IntersectionType;
  }
  | { readonly type: "ImportedType"; readonly importedType: ImportedType }
  | {
    readonly type: "ScopeInFile";
    readonly typeNameAndArguments: TypeNameAndArguments;
  }
  | {
    readonly type: "ScopeInGlobal";
    readonly typeNameAndArguments: TypeNameAndArguments;
  }
  | {
    readonly type: "WithNamespace";
    readonly namespace: NonEmptyArray<Identifier>;
    readonly typeNameAndArguments: TypeNameAndArguments;
  }
  | { readonly type: "StringLiteral"; readonly string: string }
  | { readonly type: "uniqueSymbol" };

/**
 * 代入文
 */
export type SetStatement = {
  /**
   * 対象となる式. 指定の仕方によってはJSのSyntaxErrorになる
   */
  readonly target: Expr;
  /**
   * 演算子を=の左につける
   */
  readonly operatorMaybe: BinaryOperator | undefined;
  /**
   * 式
   */
  readonly expr: Expr;
};

/**
 * if文
 */
export type IfStatement = {
  /**
   * 条件の式
   */
  readonly condition: Expr;
  /**
   * 条件がtrueのときに実行する文
   */
  readonly thenStatementList: ReadonlyArray<Statement>;
};

/**
 * 単項演算子と適用される式
 */
export type UnaryOperatorExpr = {
  /**
   * 単項演算子
   */
  readonly operator: UnaryOperator;
  /**
   * 適用される式
   */
  readonly expr: Expr;
};

/**
 * JavaScriptの単項演算子
 */
export type UnaryOperator =
  | "Minus"
  | "BitwiseNot"
  | "LogicalNot"
  | "typeof"
  | "await";

/**
 * 2項演算子と左右の式
 */
export type BinaryOperatorExpr = {
  /**
   * 2項演算子
   */
  readonly operator: BinaryOperator;
  /**
   * 左の式
   */
  readonly left: Expr;
  /**
   * 右の式
   */
  readonly right: Expr;
};

/**
 * 2項演算子
 */
export type BinaryOperator =
  | "Exponentiation"
  | "Multiplication"
  | "Division"
  | "Remainder"
  | "Addition"
  | "Subtraction"
  | "LeftShift"
  | "SignedRightShift"
  | "UnsignedRightShift"
  | "LessThan"
  | "LessThanOrEqual"
  | "Equal"
  | "NotEqual"
  | "BitwiseAnd"
  | "BitwiseXOr"
  | "BitwiseOr"
  | "LogicalAnd"
  | "LogicalOr"
  | "??";

/**
 * ローカル変数定義
 */
export type VariableDefinitionStatement = {
  /**
   * 変数名
   */
  readonly name: Identifier;
  /**
   * 変数の型
   */
  readonly type: Type;
  /**
   * 式
   */
  readonly expr: Expr;
  /**
   * constかどうか. falseはlet
   */
  readonly isConst: boolean;
};

/**
 * ローカル関数定義
 */
export type FunctionDefinitionStatement = {
  /**
   * 変数名
   */
  readonly name: Identifier;
  /**
   * 型パラメーターのリスト
   */
  readonly typeParameterList: ReadonlyArray<TypeParameter>;
  /**
   * パラメーターのリスト
   */
  readonly parameterList: ReadonlyArray<ParameterWithDocument>;
  /**
   * 戻り値の型
   */
  readonly returnType: Type;
  /**
   * 関数本体
   */
  readonly statementList: ReadonlyArray<Statement>;
};

export type TypeParameter = {
  readonly name: Identifier;
  readonly constraint?: Type;
};

/**
 * for文
 */
export type ForStatement = {
  /**
   * カウンタ変数名
   */
  readonly counterVariableName: Identifier;
  /**
   * ループの上限の式
   */
  readonly untilExpr: Expr;
  /**
   * 繰り返す文
   */
  readonly statementList: ReadonlyArray<Statement>;
};

/**
 * switch文
 */
export type SwitchStatement = {
  /**
   * switch(a) {} の a
   */
  readonly expr: Expr;
  /**
   * case "text": { statementList }
   */
  readonly patternList: ReadonlyArray<Pattern>;
};

export type TryCatchStatement = {
  readonly tryStatementList: ReadonlyArray<Statement>;
  readonly catchParameter: Identifier;
  readonly catchStatementList: ReadonlyArray<Statement>;
};

/**
 * switch文のcase "text": { statementList } の部分
 */
export type Pattern = {
  /**
   * case に使う文字列
   */
  readonly caseString: string;
  /**
   * マッチしたときに実行する部分
   */
  readonly statementList: ReadonlyArray<Statement>;
};

/**
 * forOf文
 */
export type ForOfStatement = {
  /**
   * 要素の変数名
   */
  readonly elementVariableName: Identifier;
  /**
   * 繰り返す対象
   */
  readonly iterableExpr: Expr;
  /**
   * 繰り返す文
   */
  readonly statementList: ReadonlyArray<Statement>;
};

/**
 * ドキュメント付きの関数のパラメーター. パラメーター名, ドキュメント, 型
 */
export type ParameterWithDocument = {
  /**
   * パラメーター名
   */
  readonly name: Identifier;
  /**
   * ドキュメント
   */
  readonly document: string;
  /**
   * パラメーターの型
   */
  readonly type: Type;
};

/**
 * 条件演算子
 */
export type ConditionalOperatorExpr = {
  /**
   * 条件の式
   */
  readonly condition: Expr;
  /**
   * 条件がtrueのときに評価される式
   */
  readonly thenExpr: Expr;
  /**
   * 条件がfalseのときに評価される式
   */
  readonly elseExpr: Expr;
};

/**
 * 配列リテラルの要素
 */
export type ArrayItem = {
  /**
   * 式
   */
  readonly expr: Expr;
  /**
   * スプレッド ...a のようにするか
   */
  readonly spread: boolean;
};

/**
 * JavaScriptのオブジェクトリテラルの要素
 */
export type Member =
  | { readonly type: "Spread"; readonly expr: Expr }
  | { readonly type: "KeyValue"; readonly keyValue: KeyValue };

/**
 * 文字列のkeyと式のvalue
 */
export type KeyValue = {
  /**
   * key
   */
  readonly key: Expr;
  /**
   * value
   */
  readonly value: Expr;
};
/**
 * ラムダ式
 */
export type Lambda = {
  readonly isAsync: boolean;
  /**
   * パラメーターのリスト
   */
  readonly parameterList: ReadonlyArray<Parameter>;
  /**
   * 型パラメーターのリスト
   */
  readonly typeParameterList: ReadonlyArray<TypeParameter>;
  /**
   * 戻り値の型
   */
  readonly returnType: Type | undefined;
  /**
   * ラムダ式本体
   */
  readonly statementList: ReadonlyArray<Statement>;
};

/**
 * インポートした変数
 */
export type ImportedVariable = {
  /**
   * モジュール名, 使うときにはnamedインポートされ, そのモジュール識別子は自動的につけられる
   */
  readonly moduleName: string;
  /**
   * 変数名
   */
  readonly name: Identifier;
};

/**
 * プロパティアクセス
 */
export type GetExpr = {
  /**
   * 式
   */
  readonly expr: Expr;
  /**
   * プロパティの式
   */
  readonly propertyExpr: Expr;
};

/**
 * 式と呼ぶパラメーター
 */
export type CallExpr = {
  /**
   * 呼ばれる式
   */
  readonly expr: Expr;
  /**
   * パラメーター
   */
  readonly parameterList: ReadonlyArray<Expr>;
};

/**
 * 型アサーション
 */
export type TypeAssertion = {
  /**
   * 型アサーションを受ける式
   */
  readonly expr: Expr;
  /**
   * 型
   */
  readonly type: Type;
};

export type WithTypeArguments = {
  /**
   * 型アサーションを受ける式
   */
  readonly expr: Expr;
  /**
   * 型
   */
  readonly types: ReadonlyArray<Type>;
};

/**
 * オブジェクトのメンバーの型
 */
export type MemberType = {
  /**
   * プロパティ名
   */
  readonly name: PropertyName;
  /**
   * 必須かどうか falseの場合 ? がつく
   */
  readonly required: boolean;

  /**
   * readonly かどうか
   */
  readonly readonly: boolean;
  /**
   * 型
   */
  readonly type: Type;
  /**
   * ドキュメント
   */
  readonly document: string;
};

export type PropertyName = {
  readonly type: "string";
  readonly value: string;
} | {
  readonly type: "symbolExpr";
  readonly value: Expr;
};

/**
 * 関数の型
 */
export type FunctionType = {
  /**
   * 型パラメーターのリスト
   */
  readonly typeParameterList: ReadonlyArray<TypeParameter>;
  /**
   * パラメーターの型. 意味のない引数名は適当に付く
   */
  readonly parameterList: ReadonlyArray<Type>;
  /**
   * 戻り値の型
   */
  readonly return: Type;
};

/**
 * パラメーター付きの型
 */
export type TypeWithTypeParameter = {
  /**
   * パラメーターをつけられる型
   */
  readonly type: Type;
  /**
   * パラメーターに指定する型. なにも要素を入れなけければ T<>ではなく T の形式で出力される
   */
  readonly typeParameterList: ReadonlyArray<Type>;
};

/**
 * 交差型
 */
export type IntersectionType = {
  /**
   * 左に指定する型
   */
  readonly left: Type;
  /**
   * 右に指定する型
   */
  readonly right: Type;
};

/**
 * インポートされた型
 */
export type ImportedType = {
  /**
   * モジュール名. namedImportされるがその識別子は自動的に作成される
   */
  readonly moduleName: string;
  /**
   * 型の名前とパラメータ
   */
  readonly nameAndArguments: TypeNameAndArguments;
};

export type TypeNameAndArguments = {
  readonly name: Identifier;
  readonly arguments: ReadonlyArray<Type>;
};

/**
 * 関数のパラメーター. パラメーター名, 型
 */
export type Parameter = {
  /**
   * パラメーター名
   */
  readonly name: Identifier;
  /**
   * パラメーターの型
   */
  readonly type: Type | undefined;
};
