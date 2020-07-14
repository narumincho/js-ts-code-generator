import * as collect from "./collect";
import * as data from "./data";
import * as identifer from "./identifer";
import * as nd from "./newData";
import * as toString from "./toString";

export const generateCodeAsString = (
  code: nd.Code,
  codeType: nd.CodeType
): string => {
  // グローバル空間にある名前とimportしたモジュールのパスを集める
  const usedNameAndModulePath: data.UsedNameAndModulePathSet = collect.collectInCode(
    code
  );

  return toString.toString(
    code,
    createImportedModuleName(usedNameAndModulePath),
    codeType
  );
};

/**
 * 使われている名前, モジュールのパスから, モジュールのパスとnamed importの識別子のMapを生成する
 * @param usedNameAndModulePath
 */
const createImportedModuleName = (
  usedNameAndModulePath: data.UsedNameAndModulePathSet
): ReadonlyMap<string, nd.Identifer> => {
  let identiferIndex = identifer.initialIdentiferIndex;
  const importedModuleNameMap = new Map<string, nd.Identifer>();
  for (const modulePath of usedNameAndModulePath.modulePathSet) {
    const identiferAndNextIdentiferIndex = identifer.createIdentifer(
      identiferIndex,
      usedNameAndModulePath.usedNameSet
    );
    importedModuleNameMap.set(
      modulePath,
      identiferAndNextIdentiferIndex.identifer
    );
    identiferIndex = identiferAndNextIdentiferIndex.nextIdentiferIndex;
  }
  return importedModuleNameMap;
};
