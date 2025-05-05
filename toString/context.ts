import type { CodeType } from "../data.ts";
import type { Identifier } from "../identifier.ts";

export type Context = {
  readonly moduleMap: ReadonlyMap<string, Identifier>;
  readonly usedVariableNameSet: ReadonlySet<Identifier>;
  readonly usedTypeNameSet: ReadonlySet<Identifier>;
  readonly codeType: CodeType;
};

export const addUsedName = (context: Context, {
  variableNameSet,
  typeNameSet = [],
}: {
  variableNameSet: Iterable<Identifier>;
  typeNameSet?: Iterable<Identifier>;
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
