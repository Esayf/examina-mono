import moment from 'moment';

function formatDate(date: Date): string {
  const months = [
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
  const month = months[date.getMonth()];
  const day = date.getDate();
  const hours = date.getHours() % 12 || 12; // 12 saatlik saat formatı için
  const minutes = date.getMinutes() === 0 ? '00' : date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes();
  const ampm = date.getHours() >= 12 ? 'PM' : 'AM';

  return `${month} ${day}, ${hours}.${minutes} ${ampm}`;
}

function humanize(date: Date) {
  const startDate = date;
  const now = moment();
  const startMoment = moment(startDate);
  const duration = moment.duration(startMoment.diff(now));
  const humanReadable = duration.humanize(true);

  return humanReadable;
}

export { formatDate, humanize };
