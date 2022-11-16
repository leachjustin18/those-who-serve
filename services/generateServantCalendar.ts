import { sub } from 'date-fns';

const servants = [
  {
    servantName: 'Justin Leach',
    jobs: ['lordsSupper', 'prayer'],
    previousJobs: [
      { job: 'lordsSupper', lastTime: sub(new Date(), { months: 1 }) },
      { job: 'prayer', lastTime: sub(new Date(), { months: 3 }) },
    ],
  },
  {
    servantName: 'Daniel Boyd',
    jobs: ['sundayMorningSongLeader', 'prayer', 'lordsSupper'],
    previousJobs: [
      {
        job: 'sundayMorningSongLeader',
        lastTime: sub(new Date(), { months: 2 }),
      },
      { job: 'prayer', lastTime: sub(new Date(), { months: 1 }) },
    ],
  },
  {
    servantName: 'Jon Bowman',
    jobs: ['sundayMorningSongLeader', 'prayer', 'lordsSupper'],
    previousJobs: [
      {
        job: 'sundayMorningSongLeader',
        lastTime: sub(new Date(), { months: 2 }),
      },
      { job: 'prayer', lastTime: sub(new Date(), { months: 1 }) },
    ],
  },
];

const sundayJobs = [
  {
    name: 'lordsSupper',
    friendlyName: `Lord's supper`,
  },
  {
    name: 'sundayMorningSongLeader',
    friendlyName: 'Sunday morning song Leader',
  },
  {
    name: 'prayer',
    friendlyName: 'Prayer',
  },
];

const generateServantCalendar = ({
  month,
  sundayDates,
  wednesdayDates,
}: {
  month: string;
  sundayDates: string[];
  wednesdayDates: string[];
}) => {
  // const test = sundayJobs.reduce((acc, sundayJob) => {
  //   const found = servants.filter((servant) =>
  //     servant.previousJobs.find((job) => job.job === sundayJob.name)
  //   );

  //   return [
  //     ...acc,
  //     { found, job: sundayJob.name, friendlyName: sundayJob.friendlyName },
  //   ];
  // }, []);
  // console.log(
  //   '🚀 ~ file: generateServantCalendar.ts ~ line 56 ~ test ~ test',
  //   test
  // );
  const test3 = sundayJobs.reduce((acc, sundayJob) => {
    const found = servants.filter((servant) =>
      servant.jobs.includes(sundayJob.name)
    );

    const randomServant = Math.floor(Math.random() * found.length);

    return [
      ...acc,
      {
        ...found[randomServant],
        job: sundayJob.name,
        friendlyName: sundayJob.friendlyName,
      },
    ];
  }, []);
  console.log(
    '🚀 ~ file: generateServantCalendar.ts ~ line 58 ~ test3 ~ test3',
    test3
  );
  //   console.log(
  //     '🚀 ~ file: generateServantCalendar.ts ~ line 10 ~ wednesdayDates',
  //     wednesdayDates
  //   );
  //   console.log(
  //     '🚀 ~ file: generateServantCalendar.ts ~ line 10 ~ sundayDates',
  //     sundayDates
  //   );
  //   console.log('🚀 ~ file: generateServantCalendar.ts ~ line 10 ~ month', month);
};

export default generateServantCalendar;
