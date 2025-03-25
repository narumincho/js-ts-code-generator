import {
  createIdentifier,
  initialIdentifierIndex,
  type TsIdentifier,
} from "./identifier.ts";
import type { UsedNameAndModulePathSet } from "./interface.ts";
import { collectInCode } from "./collect.ts";
import { toString } from "./toString.ts";
import type { CodeType, JsTsCode } from "./data.ts";
export * from "./identifier.ts";
export * from "./interface.ts";
export * from "./data.ts";

export type JsTsCodeToStringParameter = {
  code: JsTsCode;
  codeType: CodeType;
  /**
   * コード生成に使用したライブラリの名前やリンク
   *
   * 指定することによって, モジュールドキュメントに出力される
   *
   * @default {[]}
   */
  generatedByLinks?: ReadonlyArray<string>;
};

/**
 * コードを表現した {@link JsTsCode} からコードの文字列の表現に変換する
 */
export const generateCodeAsString = (
  { code, codeType, generatedByLinks = [] }: JsTsCodeToStringParameter,
): string => {
  // グローバル空間にある名前とimportしたモジュールのパスを集める
  const usedNameAndModulePath: UsedNameAndModulePathSet = collectInCode(code);

  return toString(
    code,
    {
      moduleMap: createImportedModuleName(usedNameAndModulePath),
      usedNameSet: usedNameAndModulePath.usedNameSet,
      codeType,
    },
    generatedByLinks,
  );
};

/**
 * 使われている名前, モジュールのパスから, モジュールのパスとnamed importの識別子のMapを生成する
 * @param usedNameAndModulePath
 */
const createImportedModuleName = (
  usedNameAndModulePath: UsedNameAndModulePathSet,
): ReadonlyMap<string, TsIdentifier> => {
  let identifierIndex = initialIdentifierIndex;
  const importedModuleNameMap = new Map<string, TsIdentifier>();
  for (const modulePath of usedNameAndModulePath.modulePathSet) {
    const identifierAndNextIdentifierIndex = createIdentifier(
      identifierIndex,
      usedNameAndModulePath.usedNameSet,
    );
    importedModuleNameMap.set(
      modulePath,
      identifierAndNextIdentifierIndex.identifier,
    );
    identifierIndex = identifierAndNextIdentifierIndex.nextIdentifierIndex;
  }
  return importedModuleNameMap;
};
