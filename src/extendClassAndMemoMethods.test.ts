import { vi, describe, it, expect } from "vitest";
import { extendClassAndMemoMethods } from "./extendClassAndMemoMethods";

describe("extendClassAndMemoMethods", () => {
  it("should return new class(constructor)", () => {
    class A {}
    expect(extendClassAndMemoMethods(A, [] as const)).not.toBe(A);
  });

  it("should memoize method for new class(constructor)", () => {
    const fn = vi.fn();
    class A {
      method() {
        fn();
      }
    }

    const B = extendClassAndMemoMethods(A, ["method"] as const);
    const a = new A();
    const b = new B();
    expect(fn).toHaveBeenCalledTimes(0);
    a.method();
    expect(fn).toHaveBeenCalledTimes(1);
    a.method();
    expect(fn).toHaveBeenCalledTimes(2);
    b.method();
    expect(fn).toHaveBeenCalledTimes(3);
    b.method();
    expect(fn).toHaveBeenCalledTimes(3);
    a.method();
    expect(fn).toHaveBeenCalledTimes(4);
  });


  it("should not memoize methods that are not prodvided", () => {
    const fn = vi.fn();

    class A {
      method() {}
      untouchedMethod() {
        fn();
      }
    }

    const B = extendClassAndMemoMethods(A, ["method"] as const);
    const b = new B();

    b.untouchedMethod();
    b.untouchedMethod();
    b.untouchedMethod();
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it("should throw an error if trying to memoize none function property", () => {
    class A {
      public name?: string;
      method() {}
    }

    expect(() => extendClassAndMemoMethods(A, ["name"] as const)).toThrow(new Error("Trying to memoize a non-function"));
  });
});
