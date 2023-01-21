import { useState, useEffect } from 'react';
import Head from 'next/head';
import {
  Typography,
  Box,
  Tabs,
  Tab,
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
import type { UseFormReset } from 'react-hook-form';
import LoggedInGuard from '../components/authorization/LoggedInGuard';
import Container from '../components/layout/Container';
import admin from '../firebase/nodeApp';
import type { TJobs, TAPIAddJob } from '../types/types';
import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import headerTitle from '../util/headerTitle';
import TabPanel from '../components/tabs/TabPanel';
import AddJob from '../components/jobs/add';
import Loading from '../components/util/loading';
import { useData, actions } from '../context/dataContext';
import type { TAddJobFormInputs } from '../types/types';

const Jobs = ({ data }: { data: { jobs: TJobs[] } }) => {
  const [value, setValue] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [dataResponse, setDataResponse] = useState<{
    isOpen: boolean;
    message?: string;
    severity?: 'success' | 'error';
  }>({
    isOpen: false,
  });
  const title = 'Jobs';
  const headTitle = headerTitle(title);
  const { state, dispatch } = useData();

  useEffect(() => {
    if (state?.jobs?.length === 0) {
      setIsLoading(true);
      dispatch({ type: actions.INITIATE_JOBS, payload: data.jobs });
      setIsLoading(false);
    }
  }, []);

  const jobsData = state.jobs;

  const onJobDelete = async (key: string) => {
    try {
      const addedJob = await fetch(`/api/job/delete/${key}`, {
        method: 'DELETE',
      });
      // const { data } = await addedJob.json();
      // dispatch({ type: actions.ADD_JOB, payload: [data] });
      // setDataResponse({
      //   isOpen: true,
      //   severity: 'success',
      //   message: `Job ${data.jobFriendlyName} successfully added`,
      // });
      // reset();
    } catch (error) {
      setDataResponse({
        isOpen: true,
        severity: 'error',
        message: `Error adding a new job - ${error}`,
      });
    }
  };

  const jobColumn: GridColDef[] = [
    {
      field: 'jobFriendlyName',
      headerName: 'Job',
      width: 250,
    },
    {
      field: 'jobNumberOfServants',
      headerName: 'Number of servants',
      width: 250,
    },
    {
      field: 'edit',
      headerName: 'Edit',
      width: 150,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams) => {
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
        const key = params?.row?.key;
        return (
          <IconButton
            aria-label="delete"
            color="error"
            onClick={() => onJobDelete(key)}
          >
            <DeleteIcon />
          </IconButton>
        );
      },
    },
  ];

  const onJobSubmit = async (
    arg: TAPIAddJob,
    reset: UseFormReset<TAddJobFormInputs>
  ) => {
    try {
      const addedJob = await fetch('/api/job/create', {
        method: 'POST',
        body: JSON.stringify(arg),
      });
      const { data, key } = await addedJob.json();
      dispatch({ type: actions.ADD_JOB, payload: [{ ...data, key }] });
      setDataResponse({
        isOpen: true,
        severity: 'success',
        message: `Job ${data.jobFriendlyName} successfully added`,
      });
      reset();
    } catch (error) {
      setDataResponse({
        isOpen: true,
        severity: 'error',
        message: `Error adding a new job - ${error}`,
      });
    }
  };

  const handleCloseDataResponse = () => {
    setDataResponse({ isOpen: false, severity: undefined, message: undefined });
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <>
      <Head>
        <title>{headTitle}</title>
      </Head>

      <Container title={title}>
        <LoggedInGuard>
          <Snackbar
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            onClose={handleCloseDataResponse}
            autoHideDuration={6000}
            open={dataResponse.isOpen}
          >
            <Alert
              onClose={handleCloseDataResponse}
              severity={dataResponse.severity}
              sx={{ width: '100%' }}
            >
              {dataResponse.message}
            </Alert>
          </Snackbar>

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
                rows={jobsData}
                columns={jobColumn}
                autoHeight
                components={{ Toolbar: GridToolbar }}
              />
            </Box>
          </TabPanel>
          <TabPanel value={value} index={1}>
            <AddJob onJobSubmit={onJobSubmit} />
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

  await ref.orderByKey().on('value', (snapshot) => {
    snapshot.forEach((data) => {
      jobs.push({ key: data.key, ...data.val() });
    });
  });

  return { props: { data: { jobs } } };
};

export default Jobs;
