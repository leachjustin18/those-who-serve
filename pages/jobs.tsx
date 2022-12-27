import { useState } from 'react';
import Head from 'next/head';
import useSwr from 'swr';
import {
  Typography,
  Box,
  Tabs,
  Tab,
  Button,
  DialogContent,
  Dialog,
  DialogActions,
  DialogContentText,
  DialogTitle,
  useMediaQuery,
  Snackbar,
  Alert,
  IconButton,
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
  Visibility as VisibilityIcon,
  AddCircle as AddCircleIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import LoggedInGuard from '../components/authorization/LoggedInGuard';
import Container from '../components/layout/Container';
import admin from '../firebase/nodeApp';
import type { TJobs } from '../types/types';
import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import headerTitle from '../util/headerTitle';
import TabPanel from '../components/tabs/TabPanel';
import AddJob from '../components/jobs/add';

const fetcher: any = (url: string) => fetch(url).then((res) => res.json());

const Jobs = ({ data }: { data: { jobs: TJobs[] } }) => {
  const [value, setValue] = useState(0);
  const title = 'Jobs';
  const headTitle = headerTitle(title);

  const jobRow = data.jobs;

  // const { data: blah, error } = useSwr<any>('/api/job/add', fetcher);

  // if (error) return <div>Failed to load users</div>;
  // if (!blah) return <div>Loading...</div>;
  // console.log(blah);

  const jobColumn: GridColDef[] = [
    {
      field: 'friendlyName',
      headerName: 'Job',
      width: 250,
    },
    {
      field: 'edit',
      headerName: 'Edit',
      width: 150,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams) => {
        console.log('🚀 ~ file: jobs.tsx ~ line 30 ~ Jobs ~ params', params);
        return (
          <IconButton aria-label="edit" color="primary">
            <EditIcon />
          </IconButton>
        );
      },
    },
    {
      field: 'delete',
      headerName: 'Delete',
      width: 150,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams) => {
        console.log('🚀 ~ file: jobs.tsx ~ line 30 ~ Jobs ~ params', params);
        return (
          <IconButton aria-label="delete" color="error">
            <DeleteIcon />
          </IconButton>
        );
      },
    },
  ];
  return (
    <>
      <Head>
        <title>{headTitle}</title>
      </Head>

      <Container title={title}>
        <LoggedInGuard>
          <Tabs
            value={value}
            onChange={(_, newValue: number) => setValue(newValue)}
            orientation={'horizontal'}
            variant={'fullWidth'}
          >
            <Tab icon={<VisibilityIcon />} label="VIEW" />
            <Tab icon={<AddCircleIcon />} label="ADD" />
          </Tabs>
          <TabPanel value={value} index={0}>
            <Box sx={{ flex: 1 }}>
              <DataGrid
                rows={jobRow}
                columns={jobColumn}
                autoHeight
                components={{ Toolbar: GridToolbar }}
              />
            </Box>
          </TabPanel>
          <TabPanel value={value} index={1}>
            <AddJob />
          </TabPanel>
        </LoggedInGuard>
      </Container>
    </>
  );
};

export const getServerSideProps = async () => {
  const db = admin.database();
  const ref = db.ref('thoseWhoServe/jobs');
  let jobs: TJobs[] = [];
  await ref.once('value', (snapshot) => {
    jobs = snapshot.val();
  });

  return { props: { data: { jobs } } };
};

export default Jobs;
