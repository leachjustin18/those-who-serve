import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Button,
  Box,
  Grid,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import type { SubmitHandler } from 'react-hook-form';
import type { TJob } from '../../types/types';

const UpdateJob = ({
  onClose,
  data,
  onUpdate,
}: {
  onClose: () => void;
  onUpdate: (args: TJob) => void;
  data?: TJob;
}) => {
  const jobFriendlyName = 'jobFriendlyName';
  const jobNumberOfServantsName = 'jobNumberOfServants';

  const schema = yup
    .object({
      [jobFriendlyName]: yup
        .string()
        .required('Please specify the name of the job'),
      [jobNumberOfServantsName]: yup
        .number()
        .typeError('Please use only numbers')
        .min(1, 'Number of servants cannot be less than 1')
        .required(),
    })
    .required();

  const { handleSubmit, control } = useForm<TJob>({
    resolver: yupResolver(schema),
    mode: 'onBlur',
    defaultValues: {
      id: data?.id,
      [jobFriendlyName]: data?.jobFriendlyName,
      [jobNumberOfServantsName]: data?.jobNumberOfServants,
      key: data?.key,
      name: data?.name,
    },
  });

  const onSubmit: SubmitHandler<TJob> = (data) => {
    onUpdate(data);
  };

  return (
    <Dialog maxWidth="sm" open fullWidth onClose={onClose}>
      <DialogTitle>Update Job {data?.jobFriendlyName}</DialogTitle>
      <DialogContent>
        <Grid container spacing={{ xs: 3 }} columns={{ xs: 12 }}>
          <Grid item xs={12}>
            <Controller
              name={jobFriendlyName}
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

          <Grid item xs={12}>
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
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit(onSubmit)}>Update</Button>
      </DialogActions>
    </Dialog>
  );
};

export default UpdateJob;
