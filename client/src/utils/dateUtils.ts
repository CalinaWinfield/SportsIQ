import { SportsWeekInfo } from '../types/sports.js';

export function parseLocalDate(input?: string | Date): Date {
  if (!input) return new Date();
  if (input instanceof Date) return input;
  if (typeof input === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(input)) {
    const [y, m, d] = input.split('-').map(Number);
    return new Date(y, m - 1, d, 12, 0, 0);
  }
  const parsed = new Date(input);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
}

export function getSportsDateYMD(date: string | Date, timeZone = 'America/New_York'): string {
  const d = parseLocalDate(date);
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  return formatter.format(d);
}

export function getSportsWeekRange(refDate?: string | Date): SportsWeekInfo {
  const ymd = getSportsDateYMD(refDate || new Date());
  const [year, month, day] = ymd.split('-').map(Number);
  const base = new Date(year, month - 1, day, 12, 0, 0);
  const dayOfWeek = base.getDay(); // 0 = Sun, 1 = Mon, ..., 3 = Wed, ..., 6 = Sat
  const diffToWed = (dayOfWeek - 3 + 7) % 7;

  const wedDate = new Date(base);
  wedDate.setDate(base.getDate() - diffToWed);

  const tueDate = new Date(wedDate);
  tueDate.setDate(wedDate.getDate() + 6);

  const formatStr = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dayStr = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dayStr}`;
  };

  const wedYmd = formatStr(wedDate);
  const tueYmd = formatStr(tueDate);
  const startFmt = wedYmd.replace(/-/g, '');
  const endFmt = tueYmd.replace(/-/g, '');

  const startDisplay = wedDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
  const endDisplay = tueDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return {
    startWednesday: wedYmd,
    endTuesday: tueYmd,
    startFormatted: startFmt,
    endFormatted: endFmt,
    espnDatesParam: `${startFmt}-${endFmt}`,
    displayLabel: `${startDisplay} – ${endDisplay}`,
    selectedDate: ymd
  };
}

export interface SportsDayTab {
  key: string;
  dateStr: string;
  dayName: string;
  formatted: string;
}

export function getSportsWeekDays(week: SportsWeekInfo): SportsDayTab[] {
  const days: SportsDayTab[] = [];
  const [y, m, d] = week.startWednesday.split('-').map(Number);
  const start = new Date(y, m - 1, d, 12, 0, 0);

  for (let i = 0; i < 7; i++) {
    const cur = new Date(start);
    cur.setDate(start.getDate() + i);

    const year = cur.getFullYear();
    const month = String(cur.getMonth() + 1).padStart(2, '0');
    const dayNum = String(cur.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${dayNum}`;

    const dayName = cur.toLocaleDateString('en-US', { weekday: 'short' });
    const formatted = cur.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

    days.push({
      key: dateStr,
      dateStr,
      dayName,
      formatted
    });
  }

  return days;
}

export function shiftWeekDate(currentDateYmd: string, direction: 'prev' | 'next'): string {
  const [y, m, d] = (currentDateYmd || getSportsDateYMD(new Date())).split('-').map(Number);
  const base = new Date(y, m - 1, d, 12, 0, 0);
  base.setDate(base.getDate() + (direction === 'next' ? 7 : -7));
  const year = base.getFullYear();
  const month = String(base.getMonth() + 1).padStart(2, '0');
  const dayStr = String(base.getDate()).padStart(2, '0');
  return `${year}-${month}-${dayStr}`;
}

export function formatGameTime(game: {
  date: string;
  statusDetail?: string;
  status?: string;
  isLive: boolean;
  isCompleted: boolean;
}): {
  badgeLabel: string;
  startTimeFormatted: string;
  gameDateFormatted?: string;
  isLive: boolean;
  isCompleted: boolean;
} {
  if (game.isLive) {
    return {
      badgeLabel: 'LIVE',
      startTimeFormatted: game.statusDetail || 'In Progress',
      isLive: true,
      isCompleted: false
    };
  }

  if (game.isCompleted) {
    let dateStr = '';
    try {
      const d = new Date(game.date);
      if (!isNaN(d.getTime())) {
        const now = new Date();
        const isToday = d.toDateString() === now.toDateString();

        const formattedDate = d.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric'
        });

        dateStr = isToday ? `Today, ${formattedDate}` : formattedDate;
      }
    } catch {}

    const baseStatus = game.statusDetail || 'Final';
    const statusWithDate = dateStr ? `${baseStatus} • ${dateStr}` : baseStatus;

    return {
      badgeLabel: 'FINAL',
      startTimeFormatted: statusWithDate,
      gameDateFormatted: dateStr || undefined,
      isLive: false,
      isCompleted: true
    };
  }

  // Upcoming game
  let formatted = '';
  try {
    const d = new Date(game.date);
    if (!isNaN(d.getTime())) {
      const now = new Date();
      const isToday = d.toDateString() === now.toDateString();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const isTomorrow = d.toDateString() === tomorrow.toDateString();

      const timeStr = d.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short'
      });

      if (isToday) {
        formatted = `Today • ${timeStr}`;
      } else if (isTomorrow) {
        formatted = `Tomorrow • ${timeStr}`;
      } else {
        const dateStr = d.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric'
        });
        formatted = `${dateStr} • ${timeStr}`;
      }
    }
  } catch {}

  if (!formatted && game.statusDetail) {
    formatted = game.statusDetail;
  }

  return {
    badgeLabel: 'START TIME',
    startTimeFormatted: formatted || 'Scheduled',
    isLive: false,
    isCompleted: false
  };
}
