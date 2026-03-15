export function sameDay(d1, d2) {
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
}

export function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function getActiveMembersOnDate(members, date) {
  return members.filter(m => {
    if (m.isGuest) return false;
    return m.stints.some(s => {
      const start = new Date(s.startDate);
      const end = s.endDate ? new Date(s.endDate) : new Date('2099-01-01');
      return date >= start && date <= end;
    });
  }).map(m => {
    const stint = m.stints.find(s => {
      const start = new Date(s.startDate);
      const end = s.endDate ? new Date(s.endDate) : new Date('2099-01-01');
      return date >= start && date <= end;
    });
    return { ...m, instruments: stint?.instruments || [] };
  });
}
