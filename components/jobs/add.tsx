import { useForm, Controller } from 'react-hook-form';
import { TextField, Button, Box, Grid } from '@mui/material';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { v4 as uuidv4 } from 'uuid';
import type { SubmitHandler } from 'react-hook-form';

interface IFormInputs {
  jobFriendlyName: string;
  jobNumberOfServants: string;
}

const AddJob = () => {
  const schema = yup
    .object({
      jobFriendlyName: yup
        .string()
        .required('Please specify the name of the job'),
      jobNumberOfServants: yup
        .number()
        .typeError('Please use only numbers')
        .min(1, 'Number of servants cannot be less than 1')
        .required(),
    })
    .required();

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<IFormInputs>({
    resolver: yupResolver(schema),
  });

  const onSubmit: SubmitHandler<IFormInputs> = (data) => {
    const jobFriendlyName = data?.jobFriendlyName;
    const jobNumberOfServants = data?.jobNumberOfServants;

    const jobData = {
      id: uuidv4(),
      jobFriendlyName,
      jobNumberOfServants,
      name: jobFriendlyName.replace(/[^a-zA-Z]/g, ''),
    };
    console.log('🚀 ~ file: add.tsx:35 ~ AddJob ~ jobData', jobData);
  };

  const jobName = 'jobFriendlyName';
  const jobNumberOfServantsName = 'jobNumberOfServants';

  return (
    <Box sx={{ mt: 2 }}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 2, md: 12 }}>
          <Grid item xs={2} md={6}>
            <Controller
              name={jobName}
              control={control}
              defaultValue=""
              rules={{ required: true }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Job name"
                  error={!!errors[jobName]}
                  helperText={errors[jobName]?.message ?? ''}
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
              defaultValue=""
              rules={{ required: true }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Number of servants"
                  error={!!errors[jobNumberOfServantsName]}
                  helperText={errors[jobNumberOfServantsName]?.message ?? ''}
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
