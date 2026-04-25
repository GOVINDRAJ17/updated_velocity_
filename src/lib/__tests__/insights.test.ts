import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  getBestTimeToLeave, 
  getTrafficLevel, 
  getTrafficColor, 
  getRouteEfficiencyScore,
  isFillingFast,
  computeBadges
} from '../insights';

describe('insights', () => {
  describe('getBestTimeToLeave', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });
    
    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return "Leave NOW" if start is very soon', () => {
      const now = new Date('2026-04-24T10:00:00');
      vi.setSystemTime(now);
      const ride = { start_datetime: '2026-04-24T10:10:00' };
      expect(getBestTimeToLeave(ride)).toBe('Leave NOW');
    });

    it('should return relative time if start is within an hour', () => {
      const now = new Date('2026-04-24T10:00:00');
      vi.setSystemTime(now);
      const ride = { start_datetime: '2026-04-24T10:45:00' };
      expect(getBestTimeToLeave(ride)).toBe('Leave in ~45 min');
    });
  });

  describe('getTrafficLevel', () => {
    it('should return High during morning peak (8am)', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-04-24T08:00:00'));
      expect(getTrafficLevel()).toBe('High');
      vi.useRealTimers();
    });

    it('should return Low during night (11pm)', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-04-24T23:00:00'));
      expect(getTrafficLevel()).toBe('Low');
      vi.useRealTimers();
    });
  });

  describe('getTrafficColor', () => {
    it('should return red for High', () => {
      expect(getTrafficColor('High')).toBe('text-red-400');
    });
  });

  describe('getRouteEfficiencyScore', () => {
    it('should return 100 for fast routes', () => {
      const ride = {
        distance: '60 km',
        start_datetime: '2026-04-24T10:00:00',
        end_datetime: '2026-04-24T11:00:00'
      };
      expect(getRouteEfficiencyScore(ride)).toBe(100);
    });

    it('should return 0 for invalid data', () => {
      expect(getRouteEfficiencyScore({})).toBe(0);
    });
  });

  describe('isFillingFast', () => {
    it('should return true if > 70% full', () => {
      const ride = { participants: [1, 2, 3, 4, 5, 6, 7, 8], max_members: 10 };
      expect(isFillingFast(ride)).toBe(true);
    });
  });

  describe('computeBadges', () => {
    it('should return First Ride badge for 1 ride', () => {
      const badges = computeBadges(1, false);
      expect(badges.some(b => b.id === 'first')).toBe(true);
    });
  });
});
