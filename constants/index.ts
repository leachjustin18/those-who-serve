import { GridColDef } from '@mui/x-data-grid';
import * as yup from 'yup';

const servantColumns: GridColDef[] = [
  {
    field: 'firstName',
    headerName: 'First Name',
    flex: 1,
  },
  {
    field: 'lastName',
    headerName: 'Last Name',
    flex: 1,
  },
  {
    field: 'jobs',
    headerName: 'Jobs',
    flex: 1,
  },
];

const servantSchema = yup.object({
  firstName: yup.string().required('First Name is a required field'),
  lastName: yup.string().required('Last Name is a required field'),
});

const servantsCollection = 'servants';

export { servantColumns, servantSchema, servantsCollection };
