export function getMillisForDaysOffset(days: number): number {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(0);
  date.setMinutes(0);
  return date.getTime();
}

export function millisToReadable(millis: number, dateOnly?: boolean) {
  const months: string[] = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  const date = new Date(millis);
  const minutes = date.getMinutes();
  const hours = date.getHours();
  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();

  return `${day} ${months[month]}, ${year} ${
    dateOnly
      ? ''
      : `${hours < 10 ? '0' + hours : hours}:${
          minutes < 10 ? '0' + minutes : minutes
        }`
  }`;
}

export function prettyElapsedTimeSince(millis: number, dateOnly?: boolean) {
  const timeDiff = Math.abs(Date.now() - millis);
  const days = parseInt(`${(timeDiff / 86400000).toFixed(1)}`);
  if (days > 10) {
    return millisToReadable(millis, dateOnly);
  }
  const hours = parseInt(`${timeDiff / 3600000}`);
  const minutes = parseInt(`${timeDiff / 60000}`);
  if (days > 0) {
    return `${days} ${days > 1 ? 'days' : 'day'} ago`;
  } else if (hours > 0) {
    return `${hours} ${hours > 1 ? 'hours' : 'hour'} ago`;
  } else if (minutes > 0) {
    return `${minutes} ${minutes > 1 ? 'minutes' : 'minute'} ago`;
  } else {
    return `just now`;
  }
}
