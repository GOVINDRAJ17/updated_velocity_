/**
 * Velocity Smart Insights Engine
 * Client-side intelligence layer — no API calls required
 */

/**
 * Returns a human-readable "best time to leave" string based on the ride's start_datetime.
 */
export function getBestTimeToLeave(ride: any): string {
  const start = ride.start_datetime ? new Date(ride.start_datetime) : null;
  if (!start) return '';

  const now = new Date();
  const diffMs = start.getTime() - now.getTime();
  const diffMins = Math.round(diffMs / 60000);

  if (diffMins < 0) return 'Ride has started';
  if (diffMins < 15) return 'Leave NOW';
  if (diffMins < 60) return `Leave in ~${diffMins} min`;
  const hours = Math.round(diffMins / 60);
  if (hours <= 6) return `Leave in ~${hours}h`;
  return '';
}

/**
 * Returns traffic level based on current time of day.
 * Peak hours: 7-10am, 5-8pm. Off-peak: 10pm-6am.
 */
export type TrafficLevel = 'Low' | 'Medium' | 'High';

export function getTrafficLevel(): TrafficLevel {
  const hour = new Date().getHours();
  if ((hour >= 7 && hour < 10) || (hour >= 17 && hour < 20)) return 'High';
  if ((hour >= 10 && hour < 12) || (hour >= 20 && hour < 22)) return 'Medium';
  if (hour >= 22 || hour < 6) return 'Low';
  return 'Medium';
}

export function getTrafficColor(level: TrafficLevel): string {
  return level === 'High' ? 'text-red-400' : level === 'Medium' ? 'text-yellow-400' : 'text-emerald-400';
}

export function getTrafficDot(level: TrafficLevel): string {
  return level === 'High' ? 'bg-red-400' : level === 'Medium' ? 'bg-yellow-400' : 'bg-emerald-400';
}

/**
 * Returns a route efficiency score (0–100) based on distance and estimated time.
 * Higher = more efficient route.
 */
export function getRouteEfficiencyScore(ride: any): number {
  const dist = parseFloat(ride.distance?.replace(/[^0-9.]/g, '') || '0');
  if (dist <= 0) return 0;

  let durationMins: number;
  if (ride.start_datetime && ride.end_datetime) {
    durationMins = (new Date(ride.end_datetime).getTime() - new Date(ride.start_datetime).getTime()) / 60000;
  } else {
    durationMins = (dist / 45) * 60; // fallback: 45 km/h assumption
  }

  if (durationMins <= 0) return 0;

  const actualSpeed = (dist / durationMins) * 60; // km/h
  // Score: 60 km/h = 100%, scales linearly
  return Math.min(100, Math.round((actualSpeed / 60) * 100));
}

/**
 * Returns a personalized time-saving insight string.
 */
export function getTimeSavingInsight(ride: any): string {
  const dist = parseFloat(ride.distance?.replace(/[^0-9.]/g, '') || '0');
  if (dist <= 0) return '';

  const expectedMins = Math.round((dist / 45) * 60); // baseline: 45 km/h
  let actualMins: number | null = null;

  if (ride.start_datetime && ride.end_datetime) {
    actualMins = Math.round(
      (new Date(ride.end_datetime).getTime() - new Date(ride.start_datetime).getTime()) / 60000
    );
  }

  if (actualMins === null) return `Estimated ${expectedMins} min at standard pace`;

  const diff = expectedMins - actualMins;
  if (diff > 2) return `You saved ${diff} min vs. expected — great pace!`;
  if (diff < -2) return `${Math.abs(diff)} min longer than expected — traffic impact`;
  return `Right on schedule — exactly as planned`;
}

/**
 * Returns a "filling fast" flag if more than 70% of seats are taken.
 */
export function isFillingFast(ride: any): boolean {
  const taken = ride.participants?.length || 0;
  const max = ride.max_members || 1;
  return taken / max > 0.7;
}

/**
 * Returns a WhatsApp share URL for a ride.
 */
export function getWhatsAppShareUrl(ride: any): string {
  const code = ride.access_code || '';
  const title = ride.title || 'a ride';
  const from = ride.start_location?.split(',')[0] || '';
  const to = ride.end_location?.split(',')[0] || '';
  const text = `Join my ride "${title}" on Velocity!\n📍 ${from} → ${to}\n🔑 Code: ${code}\nDownload Velocity to join the formation.`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

/**
 * Badge definitions based on ride counts.
 */
export interface Badge {
  id: string;
  label: string;
  emoji: string;
  description: string;
  color: string;
}

export function computeBadges(totalRides: number, isVerified: boolean): Badge[] {
  const earned: Badge[] = [];
  if (totalRides >= 1) earned.push({ id: 'first', label: 'First Ride', emoji: '🏁', description: 'Completed your first ride', color: 'text-blue-400 border-blue-500/30 bg-blue-500/10' });
  if (totalRides >= 5) earned.push({ id: 'five', label: 'Road Warrior', emoji: '🛣️', description: '5 rides completed', color: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10' });
  if (totalRides >= 10) earned.push({ id: 'ten', label: 'Formation Leader', emoji: '⚡', description: '10 rides completed', color: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10' });
  if (totalRides >= 25) earned.push({ id: 'twentyfive', label: 'Elite Pilot', emoji: '🏆', description: '25 rides completed', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' });
  if (isVerified) earned.push({ id: 'verified', label: 'Verified Rider', emoji: '✓', description: 'Identity confirmed', color: 'text-white border-white/20 bg-white/10' });
  return earned;
}
