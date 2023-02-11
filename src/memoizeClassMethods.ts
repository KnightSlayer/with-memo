import { ClassWithMemoizedMethods, WithMemoConfig, AnyClass } from "./types";
import { withMemo } from './withMemo'

type ConstructorOf<P extends AnyClass, R> = P extends {
  new (...args:  infer A): infer R;
} ? {
  new (...args: A): R;
} : never

type ConstructorResultType<P extends AnyClass> = P extends {
  new (...args:  any[]): infer Res;
} ? Res: never

export const memoizeClassMethods = <
  Class extends AnyClass,
  MethodsArr extends readonly string[] = [],
  Methods extends MethodsArr[number] = MethodsArr[number],
> (
  OriginalClass: Class,
  methods: MethodsArr,
  memoConfig?: WithMemoConfig
): ConstructorOf<Class, ClassWithMemoizedMethods<ConstructorResultType<Class>, Methods>> => {
  class MemoizedClass extends OriginalClass {}

  for (const method of methods) {
    const originalMethod = (OriginalClass as any).prototype[method];
    if (!(originalMethod instanceof Function)) throw new Error('Trying to memoize a non-function');

    (MemoizedClass as any).prototype[method] = withMemo(originalMethod, memoConfig)
  }

  return MemoizedClass as unknown as ConstructorOf<Class, ClassWithMemoizedMethods<ConstructorResultType<Class>, Methods>>
}

export default memoizeClassMethods