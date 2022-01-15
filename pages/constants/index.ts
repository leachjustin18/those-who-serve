import { GridColDef } from '@mui/x-data-grid';

const servantColumns: GridColDef[] = [
  {
    field: 'firstName',
    headerName: 'First Name',
    flex: 1,
    editable: true,
  },
  {
    field: 'lastName',
    headerName: 'Last Name',
    flex: 1,
    editable: true,
  },
  {
    field: 'jobs',
    headerName: 'Jobs',
    flex: 1,
  },
];

export default servantColumns;
