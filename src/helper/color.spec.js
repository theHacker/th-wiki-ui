import {describe, expect, it} from 'vitest';
import {parseColor} from './color.js';

describe('parseColor()', () => {

    describe('CSS color names', () => {

        describe('takes CSS colors as is as color/backgroundColor style', () => {

            it('lowercase', () => {
                expect(parseColor('red', false)).toEqual({ style: { color: 'red' }});
                expect(parseColor('blue', true)).toEqual({ style: { backgroundColor: 'blue' }});
            });

            it('PascalCase', () => {
                expect(parseColor('DeepSkyBlue', false)).toEqual({ style: { color: 'DeepSkyBlue' }});
                expect(parseColor('MediumAquaMarine', true)).toEqual({ style: { backgroundColor: 'MediumAquaMarine' }});
            });
        });
    });

    describe('Bootstrap classes', () => {

        it('takes Bootstrap classes as is text-/bg- CSS class', () => {
            expect(parseColor('danger', false)).toEqual({ class: 'text-danger' });
            expect(parseColor('success', true)).toEqual({ class: 'text-bg-success' });
        });

        it('Bootstrap classes must be cased correctly', () => {
            expect(parseColor('Danger', false)).toEqual({});
            expect(parseColor('success-eMpHaSiS', true)).toEqual({});
        });

        it('emphasis classes do not work as text-bg- classes', () => {
            expect(parseColor('success-emphasis', false)).toEqual({ class: 'text-success-emphasis' });
            expect(parseColor('success-emphasis', true)).toEqual({});
        });
    });

    describe('CSS colors', () => {

        it('takes #rrggbb and #rgb colors as is as color/backgroundColor style', () => {
            expect(parseColor('#f0f', false)).toEqual({ style: { color: '#f0f' }});
            expect(parseColor('#7f4f00', true)).toEqual({ style: { backgroundColor: '#7f4f00' }});
        });

        it('takes rgb(r,g,b) colors as is as color/backgroundColor style', () => {
            expect(parseColor('rgb(31, 255, 99)', false)).toEqual({ style: { color: 'rgb(31, 255, 99)' }});
            expect(parseColor('rgb(12,32,199)', true)).toEqual({ style: { backgroundColor: 'rgb(12,32,199)' }});
        });
    });

    describe('every other string will return an empty object', () => {

        it('invalid CSS color names', () => {
            expect(parseColor('notacsscolor', false)).toEqual({});
            expect(parseColor('NotACssColor', true)).toEqual({});
        });

        it('invalid Bootstrap classes', () => {
            expect(parseColor('not-a-bootstrap-class', false)).toEqual({});
        });

        it("we don't support all CSS color functions", () => {
            expect(parseColor('hsl(105deg 15% 42%)', false)).toEqual({});
            expect(parseColor('rgba(127,0,255, .55)', true)).toEqual({});
            expect(parseColor('ButtonText', true)).toEqual({});
        });
    });
});
