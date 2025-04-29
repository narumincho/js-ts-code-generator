import type { TsIdentifier } from "./identifier.ts";

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
  | { readonly type: "function"; readonly function: Function }
  | { readonly type: "variable"; readonly variable: Variable };

/**
 * JavaScript の 文
 */
export type Statement =
  | { readonly type: "EvaluateExpr"; readonly tsExpr: TsExpr }
  | { readonly type: "Set"; readonly setStatement: SetStatement }
  | { readonly type: "If"; readonly ifStatement: IfStatement }
  | { readonly type: "ThrowError"; readonly tsExpr: TsExpr }
  | { readonly type: "Return"; readonly tsExpr: TsExpr }
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
  /**
   * 名前空間
   */
  readonly namespace: ReadonlyArray<TsIdentifier>;
  /**
   * 型の名前
   */
  readonly name: TsIdentifier;
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
  readonly type: TsType;
};

/**
 * 外部に公開する関数
 */
export type Function = {
  readonly isAsync: boolean;
  /**
   * 外部に公開する関数の名前
   */
  readonly name: TsIdentifier;
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
  readonly returnType: TsType;
  /**
   * 関数の本体
   */
  readonly statementList: ReadonlyArray<Statement>;
};

/**
 * JavaScript の 式
 */
export type TsExpr =
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
    readonly tsMemberList: ReadonlyArray<TsMember>;
  }
  | { readonly type: "Lambda"; readonly lambdaExpr: LambdaExpr }
  | { readonly type: "Variable"; readonly tsIdentifier: TsIdentifier }
  | { readonly type: "GlobalObjects"; readonly tsIdentifier: TsIdentifier }
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

export type Variable = {
  /**
   * 変数の名前
   */
  readonly name: TsIdentifier;
  /**
   * ドキュメント
   */
  readonly document: string;
  /**
   * 変数の型
   */
  readonly type: TsType | undefined;
  /**
   * 変数の式
   */
  readonly expr: TsExpr;
  /** 外部に公開しないか */
  readonly private?: boolean;
};

export type TsType =
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
    readonly tsMemberTypeList: ReadonlyArray<TsMemberType>;
  }
  | { readonly type: "Function"; readonly functionType: FunctionType }
  | { readonly type: "Union"; readonly tsTypeList: ReadonlyArray<TsType> }
  | {
    readonly type: "Intersection";
    readonly intersectionType: IntersectionType;
  }
  | { readonly type: "ImportedType"; readonly importedType: ImportedType }
  | {
    readonly type: "ScopeInFile";
    readonly typeNameAndTypeParameter: TypeNameAndArguments;
  }
  | {
    readonly type: "ScopeInGlobal";
    readonly typeNameAndTypeParameter: TypeNameAndArguments;
  }
  | {
    readonly type: "WithNamespace";
    readonly namespace: NonEmptyArray<TsIdentifier>;
    readonly typeNameAndTypeParameter: TypeNameAndArguments;
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
  readonly target: TsExpr;
  /**
   * 演算子を=の左につける
   */
  readonly operatorMaybe: BinaryOperator | undefined;
  /**
   * 式
   */
  readonly expr: TsExpr;
};

/**
 * if文
 */
export type IfStatement = {
  /**
   * 条件の式
   */
  readonly condition: TsExpr;
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
  readonly expr: TsExpr;
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
  readonly left: TsExpr;
  /**
   * 右の式
   */
  readonly right: TsExpr;
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
  readonly name: TsIdentifier;
  /**
   * 変数の型
   */
  readonly type: TsType;
  /**
   * 式
   */
  readonly expr: TsExpr;
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
  readonly name: TsIdentifier;
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
  readonly returnType: TsType;
  /**
   * 関数本体
   */
  readonly statementList: ReadonlyArray<Statement>;
};

export type TypeParameter = {
  readonly name: TsIdentifier;
  readonly constraint?: TsType;
};

/**
 * for文
 */
export type ForStatement = {
  /**
   * カウンタ変数名
   */
  readonly counterVariableName: TsIdentifier;
  /**
   * ループの上限の式
   */
  readonly untilExpr: TsExpr;
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
  readonly expr: TsExpr;
  /**
   * case "text": { statementList }
   */
  readonly patternList: ReadonlyArray<TsPattern>;
};

