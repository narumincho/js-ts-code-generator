import * as collect from "./collect";
import * as data from "./data";
import * as identifer from "./identifer";
import * as toString from "./toString";

export { collect };
export { data };
export { identifer };

export const generateCodeAsString = (
  code: data.Code,
  codeType: toString.CodeType
): string => {
  // グローバル空間にある名前とimportしたモジュールのパスを集める
  const usedNameAndModulePath: data.UsedNameAndModulePath = collect.collectCode(
    code
  );
  // インポートしたモジュールの名前空間識別子を当てはめる
  const { importedModuleNameMap } = createImportedModuleName(
    usedNameAndModulePath,
    identifer.initialIdentiferIndex
  );

  return toString.toString(
    code,
    {
      importedModuleNameIdentiferMap: importedModuleNameMap,
      enumTagListMap: usedNameAndModulePath.enumTagListMap
    },
    codeType
  );
};

const createImportedModuleName = (
  usedNameAndModulePath: data.UsedNameAndModulePath,
  identiferIndex: identifer.IdentiferIndex
): {
  importedModuleNameMap: Map<string, identifer.Identifer>;
  nextIdentiferIndex: identifer.IdentiferIndex;
} => {
  const importedModuleNameMap = new Map<string, identifer.Identifer>();
  for (const modulePath of usedNameAndModulePath.modulePathList) {
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
  return {
    importedModuleNameMap,
    nextIdentiferIndex: identiferIndex
  };
};
