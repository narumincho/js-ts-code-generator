import type { Identifier } from "./identifier.ts";
import type {
  Definition,
  FunctionDefinition,
  ParameterWithDocument,
  Statement,
  Type,
  TypeAlias,
  TypeParameter,
  VariableDefinition,
} from "./data.ts";

type FunctionDefinitionInput = {
  /** 外部に公開するか */
  readonly export: boolean;

  /**
   * @default {false}
   */
  readonly isAsync?: boolean;
  /**
   * 外部に公開する関数の名前
   */
  readonly name: Identifier;
  /**
   * ドキュメント
   *
   * @default {""}
   */
  readonly document?: string;
  /**
   * 型パラメーターのリスト
   *
   * @default {[]}
   */
  readonly typeParameterList?: ReadonlyArray<TypeParameter>;
  /**
   * パラメーター
   */
  readonly parameterList: ReadonlyArray<ParameterWithDocument>;
  /**
   * 戻り値の型
   */
  readonly returnType: Type | undefined;
  /**
   * 関数の本体
   */
  readonly statementList: ReadonlyArray<Statement>;
};

/**
 * 関数の定義
 */
export const definitionFunction = (
  {
    export: isExport,
    name,
    parameterList,
    returnType,
    statementList,
    isAsync = false,
    document = "",
    typeParameterList = [],
  }: FunctionDefinitionInput,
): Definition => ({
  type: "function",
  function: {
    export: isExport,
    name,
    parameterList,
    returnType,
    statementList,
    isAsync,
    document,
    typeParameterList,
  },
});

export const definitionTypeAlias = (
  typeAlias: TypeAlias,
): Definition => ({ type: "typeAlias", typeAlias });

export const definitionVariable = (
  variable: VariableDefinition,
): Definition => ({ type: "variable", variable });
