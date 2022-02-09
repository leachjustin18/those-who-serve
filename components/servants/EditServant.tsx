import {
  Grid,
  Box,
  TextField,
  TextFieldProps,
  Autocomplete,
  Checkbox,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Typography,
  DialogContent,
  Dialog,
  DialogActions,
  DialogTitle,
  Button,
} from '@mui/material';
import {
  useForm,
  Controller,
  useFieldArray,
  SubmitHandler,
} from 'react-hook-form';
import {
  CalendarToday as CalendarTodayOutlinedIcon,
  Delete as DeleteIcon,
  AddCircle as AddCircleIcon,
} from '@mui/icons-material';
import { yupResolver } from '@hookform/resolvers/yup';
import { DatePicker, LocalizationProvider } from '@mui/lab';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import { useState } from 'react';
import { getYear, format } from 'date-fns';
import { doc, updateDoc } from 'firebase/firestore';
import { IFormInput, IServant } from '../../constants/types';
import { servantSchema, servantsCollection } from '../../constants';
import Icon from '../checkbox/Icon';
import CheckedIcon from '../checkbox/CheckedIcon';
import db from '../../pages/firebase/firestore';

const EditServant = ({
  servant,
  fullScreen,
  open,
  onClose,
  onUpdate,
}: {
  servant: IServant;
  fullScreen: boolean;
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
}) => {
  const [unavailableDate, setUnavailableDate] = useState<Date | null>(null);
  const jobsStatic = [
    'Lords Supper',
    'Usher',
    'Sunday Devotion',
    'Lead Signing',
  ];

  const jobs = servant?.jobs?.split(', ') ?? [];

  const { control, watch, handleSubmit } = useForm<IFormInput>({
    defaultValues: {
      firstName: servant.firstName,
      lastName: servant.lastName,
      jobs,
      unavailableDates: servant?.unavailableDates?.length
        ? servant?.unavailableDates
        : [],
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

  const handleAddUnavailableDate = (date: Date) => {
    const year = getYear(date);
    const month = format(date, 'MMMM');
    setUnavailableDate(null);

    append({
      year,
      month,
    });
  };

  const onSubmit: SubmitHandler<IFormInput> = async ({
    firstName,
    lastName,
    jobs: jobList,
    unavailableDates,
  }) => {
    let notAvailable = [];

    if (unavailableDates.filter((n) => n).length) {
      notAvailable = unavailableDates.map((date) => ({
        month: date.month,
        year: date.year,
      }));
    }

    try {
      const servantRef = doc(db, servantsCollection, servant.id);

      await updateDoc(servantRef, {
        firstName,
        lastName,
        jobList,
        notAvailable,
      });

      onUpdate();
    } catch (error) {
      console.error('error', error);
    }
  };

  return (
    <Dialog open={open} fullScreen={fullScreen} onClose={onClose}>
      <DialogTitle id="alert-dialog-title">
        Edit servant {servant.firstName} {servant.lastName}
      </DialogTitle>
      <DialogContent>
        <Box mt={1}>
          <Grid container spacing={{ xs: 2, md: 3 }} direction="column">
            <Grid item>
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

            <Grid item>
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

            <Grid item>
              <Controller
                name="jobs"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Autocomplete
                    multiple
                    value={value}
                    id="checkboxes-tags-demo"
                    options={jobsStatic}
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

            <Grid item>
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
                        onClick={() =>
                          handleAddUnavailableDate(unavailableDate)
                        }
                      >
                        <AddCircleIcon fontSize="inherit" />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Grid>
              </Grid>
            </Grid>

            <Grid item>
              {controlledFields.length ? (
                <Typography variant="body2">Unavailable Dates</Typography>
              ) : null}

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
                      <Avatar
                        variant="rounded"
                        sx={{ backgroundColor: '#eceff1' }}
                      >
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
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained" color="info">
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSubmit(onSubmit)}>
          Update
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditServant;
