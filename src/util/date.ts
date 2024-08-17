function base10Padding(n: number): string {
    return n < 10 ? `0${n}` : `${n}`;
}

export const MonthNumToStr = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Avg',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
];
export function millisToDateString(millis: number, includeTime?: boolean) {
    const date = new Date(millis);
    return `${MonthNumToStr[date.getMonth()]} ${date.getDate()}/${
        date.getMonth() + 1
    }/${date.getFullYear()}${
        includeTime
            ? ` ${base10Padding(date.getHours())}:${base10Padding(
                  date.getMinutes(),
              )}`
            : ''
    }`;
}
