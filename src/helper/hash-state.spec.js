import {describe, expect, it} from 'vitest';
import {enumSymbolToString, stringToEnumSymbolToString} from './hash-state.js';

describe('Enum<=>string translations', () => {

    const TestEnum1 = {
        Foo: Symbol('Foo'),
        Bar: Symbol('Bar'),
        Other: Symbol("This description is differently from the enum's name")
    };

    const TestEnum2 = {
        A: Symbol('A'),
        B: Symbol('B')
    };

    describe('enumSymbolToString()', () => {

        it('serializes correctly', () => {
            expect(enumSymbolToString(TestEnum1.Foo, TestEnum1)).toBe('Foo');
            expect(enumSymbolToString(TestEnum1.Other, TestEnum1)).toBe('Other');
        });

        it('serializes non-enum values as null', () => {
            expect(enumSymbolToString(null, TestEnum1)).toBeNull();
            expect(enumSymbolToString(undefined, TestEnum1)).toBeNull();
            expect(enumSymbolToString(false, TestEnum1)).toBeNull();
            expect(enumSymbolToString("Foo", TestEnum1)).toBeNull();
            expect(enumSymbolToString(42, TestEnum1)).toBeNull();
            expect(enumSymbolToString({ A: 42, B: 'whatever' }, TestEnum1)).toBeNull();
        });

        it('serializes foreign enums values as null', () => {
            expect(enumSymbolToString(TestEnum1.Foo, TestEnum2)).toBeNull();
        });

        it('will throw when no object is used for enumObject', () => {
            expect(() => enumSymbolToString(TestEnum1.Foo, "notAnObject")).toThrow("Illegal enumObject");
            expect(() => enumSymbolToString(TestEnum1.Foo, 6666666)).toThrow("Illegal enumObject");
            expect(() => enumSymbolToString(TestEnum1.Foo, null)).toThrow("Illegal enumObject");
            expect(() => enumSymbolToString(TestEnum1.Foo, undefined)).toThrow("Illegal enumObject");
        });

        it('has unexpected behavior when there is no valid object is used for enumObject', () => {
            const notRealAnEnumObject = {
                A: {
                    foo: 4711,
                    bar: "baz"
                }
            }

            expect(enumSymbolToString(TestEnum2.A, notRealAnEnumObject)).toBeNull(); // "===" won't match, so null is returned
            expect(enumSymbolToString(TestEnum2.B, notRealAnEnumObject)).toBeNull();
        });
    });

    describe('stringToEnumSymbolToString()', () => {

        it('deserializes correctly', () => {
            expect(stringToEnumSymbolToString("Foo", TestEnum1)).toBe(TestEnum1.Foo);
            expect(stringToEnumSymbolToString("Other", TestEnum1)).toBe(TestEnum1.Other);
        });

        it('deserializes case-sensitive', () => {
            expect(stringToEnumSymbolToString("Bar", TestEnum1)).toBe(TestEnum1.Bar);
            expect(stringToEnumSymbolToString("Вar", TestEnum1)).toBeNull(); // cyrillic Ve, just looks like "B"
            expect(stringToEnumSymbolToString("bar", TestEnum1)).toBeNull();
            expect(stringToEnumSymbolToString("bAR", TestEnum1)).toBeNull();
        });

        it('deserializes unknown values as null', () => {
            expect(stringToEnumSymbolToString("NonExisting", TestEnum1)).toBeNull();
            expect(stringToEnumSymbolToString("C", TestEnum2)).toBeNull();
        });

        it('deserializes non-strings values as null', () => {
            expect(stringToEnumSymbolToString(null, TestEnum2)).toBeNull();
            expect(stringToEnumSymbolToString(undefined, TestEnum2)).toBeNull();
            expect(stringToEnumSymbolToString(false, TestEnum2)).toBeNull();
            expect(stringToEnumSymbolToString(42, TestEnum2)).toBeNull();
            expect(stringToEnumSymbolToString({ A: 42, B: 'whatever' }, TestEnum2)).toBeNull();
        });

        it('will throw when no object is used for enumObject', () => {
            expect(() => stringToEnumSymbolToString("Foo", "notAnObject")).toThrow("Illegal enumObject");
            expect(() => stringToEnumSymbolToString("Foo", 6666666)).toThrow("Illegal enumObject");
            expect(() => stringToEnumSymbolToString("Foo", null)).toThrow("Illegal enumObject");
            expect(() => stringToEnumSymbolToString("Foo", undefined)).toThrow("Illegal enumObject");
        });

        it('has unexpected behavior when there is no valid object is used for enumObject', () => {
            const notRealAnEnumObject = {
                foo: {
                    a: 42,
                    b: "baz"
                }
            }

            expect(stringToEnumSymbolToString("foo", notRealAnEnumObject)).toStrictEqual({ a: 42, b: "baz" }); // just returns the property as is
            expect(stringToEnumSymbolToString("bar", notRealAnEnumObject)).toBeNull();
        });
    });
});
