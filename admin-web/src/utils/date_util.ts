import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

export function getCurrentBLD(): 'B' | 'L' | 'D' {
  const now = new Date();
  const hour = now.getHours();

  if (hour >= 0 && hour < 12) {
    return 'B';
  } else if (hour >= 12 && hour < 17) {
    return 'L';
  } else {
    return 'D';
  }
}

export function getCurrentYYYYMMDD(): string {
  return dayjs(new Date()).utcOffset(9).format('YYYYMMDD');
}

export function formatKSTString(timestamp: number): string {
  return dayjs(timestamp).utcOffset(9).format('YYYY-MM-DD HH:mm:ss');
}
