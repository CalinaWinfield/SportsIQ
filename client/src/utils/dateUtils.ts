export function formatGameTime(game: {
  date: string;
  statusDetail?: string;
  status?: string;
  isLive: boolean;
  isCompleted: boolean;
}): {
  badgeLabel: string;
  startTimeFormatted: string;
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
    return {
      badgeLabel: 'FINAL',
      startTimeFormatted: game.statusDetail || 'Final',
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