export type TryCatchStatement = {
  readonly tryStatementList: ReadonlyArray<Statement>;
  readonly catchParameter: TsIdentifier;
  readonly catchStatementList: ReadonlyArray<Statement>;
};

/**
 * switch文のcase "text": { statementList } の部分
 */
export type TsPattern = {
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
  readonly elementVariableName: TsIdentifier;
  /**
   * 繰り返す対象
   */
  readonly iterableExpr: TsExpr;
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
  readonly name: TsIdentifier;
  /**
   * ドキュメント
   */
  readonly document: string;
  /**
   * パラメーターの型
   */
  readonly type: TsType;
};

/**
 * 条件演算子
 */
export type ConditionalOperatorExpr = {
  /**
   * 条件の式
   */
  readonly condition: TsExpr;
  /**
   * 条件がtrueのときに評価される式
   */
  readonly thenExpr: TsExpr;
  /**
   * 条件がfalseのときに評価される式
   */
  readonly elseExpr: TsExpr;
};

/**
 * 配列リテラルの要素
 */
export type ArrayItem = {
  /**
   * 式
   */
  readonly expr: TsExpr;
  /**
   * スプレッド ...a のようにするか
   */
  readonly spread: boolean;
};

/**
 * JavaScriptのオブジェクトリテラルの要素
 */
export type TsMember =
  | { readonly type: "Spread"; readonly tsExpr: TsExpr }
  | { readonly type: "KeyValue"; readonly keyValue: KeyValue };

/**
 * 文字列のkeyと式のvalue
 */
export type KeyValue = {
  /**
   * key
   */
  readonly key: TsExpr;
  /**
   * value
   */
  readonly value: TsExpr;
};
/**
 * ラムダ式
 */
export type LambdaExpr = {
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
  readonly returnType: TsType;
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
  readonly name: TsIdentifier;
};

/**
 * プロパティアクセス
 */
export type GetExpr = {
  /**
   * 式
   */
  readonly expr: TsExpr;
  /**
   * プロパティの式
   */
  readonly propertyExpr: TsExpr;
};

/**
 * 式と呼ぶパラメーター
 */
export type CallExpr = {
  /**
   * 呼ばれる式
   */
  readonly expr: TsExpr;
  /**
   * パラメーター
   */
  readonly parameterList: ReadonlyArray<TsExpr>;
};

/**
 * 型アサーション
 */
export type TypeAssertion = {
  /**
   * 型アサーションを受ける式
   */
  readonly expr: TsExpr;
  /**
   * 型
   */
  readonly type: TsType;
};

export type WithTypeArguments = {
  /**
   * 型アサーションを受ける式
   */
  readonly expr: TsExpr;
  /**
   * 型
   */
  readonly types: ReadonlyArray<TsType>;
};

/**
 * オブジェクトのメンバーの型
 */
export type TsMemberType = {
  /**
   * プロパティ名
   */
  readonly name: PropertyName;
  /**
   * 必須かどうか falseの場合 ? がつく
   */
  readonly required: boolean;
  /**
   * 型
   */
  readonly type: TsType;
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
  readonly value: TsExpr;
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
  readonly parameterList: ReadonlyArray<TsType>;
  /**
   * 戻り値の型
   */
  readonly return: TsType;
};

/**
 * パラメーター付きの型
 */
export type TsTypeWithTypeParameter = {
  /**
   * パラメーターをつけられる型
   */
  readonly type: TsType;
  /**
   * パラメーターに指定する型. なにも要素を入れなけければ T<>ではなく T の形式で出力される
   */
  readonly typeParameterList: ReadonlyArray<TsType>;
};

/**
 * 交差型
 */
export type IntersectionType = {
  /**
   * 左に指定する型
   */
  readonly left: TsType;
  /**
   * 右に指定する型
   */
  readonly right: TsType;
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
  readonly name: TsIdentifier;
  readonly arguments: ReadonlyArray<TsType>;
};

/**
 * 関数のパラメーター. パラメーター名, 型
 */
export type Parameter = {
  /**
   * パラメーター名
   */
  readonly name: TsIdentifier;
  /**
   * パラメーターの型
   */
  readonly type: TsType;
};
