import {
  addWeeks,
  getDay,
  setDay,
  isSunday,
  isWednesday,
  format,
} from 'date-fns';

const getServantDays = (firstDayOfTheMonth: Date, numberOfWeeks: number) => {
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
    sundayDatesOfMonth.push(
      format(new Date(addWeeks(firstSunday, i - 1)), 'PPPP')
    );
  }

  for (let i = 1; i < totalWeeksInMonthForWednesday; i += 1) {
    wednesdayDatesOfMonth.push(
      format(new Date(addWeeks(firstWednesday, i - 1)), 'PPPP')
    );
  }

  return {
    sunday: sundayDatesOfMonth,
    wednesday: wednesdayDatesOfMonth,
  };
};

export default getServantDays;
