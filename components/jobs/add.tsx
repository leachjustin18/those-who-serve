import { useForm, Controller } from 'react-hook-form';
import type { UseFormReset } from 'react-hook-form';
import { TextField, Button, Box, Grid } from '@mui/material';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { v4 as uuidv4 } from 'uuid';
import type { SubmitHandler } from 'react-hook-form';
import type { TAPIAddJob, TAddJobFormInputs } from '../../types/types';

const AddJob = ({
  onJobSubmit,
}: {
  onJobSubmit: (
    arg: TAPIAddJob,
    reset: UseFormReset<TAddJobFormInputs>
  ) => void;
}) => {
  const jobName = 'jobFriendlyName';
  const jobNumberOfServantsName = 'jobNumberOfServants';

  const schema = yup
    .object({
      [jobName]: yup.string().required('Please specify the name of the job'),
      [jobNumberOfServantsName]: yup
        .number()
        .typeError('Please use only numbers')
        .min(1, 'Number of servants cannot be less than 1')
        .required(),
    })
    .required();

  const { handleSubmit, control, reset } = useForm<TAddJobFormInputs>({
    resolver: yupResolver(schema),
    mode: 'onBlur',
    defaultValues: {
      [jobName]: '',
      [jobNumberOfServantsName]: 1,
    },
  });

  const onSubmit: SubmitHandler<TAddJobFormInputs> = (data) => {
    const jobFriendlyName = data?.jobFriendlyName;
    const jobNumberOfServants = data?.jobNumberOfServants;

    const jobData = {
      id: uuidv4(),
      jobFriendlyName,
      jobNumberOfServants,
      name: jobFriendlyName.replace(/[^a-zA-Z]/g, ''),
    };

    onJobSubmit(jobData, reset);
  };

  return (
    <Box sx={{ mt: 2 }}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 2, md: 12 }}>
          <Grid item xs={2} md={6}>
            <Controller
              name={jobName}
              control={control}
              rules={{ required: true }}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  required
                  label="Job name"
                  error={!!error}
                  helperText={error?.message}
                  fullWidth
                  variant="standard"
                />
              )}
            />
          </Grid>

          <Grid item xs={2} md={6}>
            <Controller
              name={jobNumberOfServantsName}
              control={control}
              defaultValue={undefined}
              rules={{ required: true }}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  required
                  label="Number of servants"
                  error={!!error}
                  helperText={error?.message}
                  fullWidth
                  variant="standard"
                  inputProps={{
                    maxLength: 2,
                  }}
                />
              )}
            />
          </Grid>
        </Grid>
        <Button type="submit" variant="contained" sx={{ mt: 4 }}>
          Add Job
        </Button>
      </form>
    </Box>
  );
};

export default AddJob;
