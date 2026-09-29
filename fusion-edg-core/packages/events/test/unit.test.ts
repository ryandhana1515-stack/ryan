import { describe, expect, it } from 'vitest';
import { backoffMs } from '@edg/events';

describe('B3 backoff', () => {
  it('doubles per attempt and caps', () => {
    expect([1, 2, 3, 4].map((a) => backoffMs(a, 1000, 5000))).toEqual([1000, 2000, 4000, 5000]);
  });
});
