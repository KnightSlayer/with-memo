import type { ClassWithMemoizedMethods, WithMemoConfig, AnyClass } from "./types";
import { withMemo } from "./withMemo";

type ConstructorReturnType<P extends AnyClass> = P extends {
  new (...args:  any[]): infer Res;
} ? Res: never

type ConstructorParameters<P extends AnyClass> = P extends {
  new (...args: infer Params): any;
} ? Params: never

export const extendClassAndMemoMethods = <
  Class extends AnyClass,
  MethodsArr extends readonly string[] = [],
  Methods extends MethodsArr[number] = MethodsArr[number],
> (
    OriginalClass: Class,
    methods: MethodsArr,
    memoConfig?: WithMemoConfig,
  ): {
  new (...args: ConstructorParameters<Class>): ClassWithMemoizedMethods<ConstructorReturnType<Class>, Methods>
} => {
  class MemoizedClass extends OriginalClass {}

  for (const method of methods) {
    const originalMethod = (OriginalClass as any).prototype[method];
    if (!(originalMethod instanceof Function)) throw new Error("Trying to memoize a non-function");

    (MemoizedClass as any).prototype[method] = withMemo(originalMethod, memoConfig);
  }

  return MemoizedClass as {
    new (...args: ConstructorParameters<Class>): ClassWithMemoizedMethods<ConstructorReturnType<Class>, Methods>
  };
};

export default extendClassAndMemoMethods;