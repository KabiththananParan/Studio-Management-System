// Utility functions to generate calendar entries (ICS and Google Calendar URLs)

// Parse a time string like "10:00 AM" or "16:30" into { hours, minutes } in 24h
function parseTimeString(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return { hours: 9, minutes: 0 };
  const trimmed = timeStr.trim();
  const ampmMatch = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (ampmMatch) {
    let hours = parseInt(ampmMatch[1], 10);
    const minutes = parseInt(ampmMatch[2], 10);
    const period = ampmMatch[3].toUpperCase();
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return { hours, minutes };
  }
  // 24-hour format fallback e.g., "16:30"
  const h24Match = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (h24Match) {
    return { hours: parseInt(h24Match[1], 10), minutes: parseInt(h24Match[2], 10) };
  }
  // Default to 09:00 if parsing fails
  return { hours: 9, minutes: 0 };
}

function combineDateAndTime(dateInput, timeStr) {
  const d = new Date(dateInput);
  const { hours, minutes } = parseTimeString(timeStr);
  const combined = new Date(d.getFullYear(), d.getMonth(), d.getDate(), hours, minutes, 0);
  return combined;
}

function toICSDateTimeUTC(date) {
  const pad = (n) => String(n).padStart(2, '0');
  const yyyy = date.getUTCFullYear();
  const mm = pad(date.getUTCMonth() + 1);
  const dd = pad(date.getUTCDate());
  const hh = pad(date.getUTCHours());
  const min = pad(date.getUTCMinutes());
  const ss = pad(date.getUTCSeconds());
  return `${yyyy}${mm}${dd}T${hh}${min}${ss}Z`;
}

function buildEventTimes(booking) {
  const start = combineDateAndTime(booking.bookingDate, booking.bookingTime);
  let end;
  if (booking?.slotId?.endTime) {
    end = combineDateAndTime(booking.bookingDate, booking.slotId.endTime);
    // If end is not after start (bad data), default to +1 hour
    if (!(end > start)) {
      end = new Date(start.getTime() + 60 * 60 * 1000);
    }
  } else {
    end = new Date(start.getTime() + 60 * 60 * 1000);
  }
  return { start, end };
}

export function buildICSContent(booking) {
  const { start, end } = buildEventTimes(booking);
  const uidHost = (typeof window !== 'undefined' ? window.location.host : 'studio.local');
  const uid = `${booking.bookingReference || booking._id}@${uidHost}`;
  const dtstamp = toICSDateTimeUTC(new Date());
  const dtstart = toICSDateTimeUTC(start);
  const dtend = toICSDateTimeUTC(end);

  const title = `${booking.packageName || 'Studio Session'}`;
  const location = 'Studio (see confirmation email for address)';
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const dashboardUrl = origin ? `${origin}/userDashboard` : '';
  const descriptionLines = [
    `Booking Reference: ${booking.bookingReference || booking._id}`,
    booking.customerInfo?.name ? `Customer: ${booking.customerInfo.name}` : null,
    dashboardUrl ? `Manage Booking: ${dashboardUrl}` : null,
  ].filter(Boolean);
  const description = descriptionLines.join(' \n ');

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Studio Management System//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${dtstart}`,
    `DTEND:${dtend}`,
    `SUMMARY:${escapeICS(title)}`,
    `LOCATION:${escapeICS(location)}`,
    `DESCRIPTION:${escapeICS(description)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return lines.join('\r\n');
}

export function buildGoogleCalendarUrl(booking) {
  const { start, end } = buildEventTimes(booking);
  const dates = `${toICSDateTimeUTC(start)}/${toICSDateTimeUTC(end)}`;
  const title = `${booking.packageName || 'Studio Session'}`;
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const dashboardUrl = origin ? `${origin}/userDashboard` : '';
  const detailsParts = [
    `Booking Ref: ${booking.bookingReference || booking._id}`,
    booking.customerInfo?.name ? `Customer: ${booking.customerInfo.name}` : null,
    dashboardUrl ? `Manage: ${dashboardUrl}` : null,
  ].filter(Boolean);

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates,
    details: detailsParts.join('\n'),
    location: 'Studio (see confirmation email for address)',
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function triggerICSDownload(booking) {
  const ics = buildICSContent(booking);
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const filenameBase = booking.bookingReference || `booking-${booking._id || 'event'}`;
  a.href = url;
  a.download = `${filenameBase}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function escapeICS(text) {
  if (!text) return '';
  return String(text)
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

export default {
  buildICSContent,
  buildGoogleCalendarUrl,
  triggerICSDownload,
};
