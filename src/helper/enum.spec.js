import {describe, expect, it} from 'vitest';
import {deserializeEnumValue, serializeEnumValue} from './enum.js';

describe('Enum<=>string translations', () => {

    const TestEnum1 = Object.freeze({
        FOO: Symbol('FOO'),
        BAR: Symbol('BAR'),
        OTHER: Symbol('OTHER'),
        MULTIPLE_WORDS_IN_VALUE: Symbol('MULTIPLE_WORDS_IN_VALUE'),
        SECTION_FOO__VALUE_X: Symbol('SECTION_FOO__VALUE_X')
    });

    const TestEnum2 = Object.freeze({
        A: Symbol('A'),
        B: Symbol('B')
    });

    describe('serializeEnumValue()', () => {

        it('serializes correctly and in lowercase kebab-case', () => {
            expect(serializeEnumValue(TestEnum1.FOO, TestEnum1)).toBe('foo');
            expect(serializeEnumValue(TestEnum1.OTHER, TestEnum1)).toBe('other');
            expect(serializeEnumValue(TestEnum1.MULTIPLE_WORDS_IN_VALUE, TestEnum1)).toBe('multiple-words-in-value');
            expect(serializeEnumValue(TestEnum1.SECTION_FOO__VALUE_X, TestEnum1)).toBe('section-foo--value-x');
        });

        it('serializes non-enum values as null', () => {
            expect(serializeEnumValue(null, TestEnum1)).toBeNull();
            expect(serializeEnumValue(undefined, TestEnum1)).toBeNull();
            expect(serializeEnumValue(false, TestEnum1)).toBeNull();
            expect(serializeEnumValue("Foo", TestEnum1)).toBeNull();
            expect(serializeEnumValue(42, TestEnum1)).toBeNull();
            expect(serializeEnumValue({ A: 42, B: 'whatever' }, TestEnum1)).toBeNull();
        });

        it('serializes foreign enums values as null', () => {
            expect(serializeEnumValue(TestEnum1.FOO, TestEnum2)).toBeNull();
        });

        it('will throw when no object is used for enumObject', () => {
            expect(() => serializeEnumValue(TestEnum1.FOO, "notAnObject")).toThrow("Illegal enumObject");
            expect(() => serializeEnumValue(TestEnum1.FOO, 6666666)).toThrow("Illegal enumObject");
            expect(() => serializeEnumValue(TestEnum1.FOO, null)).toThrow("Illegal enumObject");
            expect(() => serializeEnumValue(TestEnum1.FOO, undefined)).toThrow("Illegal enumObject");
        });

        it('has unexpected behavior when there is no valid object is used for enumObject', () => {
            const notRealAnEnumObject = {
                A: {
                    foo: 4711,
                    bar: "baz"
                }
            }

            expect(serializeEnumValue(TestEnum2.A, notRealAnEnumObject)).toBeNull(); // "===" won't match, so null is returned
            expect(serializeEnumValue(TestEnum2.B, notRealAnEnumObject)).toBeNull();
        });
    });

    describe('deserializeEnumValue()', () => {

        it('deserializes correctly', () => {
            expect(deserializeEnumValue("FOO", TestEnum1)).toBe(TestEnum1.FOO);
            expect(deserializeEnumValue("OTHER", TestEnum1)).toBe(TestEnum1.OTHER);
        });

        it('deserializes case-insensitive', () => {
            expect(deserializeEnumValue("Bar", TestEnum1)).toBe(TestEnum1.BAR);
            expect(deserializeEnumValue("bar", TestEnum1)).toBe(TestEnum1.BAR);
            expect(deserializeEnumValue("bAR", TestEnum1)).toBe(TestEnum1.BAR);

            expect(deserializeEnumValue("Вar", TestEnum1)).toBeNull(); // cyrillic Ve, just looks like "B"
        });

        it('deserializes hyphens and underscores', () => {
            expect(deserializeEnumValue("multiple-words-in-value", TestEnum1))
                .toBe(TestEnum1.MULTIPLE_WORDS_IN_VALUE);

            expect(deserializeEnumValue("MULTIPLE_WORDS_IN_VALUE", TestEnum1))
                .toBe(TestEnum1.MULTIPLE_WORDS_IN_VALUE);

            expect(deserializeEnumValue("multIple-WORDS_iN-ValuE", TestEnum1))
                .toBe(TestEnum1.MULTIPLE_WORDS_IN_VALUE);


            expect(deserializeEnumValue("section-foo--value-x", TestEnum1))
                .toBe(TestEnum1.SECTION_FOO__VALUE_X);

            expect(deserializeEnumValue("secTion-FoO-_vaLue_X", TestEnum1))
                .toBe(TestEnum1.SECTION_FOO__VALUE_X);
        });

        it('deserializes unknown values as null', () => {
            expect(deserializeEnumValue("NonExisting", TestEnum1)).toBeNull();
            expect(deserializeEnumValue("C", TestEnum2)).toBeNull();
        });

        it('throws when trying to deserialize non-strings values', () => {
            expect(() => { deserializeEnumValue(null, TestEnum2) })
                .toThrow('Invalid value "null".');

            expect(() => { deserializeEnumValue(undefined, TestEnum2) })
                .toThrow('Invalid value "undefined".');

            expect(() => { deserializeEnumValue(false, TestEnum2) })
                .toThrow('Invalid value "false".');

            expect(() => { deserializeEnumValue(42, TestEnum2) })
                .toThrow('Invalid value "42".');

            expect(() => { deserializeEnumValue({ A: 42, B: 'whatever' }, TestEnum2) })
                .toThrow('Invalid value "[object Object]".');
        });

        it('will throw when no object is used for enumObject', () => {
            expect(() => deserializeEnumValue("foo", "notAnObject")).toThrow("Illegal enumObject");
            expect(() => deserializeEnumValue("foo", 6666666)).toThrow("Illegal enumObject");
            expect(() => deserializeEnumValue("foo", null)).toThrow("Illegal enumObject");
            expect(() => deserializeEnumValue("foo", undefined)).toThrow("Illegal enumObject");
        });

        it('has unexpected behavior when there is no valid object is used for enumObject', () => {
            const notRealAnEnumObject = {
                FOO: {
                    a: 42,
                    b: "baz"
                }
            }

            expect(deserializeEnumValue("foo", notRealAnEnumObject)).toStrictEqual({ a: 42, b: "baz" }); // just returns the property as is
            expect(deserializeEnumValue("bar", notRealAnEnumObject)).toBeNull();
        });
    });
});
