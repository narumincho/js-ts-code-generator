import type { CodeType } from "../data.ts";
import type { TsIdentifier } from "../identifier.ts";

export type Context = {
  readonly moduleMap: ReadonlyMap<string, TsIdentifier>;
  readonly usedVariableNameSet: ReadonlySet<TsIdentifier>;
  readonly usedTypeNameSet: ReadonlySet<TsIdentifier>;
  readonly codeType: CodeType;
};

export const addUsedName = (context: Context, {
  variableNameSet,
  typeNameSet = [],
}: {
  variableNameSet: Iterable<TsIdentifier>;
  typeNameSet?: Iterable<TsIdentifier>;
}): Context => {
  return {
    ...context,
    usedVariableNameSet: new Set([
      ...context.usedVariableNameSet,
      ...variableNameSet,
    ]),
    usedTypeNameSet: new Set([
      ...context.usedTypeNameSet,
      ...typeNameSet,
    ]),
  };
};
