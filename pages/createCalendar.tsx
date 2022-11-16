import { useState } from 'react';
import Head from 'next/head';
import {
  Typography,
  Button,
  StepContent,
  StepLabel,
  Step,
  Stepper,
  Box,
  Checkbox,
  TextField,
  Autocomplete,
  Grid,
} from '@mui/material';
import { CheckBoxOutlineBlank, CheckBox } from '@mui/icons-material';
import { startOfMonth, getWeeksInMonth } from 'date-fns';
import LoggedInGuard from '../components/authorization/LoggedInGuard';
import Container from '../components/layout/Container';
import getServantDays from '../services/getServantDays';
import { months } from '../constants';
import generateServantCalendar from '../services/generateServantCalendar';

const servants = [
  {
    name: 'Justin Leach',
    firstName: 'Justin',
    lastName: 'Leach',
    jobs: ['lordsSupper', 'sundayDevotion', 'prayer'],
  },
  {
    name: 'Daniel Boyd',
    firstName: 'Daniel',
    lastName: 'Boyd',
    jobs: ['lordsSupper', 'sundaySigning'],
  },
];

const lordsSupperServants = servants.reduce((acc, servant) => {
  if (servant.jobs.includes('lordsSupper')) {
    return [
      ...acc,
      {
        servant: servant.name,
        lastName: servant.lastName,
        firstName: servant.firstName,
      },
    ];
  }

  return acc;
}, []);

const options = lordsSupperServants.map((option) => {
  const firstLetter = option.lastName[0].toUpperCase();
  return {
    firstLetter,
    ...option,
  };
});

const HandleContinueAndBack = ({
  handleNext,
  handleBack,
}: {
  handleNext: () => void;
  handleBack: () => void;
}) => (
  <Box sx={{ mb: 2 }}>
    <Button variant="contained" onClick={handleNext} sx={{ mt: 1, mr: 1 }}>
      Continue
    </Button>
    <Button onClick={handleBack} sx={{ mt: 1, mr: 1 }}>
      Back
    </Button>
  </Box>
);

