import {
  createIdentifier,
  type Identifier,
  initialIdentifierIndex,
} from "./identifier.ts";
import { collectInCode, type UsedNameAndModulePathSet } from "./collect.ts";
import { moduleToString } from "./toString.ts";
import type { CodeType, Module } from "./data.ts";
export * from "./identifier.ts";
export * from "./data.ts";
export * from "./definition.ts";

export type JsTsCodeToStringParameter = {
  code: Module;
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
 * コードを表現した {@link Module} からコードの文字列の表現に変換する
 */
export const generateCodeAsString = (
  { code, codeType, generatedByLinks = [] }: JsTsCodeToStringParameter,
): string => {
  // グローバル空間にある名前とimportしたモジュールのパスを集める
  const usedNameAndModulePath = collectInCode(code);

  return moduleToString(
    code,
    {
      moduleMap: createImportedModuleName(usedNameAndModulePath),
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
): ReadonlyMap<string, Identifier> => {
  let identifierIndex = initialIdentifierIndex;
  const importedModuleNameMap = new Map<string, Identifier>();
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
