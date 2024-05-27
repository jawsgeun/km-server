import moment from 'moment';

import { BLD } from './enums';

export function formatYYYYMMDD(date: Date) {
  return moment(date).utcOffset(9).format('YYYYMMDD');
}

export function convertToBLD(value: string): BLD {
  const trimed_value = value.trim();
  if (['조식'].includes(trimed_value)) {
    return BLD.B;
  }
  if (['중식'].includes(trimed_value)) {
    return BLD.L;
  }
  if (['석식'].includes(trimed_value)) {
    return BLD.D;
  }
  throw new Error(`invalid BLD input: ${value}`);
}

export function getNextWeekYYYYMMDD() {
  const nextMonday = moment().utcOffset(9).add(1, 'weeks').startOf('isoWeek');

  const nextMondayYYYYMMDD = nextMonday.format('YYYYMMDD');
  const nextTuesdayYYYYMMDD = nextMonday.add(1, 'days').format('YYYYMMDD');
  const nextWednesdayYYYYMMDD = nextMonday.add(1, 'days').format('YYYYMMDD');
  const nextThursdayYYYYMMDD = nextMonday.add(1, 'days').format('YYYYMMDD');
  const nextFridayYYYYMMDD = nextMonday.add(1, 'days').format('YYYYMMDD');
  const nextSaturdayYYYYMMDD = nextMonday.add(1, 'days').format('YYYYMMDD');
  const nextSundayYYYYMMDD = nextMonday.add(1, 'days').format('YYYYMMDD');

  return [
    nextMondayYYYYMMDD,
    nextTuesdayYYYYMMDD,
    nextWednesdayYYYYMMDD,
    nextThursdayYYYYMMDD,
    nextFridayYYYYMMDD,
    nextSaturdayYYYYMMDD,
    nextSundayYYYYMMDD,
  ];
}

export function getYYYYMMDDUntilToday(dayBefore: number): string[] {
  const today = moment().utcOffset(9);
  const startDay = moment().utcOffset(9).subtract(dayBefore, 'days');

  const dateYYYYMMDDList: string[] = [];

  while (startDay.isSameOrBefore(today)) {
    dateYYYYMMDDList.push(startDay.format('YYYYMMDD'));
    startDay.add(1, 'days');
  }

  return dateYYYYMMDDList;
}

export function convertUnixTimestampToYYYYMMDD(unixTimestamp: number) {
  return moment.unix(unixTimestamp).utcOffset(9).format('YYYYMMDD');
}

// 한글 또는 숫자가 나오기 전까지의 모든 문자를 제거
export function removeBeforeKoreanOrNumber(inputText: string) {
  const pattern = /^[^가-힣0-9]+/;

  const replacedText = inputText.replace(pattern, '');
  if (!replacedText.trim()) {
    return inputText;
  }

  return replacedText;
}

// 한글과 공백으로만 이루어진 첫 그룹을 반환
export function findFirstKoreanSpaceGroup(inputText: string) {
  const pattern = /[가-힣\s]+/;

  const match = inputText.match(pattern);
  if (!match) {
    return inputText;
  }

  return match[0];
}
