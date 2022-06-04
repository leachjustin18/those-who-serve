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
} from '@mui/material';
import { startOfMonth, getWeeksInMonth } from 'date-fns';
import LoggedInGuard from '../components/authorization/LoggedInGuard';
import Container from '../components/layout/Container';
import getServantDays from '../services/getServantDays';

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
  const [selectedMonth, setSelectedMonth] = useState('');
  const [servantDates, setServantDates] =
    useState<{ sunday: string[]; wednesday: string[] }>();

  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

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

    const numberOfWeeks = getWeeksInMonth(firstDayOfTheMonth, {
      weekStartsOn: 0,
    });

    const datesForServants = getServantDays(firstDayOfTheMonth, numberOfWeeks);

    setServantDates(datesForServants);
    setSelectedMonth(month);
  };

  console.log('servantDates', servantDates);

  return (
    <>
      <Head>
        <title>Those who serve - Create Calendar</title>
      </Head>

      <LoggedInGuard>
        <Container>
          <Typography variant="h2">Create Calendar</Typography>
          <ul>
            <li>Which month</li>
            <li>Button to generate calendar</li>
            <li>See and edit calendar</li>
            <li>Save calendar</li>
          </ul>

          <Stepper activeStep={activeStep} orientation="vertical">
            <Step>
              <StepLabel>
                Select a month to create those who serve calendar
              </StepLabel>

              <StepContent>
                <Typography>
                  Month Selected <strong>{selectedMonth}</strong>
                </Typography>

                {months.map((month) => (
                  <Button
                    key={month}
                    variant={selectedMonth === month ? 'contained' : 'outlined'}
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
                <Typography>
                  Generate calendar for month <strong>{selectedMonth}</strong>
                </Typography>

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

          {/* <Box>
            <Stepper activeStep={activeStep} orientation="vertical">
              {steps.map((step, index) => (
                <Step key={step.label}>
                  <StepLabel
                    optional={
                      index === 2 ? (
                        <Typography variant="caption">Last step</Typography>
                      ) : null
                    }
                  >
                    {step.label}
                  </StepLabel>
                  <StepContent>
                    <Typography>{step.description}</Typography>
                    <Box sx={{ mb: 2 }}>
                      <div>
                        <Button
                          variant="contained"
                          onClick={handleNext}
                          sx={{ mt: 1, mr: 1 }}
                        >
                          {index === steps.length - 1 ? 'Finish' : 'Continue'}
                        </Button>
                        <Button
                          disabled={index === 0}
                          onClick={handleBack}
                          sx={{ mt: 1, mr: 1 }}
                        >
                          Back
                        </Button>
                      </div>
                    </Box>
                  </StepContent>
                </Step>
              ))}
            </Stepper>
            {activeStep === steps.length && (
              <Paper square elevation={0} sx={{ p: 3 }}>
                <Typography>
                  All steps completed - you&apos;re finished
                </Typography>
                <Button onClick={handleReset} sx={{ mt: 1, mr: 1 }}>
                  Reset
                </Button>
              </Paper>
            )}
          </Box> */}
        </Container>
      </LoggedInGuard>
    </>
  );
};

export default CreateCalendar;
