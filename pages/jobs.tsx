import Head from 'next/head';
import { Button } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import LoggedInGuard from '../components/authorization/LoggedInGuard';
import Container from '../components/layout/Container';
import admin from '../firebase/nodeApp';
import type { TJobs } from '../types/dataTypes';
import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import headerTitle from '../util/headerTitle';

const Jobs = ({ data }: { data: { jobs: TJobs[] } }) => {
  const title = 'Jobs';
  const headTitle = headerTitle(title);

  const jobRow = data.jobs;

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
      renderCell: (params: GridRenderCellParams<any>) => {
        console.log('🚀 ~ file: jobs.tsx ~ line 30 ~ Jobs ~ params', params);
        return (
          <strong>
            <Button
              variant="contained"
              size="small"
              style={{ marginLeft: 16 }}
              tabIndex={params.hasFocus ? 0 : -1}
            >
              Open
            </Button>
          </strong>
        );
      },
    },
    {
      field: 'delete',
      headerName: 'Delete',
      width: 150,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams<any>) => {
        console.log('🚀 ~ file: jobs.tsx ~ line 30 ~ Jobs ~ params', params);
        return (
          <strong>
            <Button
              variant="contained"
              size="small"
              style={{ marginLeft: 16 }}
              tabIndex={params.hasFocus ? 0 : -1}
            >
              Open
            </Button>
          </strong>
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
          <DataGrid
            rows={jobRow}
            columns={jobColumn}
            autoHeight
            components={{ Toolbar: GridToolbar }}
          />
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
