import {
  addWeeks,
  getDay,
  setDay,
  isSunday,
  isWednesday,
  format,
  getMonth,
} from 'date-fns';

const getServantDays = (firstDayOfTheMonth: Date, numberOfWeeks: number) => {
  const selectedMonth = getMonth(new Date(firstDayOfTheMonth));
  const firstSunday = setDay(firstDayOfTheMonth, 0, {
    weekStartsOn: getDay(firstDayOfTheMonth),
  });

  const firstWednesday = setDay(firstDayOfTheMonth, 3, {
    weekStartsOn: getDay(firstDayOfTheMonth),
  });

  const totalWeeksInMonthForSunday = isSunday(firstDayOfTheMonth)
    ? numberOfWeeks + 1
    : numberOfWeeks;

  const totalWeeksInMonthForWednesday = isWednesday(firstDayOfTheMonth)
    ? numberOfWeeks + 1
    : numberOfWeeks;

  const sundayDatesOfMonth: string[] = [];
  const wednesdayDatesOfMonth: string[] = [];

  for (let i = 1; i < totalWeeksInMonthForSunday; i += 1) {
    const nextSunday = new Date(addWeeks(firstSunday, i - 1));
    const formattedSunday =
      selectedMonth === getMonth(nextSunday)
        ? format(nextSunday, 'PPPP')
        : null;

    sundayDatesOfMonth.push(formattedSunday);
  }

  for (let i = 1; i < totalWeeksInMonthForWednesday; i += 1) {
    const nextWednesday = new Date(addWeeks(firstWednesday, i - 1));
    const formattedWednesday =
      selectedMonth === getMonth(nextWednesday)
        ? format(nextWednesday, 'PPPP')
        : null;

    wednesdayDatesOfMonth.push(formattedWednesday);
  }

  return {
    sunday: sundayDatesOfMonth.filter((sunday) => sunday !== null),
    wednesday: wednesdayDatesOfMonth.filter((wednesday) => wednesday !== null),
  };
};

export default getServantDays;
