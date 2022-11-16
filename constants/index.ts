import { GridColDef } from '@mui/x-data-grid';
import * as yup from 'yup';

const servantColumns: GridColDef[] = [
  {
    field: 'firstName',
    headerName: 'First Name',
    minWidth: 40,
  },
  {
    field: 'lastName',
    headerName: 'Last Name',
    minWidth: 150,
  },
  {
    field: 'jobs',
    headerName: 'Jobs',
    minWidth: 350,
  },
  {
    field: 'notAvailable',
    headerName: 'Unavailable Dates',
    minWidth: 400,
  },
];

const servantSchema = yup.object({
  firstName: yup.string().required('First Name is a required field'),
  lastName: yup.string().required('Last Name is a required field'),
});

const servantsCollection = 'servants';

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

export { servantColumns, servantSchema, servantsCollection, months };
