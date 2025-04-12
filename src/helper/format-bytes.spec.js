import {describe, expect, it} from 'vitest';
import {formatBytes} from './format-bytes.js';

describe('formatBytes()', () => {

    it('handles 0, 1, 2 correctly', () => {
        expect(formatBytes(0)).toBe('0 bytes');
        expect(formatBytes(1)).toBe('1 byte');
        expect(formatBytes(2)).toBe('2 bytes');
        expect(formatBytes(42)).toBe('42 bytes');
    });

    it('calculates units correctly, KiB has 2 digits, MiB+ have 1 digit', () => {
        expect(formatBytes(711)).toBe('711 bytes');
        expect(formatBytes(256 * 1024)).toBe('256.0 KiB');
        expect(formatBytes(99 * 1024 * 1024)).toBe('99.00 MiB');
        expect(formatBytes(2 * 1024 * 1024 * 1024)).toBe('2.00 GiB');
        expect(formatBytes(111 * 1024 * 1024 * 1024 * 1024)).toBe('111.00 TiB');
        expect(formatBytes(654 * 1024 * 1024 * 1024 * 1024 * 1024)).toBe('654.00 PiB');
        expect(formatBytes(42 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024)).toBe('42.00 EiB');
    });

    it('EiB is the greatest unit', () => {
        expect(formatBytes(99999 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024)).toBe('99999.00 EiB');
    });

    it('switch units from 0.9 onwards', () => {
        expect(formatBytes(921)).toBe('921 bytes');
        expect(formatBytes(922)).toBe('0.9 KiB');

        expect(formatBytes(943718)).toBe('921.6 KiB');
        expect(formatBytes(943719)).toBe('0.90 MiB');

        expect(formatBytes(966367641)).toBe('921.60 MiB');
        expect(formatBytes(966367642)).toBe('0.90 GiB');

        expect(formatBytes(989560464998)).toBe('921.60 GiB');
        expect(formatBytes(989560464999)).toBe('0.90 TiB');

        expect(formatBytes(1013309916158361)).toBe('921.60 TiB');
        expect(formatBytes(1013309916158362)).toBe('0.90 PiB');

        /* eslint-disable no-loss-of-precision */
        expect(formatBytes(1037629354146162239)).toBe('921.60 PiB'); // 1037629354146162278 cannot be represented exactly, taking next adjacent number
        expect(formatBytes(1037629354146162300)).toBe('0.90 EiB'); //   1037629354146162279 cannot be represented exactly, taking next adjacent number
        /* eslint-enable no-loss-of-precision */
    });

    it('should return null for negative or invalid values', () => {
        expect(formatBytes(-1024)).toBeNull();
        expect(formatBytes(47.11)).toBeNull();
        expect(formatBytes(Infinity)).toBeNull();
        expect(formatBytes(NaN)).toBeNull();
    });
});
