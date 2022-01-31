import {
  Grid,
  Box,
  TextField,
  Autocomplete,
  Checkbox,
  TextFieldProps,
  Button,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Typography,
  Backdrop,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  useForm,
  Controller,
  SubmitHandler,
  useFieldArray,
} from 'react-hook-form';
import {
  PersonAdd as PersonAddIcon,
  AddCircle as AddCircleIcon,
  CalendarToday as CalendarTodayOutlinedIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { DatePicker, LocalizationProvider } from '@mui/lab';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import { yupResolver } from '@hookform/resolvers/yup';
import { useState } from 'react';
import { getYear, format } from 'date-fns';
import firebase from '../../firebase/clientApp';
import { IFormInput } from '../../constants/types';
import { servantSchema } from '../../constants';
import Icon from '../checkbox/Icon';
import CheckedIcon from '../checkbox/CheckedIcon';

const unavailableDatesLayout = {
  bgcolor: 'background.paper',
  display: 'flex',
  flexDirection: 'row-reverse',
};

const AddServant = () => {
  const [unavailableDate, setUnavailableDate] = useState<Date | null>(null);
  const [isBackDropOpen, setIsBackDropOpen] = useState(false);
  const [isSnackBarOpen, setIsSnackBarOpen] = useState(false);

  const jobs = ['Lords Supper', 'Usher', 'Sunday Devotion', 'Lead Signing'];

  const { control, handleSubmit, watch, reset } = useForm<IFormInput>({
    defaultValues: {
      firstName: '',
      lastName: '',
      jobs: [],
      unavailableDates: [],
    },
    resolver: yupResolver(servantSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'unavailableDates',
  });

  const watchFieldArray = watch('unavailableDates');
  const controlledFields = fields.map((field, index) => ({
    ...field,
    ...watchFieldArray[index],
  }));

  const onSubmit: SubmitHandler<IFormInput> = async ({
    firstName,
    lastName,
    jobs: jobList,
    unavailableDates,
  }) => {
    let notAvailable = [];
    setIsBackDropOpen(true);

    if (unavailableDates.length) {
      notAvailable = unavailableDates.map((date) => ({
        month: date.month,
        year: date.year,
      }));
    }

    try {
      await firebase.firestore().collection('servants').add({
        firstName,
        lastName,
        jobList,
        notAvailable,
        previousJobs: [],
        upcomingJobs: [],
      });

      reset();
      setIsBackDropOpen(false);
      setUnavailableDate(null);
      setIsSnackBarOpen(true);
    } catch (error) {
      console.error('error', error);
    }
  };

  const handleAddUnavailableDate = (date: Date) => {
    const year = getYear(date);
    const month = format(date, 'MMMM');
    setUnavailableDate(null);

    append({
      year,
      month,
    });
  };

  const handleCloseSnackBar = () => {
    setIsSnackBarOpen(false);
  };

  return (
    <Box pl={2}>
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isBackDropOpen}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      <Snackbar
        open={isSnackBarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackBar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackBar}
          severity="success"
          sx={{ width: '100%' }}
        >
          Servant successfully added!
        </Alert>
      </Snackbar>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid
          container
          spacing={{ xs: 2, md: 3 }}
          columns={{ xs: 1, sm: 2, md: 4 }}
        >
          <Grid item xs={1} sm={2} md={2}>
            <Controller
              name="firstName"
              control={control}
              render={({
                field: { onChange, value, onBlur },
                fieldState: { error },
              }) => (
                <TextField
                  label="First Name*"
                  value={value}
                  onChange={onChange}
                  error={!!error}
                  onBlur={onBlur}
                  helperText={error ? error?.message : null}
                  fullWidth
                />
              )}
            />
          </Grid>
          <Grid item xs={1} sm={2} md={2}>
            <Controller
              name="lastName"
              control={control}
              render={({
                field: { onChange, value, onBlur },
                fieldState: { error },
              }) => (
                <TextField
                  label="Last Name*"
                  value={value}
                  onChange={onChange}
                  error={!!error}
                  onBlur={onBlur}
                  helperText={error ? error?.message : null}
                  fullWidth
                />
              )}
            />
          </Grid>
          <Grid item xs={1} sm={2} md={2}>
            <Controller
              name="jobs"
              control={control}
              render={({ field: { onChange, value } }) => (
                <Autocomplete
                  multiple
                  value={value}
                  id="checkboxes-tags-demo"
                  options={jobs}
                  onChange={(_, newValues) => {
                    onChange(newValues);
                  }}
                  disableCloseOnSelect
                  getOptionLabel={(option) => option}
                  renderOption={(props, option, { selected }) => (
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    <li {...props}>
                      <Checkbox
                        icon={Icon}
                        checkedIcon={CheckedIcon}
                        style={{ marginRight: 8 }}
                        checked={selected}
                      />
                      {option}
                    </li>
                  )}
                  renderInput={(params) => (
                    <TextField {...params} label="Jobs" fullWidth />
                  )}
                />
              )}
            />
          </Grid>
          <Grid item xs={1} sm={2} md={2}>
            <Grid
              container
              alignItems="center"
              columns={{ xs: 12, sm: 12, md: 12 }}
            >
              <Grid item xs={11} sm={11} md={11}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    views={['month', 'year']}
                    label="Unavailable Date"
                    minDate={new Date()}
                    value={unavailableDate}
                    onChange={(newValue: Date) => {
                      setUnavailableDate(newValue);
                    }}
                    renderInput={(params: TextFieldProps) => (
                      <TextField {...params} helperText={null} fullWidth />
                    )}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={1} sm={1} md={1}>
                <Tooltip title="Add unavailable date">
                  <span>
                    <IconButton
                      aria-label="Add unavailable date"
                      size="large"
                      color="primary"
                      disabled={!unavailableDate}
                      onClick={() => handleAddUnavailableDate(unavailableDate)}
                    >
                      <AddCircleIcon fontSize="inherit" />
                    </IconButton>
                  </span>
                </Tooltip>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        {controlledFields.length ? (
          <Box sx={unavailableDatesLayout} pr="16px" pt="8px">
            <Typography variant="h5">Unavailable Dates</Typography>
          </Box>
        ) : null}

        <Box sx={unavailableDatesLayout}>
          <List sx={{ width: 240 }}>
            {controlledFields.map((item, index) => (
              <ListItem
                secondaryAction={
                  <Tooltip title="Delete unavailable date">
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      color="error"
                      size="large"
                      onClick={() => remove(index)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                }
                key={item.id}
              >
                <ListItemAvatar>
                  <Avatar variant="rounded" sx={{ backgroundColor: '#eceff1' }}>
                    <CalendarTodayOutlinedIcon color="info" />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText>
                  <Controller
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    render={({ field }) => <span>{field.value} </span>}
                    name={`unavailableDates.${index}.month`}
                    control={control}
                  />
                  <Controller
                    render={({ field }) => <span>{field.value}</span>}
                    name={`unavailableDates.${index}.year`}
                    control={control}
                  />
                </ListItemText>
              </ListItem>
            ))}
          </List>
        </Box>
        <Box mt={3}>
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            type="submit"
            size="large"
          >
            Add Servant
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default AddServant;
