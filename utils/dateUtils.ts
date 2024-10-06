const TIMEZONE = 'America/Toronto'; // This covers Ottawa (Eastern Time)

export function toEasternTime(date: Date): Date {
  return new Date(date.toLocaleString('en-US', { timeZone: TIMEZONE }));
}

export function fromEasternTime(date: Date): Date {
  const easternDate = new Date(date.toLocaleString('en-US', { timeZone: TIMEZONE }));
  const offset = date.getTime() - easternDate.getTime();
  return new Date(date.getTime() + offset);
}

export function formatInTimeZone(date: Date, formatStr: string): string {
  const easternDate = toEasternTime(date);
  return easternDate.toLocaleString('en-US', {
    timeZone: TIMEZONE,
    ...getFormatOptions(formatStr)
  });
}

function getFormatOptions(formatStr: string): Intl.DateTimeFormatOptions {
  const options: Intl.DateTimeFormatOptions = {};
  if (formatStr.includes('yyyy')) options.year = 'numeric';
  if (formatStr.includes('MM')) options.month = '2-digit';
  if (formatStr.includes('dd')) options.day = '2-digit';
  if (formatStr.includes('HH')) options.hour = '2-digit';
  if (formatStr.includes('mm')) options.minute = '2-digit';
  if (formatStr.includes('ss')) options.second = '2-digit';
  return options;
}