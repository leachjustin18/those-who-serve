import { useState } from 'react';
import Head from 'next/head';
import { Typography, Box, Tabs, Tab } from '@mui/material';
import { useCollectionDataOnce } from 'react-firebase-hooks/firestore';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
  Visibility as VisibilityIcon,
  AddCircle as AddCircleIcon,
} from '@mui/icons-material';
import firebase from './firebase/clientApp';
import LoggedInGuard from './components/authorization/LoggedInGuard';
import Container from './components/layout/Container';
import servantColumns from './constants';
import TabPanel from './components/tab/TabPanel';
import AddServant from './components/servants/AddServant';

const Servants = () => {
  const [servants, servantsLoading] = useCollectionDataOnce(
    firebase.firestore().collection('servants'),
    { idField: 'id' }
  );

  const [value, setValue] = useState(0);

  let servantData = [];

  if (!servantsLoading && servants) {
    servantData = servants.map((doc) => ({
      id: doc.id,
      firstName: doc.firstName,
      lastName: doc.lastName,
      jobs: doc.jobList.join(', '),
    }));
  }

  return (
    <>
      <Head>
        <title>Those who serve - Servants</title>
      </Head>

      <LoggedInGuard>
        <Container>
          <>
            <Typography variant="h2">Servants</Typography>
            <Box
              sx={{
                bgcolor: 'background.paper',
                display: 'flex',
                height: 224,
              }}
            >
              <Tabs
                value={value}
                onChange={(_, newValue: number) => setValue(newValue)}
                orientation="vertical"
                variant="scrollable"
                sx={{ borderRight: 1, borderColor: 'divider' }}
              >
                <Tab icon={<VisibilityIcon />} label="VIEW" />
                <Tab icon={<AddCircleIcon />} label="ADD" />
              </Tabs>

              <TabPanel value={value} index={0}>
                {servantData.length ? (
                  <Box sx={{ height: '400px' }}>
                    <DataGrid
                      rows={servantData}
                      columns={servantColumns}
                      pageSize={5}
                      rowsPerPageOptions={[5]}
                      checkboxSelection
                      disableSelectionOnClick
                      components={{
                        Toolbar: GridToolbar,
                      }}
                    />
                  </Box>
                ) : null}
              </TabPanel>
              <TabPanel value={value} index={1}>
                <AddServant />
              </TabPanel>
            </Box>
          </>
        </Container>
      </LoggedInGuard>
    </>
  );
};

export default Servants;
