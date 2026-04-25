import { describe, it, expect, vi, beforeEach } from 'vitest';
import { safeFetch, delay } from '../utils';

describe('utils', () => {
  describe('safeFetch', () => {
    it('should return data on success', async () => {
      const promise = Promise.resolve('success');
      const result = await safeFetch(promise);
      expect(result.data).toBe('success');
      expect(result.error).toBeNull();
    });

    it('should return error and dispatch event on failure', async () => {
      const error = new Error('fail');
      const promise = Promise.reject(error);
      const dispatchSpy = vi.spyOn(window, 'dispatchEvent');
      
      const result = await safeFetch(promise, 'Test Error');
      
      expect(result.data).toBeNull();
      expect(result.error).toBe(error);
      expect(dispatchSpy).toHaveBeenCalled();
      const event = dispatchSpy.mock.calls[0][0] as CustomEvent;
      expect(event.type).toBe('velocity-toast');
      expect(event.detail.message).toBe('Test Error');
    });
  });

  describe('delay', () => {
    it('should resolve after specified time', async () => {
      const start = Date.now();
      await delay(100);
      const end = Date.now();
      expect(end - start).toBeGreaterThanOrEqual(90); // Allow some jitter
    });
  });
});