const CreateCalendar = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [servantData, setServantData] = useState<{
    month: string;
    sunday: string[];
    wednesday: string[];
  }>({
    month: '',
    sunday: [],
    wednesday: [],
  });

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  const handleSelectingMonth = (month: string) => {
    const year = new Date().getFullYear();
    const firstDayOfTheMonth = startOfMonth(new Date(`${month} 1 ${year}`));

    const numberOfWeeks = getWeeksInMonth(firstDayOfTheMonth);
    const datesForServants = getServantDays(firstDayOfTheMonth, numberOfWeeks);

    setServantData({
      month,
      sunday: datesForServants.sunday,
      wednesday: datesForServants.wednesday,
    });
  };

  const generateCalendar = () => {
    generateServantCalendar({
      month: servantData.month,
      sundayDates: servantData.sunday,
      wednesdayDates: servantData.wednesday,
    });
  };

  return (
    <>
      <Head>
        <title>Those who serve - Create Calendar</title>
      </Head>

      <LoggedInGuard>
        <Container>
          <Typography variant="h2">Create Calendar</Typography>

          <Stepper activeStep={activeStep} orientation="vertical">
            <Step>
              <StepLabel>
                Select a month to create those who serve calendar
              </StepLabel>

              <StepContent>
                <Typography>
                  Month Selected <strong>{servantData.month}</strong>
                </Typography>

                {months.map((month) => (
                  <Button
                    key={month}
                    variant={
                      servantData.month === month ? 'contained' : 'outlined'
                    }
                    onClick={() => handleSelectingMonth(month)}
                  >
                    {month}
                  </Button>
                ))}

                <HandleContinueAndBack
                  handleNext={handleNext}
                  handleBack={handleBack}
                />
              </StepContent>
            </Step>

            <Step>
              <StepLabel>Generate and view calendar</StepLabel>

              <StepContent>
                <Typography gutterBottom>
                  Generate calendar for month{' '}
                  <strong>{servantData.month}</strong>
                </Typography>

                <Typography variant="h4" gutterBottom>
                  Month Jobs
                </Typography>

                <Box marginBottom={4}>
                  <Grid
                    container
                    spacing={{ xs: 2, md: 3 }}
                    columns={{ xs: 4, sm: 8, md: 12 }}
                  >
                    <Grid item xs={2} sm={4}>
                      <Autocomplete
                        id="grouped-demo"
                        options={options.sort(
                          (a, b) => -b.firstLetter.localeCompare(a.firstLetter)
                        )}
                        groupBy={(option) => option.firstLetter}
                        getOptionLabel={(option) => option.servant}
                        sx={{ width: 300 }}
                        renderOption={(props, option, { selected }) => (
                          // eslint-disable-next-line react/jsx-props-no-spreading
                          <li {...props}>
                            <Checkbox
                              icon={<CheckBoxOutlineBlank fontSize="small" />}
                              checkedIcon={<CheckBox fontSize="small" />}
                              style={{ marginRight: 8 }}
                              checked={selected}
                            />
                            {option.servant}
                          </li>
                        )}
                        renderInput={(params) => (
                          <TextField {...params} label="Announcements" />
                        )}
                      />
                    </Grid>

                    <Grid item xs={2} sm={4}>
                      <Autocomplete
                        multiple
                        disableCloseOnSelect
                        id="grouped-demo"
                        options={options.sort(
                          (a, b) => -b.firstLetter.localeCompare(a.firstLetter)
                        )}
                        groupBy={(option) => option.firstLetter}
                        getOptionLabel={(option) => option.servant}
                        sx={{ width: 300 }}
                        renderOption={(props, option, { selected }) => (
                          // eslint-disable-next-line react/jsx-props-no-spreading
                          <li {...props}>
                            <Checkbox
                              icon={<CheckBoxOutlineBlank fontSize="small" />}
                              checkedIcon={<CheckBox fontSize="small" />}
                              style={{ marginRight: 8 }}
                              checked={selected}
                            />
                            {option.servant}
                          </li>
                        )}
                        renderInput={(params) => (
                          <TextField {...params} label="Ushers" />
                        )}
                      />
                    </Grid>
                  </Grid>
                </Box>

                <Typography variant="h4" gutterBottom>
                  Sunday Jobs
                </Typography>

                <Box marginBottom={4}>
                  <Grid
                    container
                    spacing={{ xs: 2, md: 3 }}
                    columns={{ xs: 4, sm: 8, md: 12 }}
                  >
                    <Grid item xs={2} sm={4}>
                      <Autocomplete
                        multiple
                        disableCloseOnSelect
                        id="grouped-demo"
                        options={options.sort(
                          (a, b) => -b.firstLetter.localeCompare(a.firstLetter)
                        )}
                        groupBy={(option) => option.firstLetter}
                        getOptionLabel={(option) => option.servant}
                        sx={{ width: 300 }}
                        renderOption={(props, option, { selected }) => (
                          // eslint-disable-next-line react/jsx-props-no-spreading
                          <li {...props}>
                            <Checkbox
                              icon={<CheckBoxOutlineBlank fontSize="small" />}
                              checkedIcon={<CheckBox fontSize="small" />}
                              style={{ marginRight: 8 }}
                              checked={selected}
                            />
                            {option.servant}
                          </li>
                        )}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Lords Supper Servants"
                          />
                        )}
                      />
                    </Grid>

                    <Grid item xs={2} sm={4}>
                      <Autocomplete
                        multiple
                        disableCloseOnSelect
                        id="grouped-demo"
                        options={options.sort(
                          (a, b) => -b.firstLetter.localeCompare(a.firstLetter)
                        )}
                        groupBy={(option) => option.firstLetter}
                        getOptionLabel={(option) => option.servant}
                        sx={{ width: 300 }}
                        renderOption={(props, option, { selected }) => (
                          // eslint-disable-next-line react/jsx-props-no-spreading
                          <li {...props}>
                            <Checkbox
                              icon={<CheckBoxOutlineBlank fontSize="small" />}
                              checkedIcon={<CheckBox fontSize="small" />}
                              style={{ marginRight: 8 }}
                              checked={selected}
                            />
                            {option.servant}
                          </li>
                        )}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Sunday Morning Prayers"
                          />
                        )}
                      />
                    </Grid>

                    <Grid item xs={2} sm={4}>
                      <Autocomplete
                        multiple
                        disableCloseOnSelect
                        id="grouped-demo"
                        options={options.sort(
                          (a, b) => -b.firstLetter.localeCompare(a.firstLetter)
                        )}
                        groupBy={(option) => option.firstLetter}
                        getOptionLabel={(option) => option.servant}
                        sx={{ width: 300 }}
                        renderOption={(props, option, { selected }) => (
                          // eslint-disable-next-line react/jsx-props-no-spreading
                          <li {...props}>
                            <Checkbox
                              icon={<CheckBoxOutlineBlank fontSize="small" />}
                              checkedIcon={<CheckBox fontSize="small" />}
                              style={{ marginRight: 8 }}
                              checked={selected}
                            />
                            {option.servant}
                          </li>
                        )}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Sunday Evening Prayers"
                          />
                        )}
                      />
                    </Grid>

                    <Grid item xs={2} sm={4}>
                      <Autocomplete
                        multiple
                        disableCloseOnSelect
                        id="grouped-demo"
                        options={options.sort(
                          (a, b) => -b.firstLetter.localeCompare(a.firstLetter)
                        )}
                        groupBy={(option) => option.firstLetter}
                        getOptionLabel={(option) => option.servant}
                        sx={{ width: 300 }}
                        renderOption={(props, option, { selected }) => (
                          // eslint-disable-next-line react/jsx-props-no-spreading
                          <li {...props}>
                            <Checkbox
                              icon={<CheckBoxOutlineBlank fontSize="small" />}
                              checkedIcon={<CheckBox fontSize="small" />}
                              style={{ marginRight: 8 }}
                              checked={selected}
                            />
                            {option.servant}
                          </li>
                        )}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Sunday Morning Song Leader"
                          />
                        )}
                      />
                    </Grid>

                    <Grid item xs={2} sm={4}>
                      <Autocomplete
                        multiple
                        disableCloseOnSelect
                        id="grouped-demo"
                        options={options.sort(
                          (a, b) => -b.firstLetter.localeCompare(a.firstLetter)
                        )}
                        groupBy={(option) => option.firstLetter}
                        getOptionLabel={(option) => option.servant}
                        sx={{ width: 300 }}
                        renderOption={(props, option, { selected }) => (
                          // eslint-disable-next-line react/jsx-props-no-spreading
                          <li {...props}>
                            <Checkbox
                              icon={<CheckBoxOutlineBlank fontSize="small" />}
                              checkedIcon={<CheckBox fontSize="small" />}
                              style={{ marginRight: 8 }}
                              checked={selected}
                            />
                            {option.servant}
                          </li>
                        )}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Sunday Evening Song Leader"
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                </Box>

                <Typography variant="h4" gutterBottom>
                  Wednesday Jobs
                </Typography>

                <Box marginBottom={4}>
                  <Grid
                    container
                    spacing={{ xs: 2, md: 3 }}
                    columns={{ xs: 4, sm: 8, md: 12 }}
                  >
                    <Grid item xs={2} sm={4}>
                      <Autocomplete
                        multiple
                        disableCloseOnSelect
                        id="grouped-demo"
                        options={options.sort(
                          (a, b) => -b.firstLetter.localeCompare(a.firstLetter)
                        )}
                        groupBy={(option) => option.firstLetter}
                        getOptionLabel={(option) => option.servant}
                        sx={{ width: 300 }}
                        renderOption={(props, option, { selected }) => (
                          // eslint-disable-next-line react/jsx-props-no-spreading
                          <li {...props}>
                            <Checkbox
                              icon={<CheckBoxOutlineBlank fontSize="small" />}
                              checkedIcon={<CheckBox fontSize="small" />}
                              style={{ marginRight: 8 }}
                              checked={selected}
                            />
                            {option.servant}
                          </li>
                        )}
                        renderInput={(params) => (
                          <TextField {...params} label="Wednesday Devotion" />
                        )}
                      />
                    </Grid>

                    <Grid item xs={2} sm={4}>
                      <Autocomplete
                        multiple
                        disableCloseOnSelect
                        id="grouped-demo"
                        options={options.sort(
                          (a, b) => -b.firstLetter.localeCompare(a.firstLetter)
                        )}
                        groupBy={(option) => option.firstLetter}
                        getOptionLabel={(option) => option.servant}
                        sx={{ width: 300 }}
                        renderOption={(props, option, { selected }) => (
                          // eslint-disable-next-line react/jsx-props-no-spreading
                          <li {...props}>
                            <Checkbox
                              icon={<CheckBoxOutlineBlank fontSize="small" />}
                              checkedIcon={<CheckBox fontSize="small" />}
                              style={{ marginRight: 8 }}
                              checked={selected}
                            />
                            {option.servant}
                          </li>
                        )}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Wednesday Song Leader"
                          />
                        )}
                      />
                    </Grid>

                    <Grid item xs={2} sm={4}>
                      <Autocomplete
                        multiple
                        disableCloseOnSelect
                        id="grouped-demo"
                        options={options.sort(
                          (a, b) => -b.firstLetter.localeCompare(a.firstLetter)
                        )}
                        groupBy={(option) => option.firstLetter}
                        getOptionLabel={(option) => option.servant}
                        sx={{ width: 300 }}
                        renderOption={(props, option, { selected }) => (
                          // eslint-disable-next-line react/jsx-props-no-spreading
                          <li {...props}>
                            <Checkbox
                              icon={<CheckBoxOutlineBlank fontSize="small" />}
                              checkedIcon={<CheckBox fontSize="small" />}
                              style={{ marginRight: 8 }}
                              checked={selected}
                            />
                            {option.servant}
                          </li>
                        )}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Wednesday Evening Prayer"
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                </Box>

                <Button variant="contained" onClick={generateCalendar}>
                  Generate Calendar
                </Button>

                <HandleContinueAndBack
                  handleNext={handleNext}
                  handleBack={handleBack}
                />
              </StepContent>
            </Step>

            <Step>
              <StepLabel>Save Calendar</StepLabel>

              <StepContent>
                <Typography>Month Select</Typography>

                <HandleContinueAndBack
                  handleNext={handleNext}
                  handleBack={handleBack}
                />
              </StepContent>
            </Step>
          </Stepper>

          <Button
            variant="contained"
            onClick={handleReset}
            sx={{ mt: 1, mr: 1 }}
          >
            Reset
          </Button>
        </Container>
      </LoggedInGuard>
    </>
  );
};

export default CreateCalendar;
