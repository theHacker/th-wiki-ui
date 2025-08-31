import {describe, expect, it} from 'vitest';
import {base64ToUtf8String} from './base64.js';

describe('base64ToUtf8String()', () => {

    it('works', () => {
        expect(base64ToUtf8String('VGhpcyBpcyBhIHBsYWluIEFTQ0lJIHRleHQu'))
            .toEqual('This is a plain ASCII text.');
    });

    it('works with UTF-8 characters', () => {
        expect(base64ToUtf8String('VGV4dCB3aXRoIMOcbWzDpHV0cyBhbmQg8J+lsA=='))
            .toEqual('Text with Ümläuts and 🥰');
    });
});
