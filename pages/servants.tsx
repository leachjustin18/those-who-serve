import { useState, useEffect } from 'react';
import Head from 'next/head';
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
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { DataGrid, GridToolbar, GridCellParams } from '@mui/x-data-grid';
import {
  Visibility as VisibilityIcon,
  AddCircle as AddCircleIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import LoggedInGuard from '../components/authorization/LoggedInGuard';
import Container from '../components/layout/Container';
import { servantColumns, servantsCollection } from '../constants';
import { IServant, TUnavailableDate } from '../constants/types';
import TabPanel from '../components/tab/TabPanel';
import AddServant from '../components/servants/AddServant';
import EditServant from '../components/servants/EditServant';
import db from '../components/firebase/firestore';

const Servants = () => {
  const [value, setValue] = useState(0);
  const [servant, setServant] = useState<IServant | null>();
  const [isConfirmDeletionOpen, setIsConfirmDeletionOpen] = useState(false);
  const [isSnackBarOpen, setIsSnackBarOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [servantData, setServantData] = useState([]);
  const [fetchServantData, setFetchServantData] = useState(false);
  const [servantUpdateText, setServantUpdateText] = useState('');

  useEffect(() => {
    (async () => {
      const gotServantData = await getDocs(collection(db, servantsCollection));

      const servants = [];

      gotServantData.forEach((servantDoc) => {
        const data = servantDoc.data();

        const unavailableDates = data.notAvailable.filter(
          (n: TUnavailableDate) => n
        ).length
          ? data.notAvailable.reduce(
              (acc: string, date: TUnavailableDate) =>
                `${acc}${acc ? ', ' : ''}${date.month} ${date.year}`,
              ''
            )
          : '';

        servants.push({
          id: servantDoc.id,
          firstName: data.firstName,
          lastName: data.lastName,
          jobs: data.jobList.join(', '),
          notAvailable: unavailableDates,
          unavailableDates: data.notAvailable,
        });
      });

      setServantData(servants);
      setFetchServantData(false);
    })();
  }, [fetchServantData]);

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  const onCellSelect = (params: GridCellParams) => {
    setServant(params.row);
  };

  const handleOpenConfirmationDialog = () => {
    setIsConfirmDeletionOpen(true);
  };

  const handleCloseConfirmationDialog = () => {
    setIsConfirmDeletionOpen(false);
  };

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
  };

  const handleUpdateEditDialog = () => {
    // TODO: Clean this up to be one state instead of needing to call re-render multiple times
    setIsEditDialogOpen(false);
    setServantUpdateText('updated');
    setIsSnackBarOpen(true);
    setFetchServantData(true);
    setServant(null);
  };

  const handleAfterSave = () => {
    setFetchServantData(true);
  };

  const handleOpenEditDialog = () => {
    setIsEditDialogOpen(true);
  };

  const handleDeleteServant = async () => {
    try {
      await deleteDoc(doc(db, servantsCollection, servant.id));
      setServantUpdateText('deleted');
      setIsSnackBarOpen(true);
      setFetchServantData(true);
    } catch (error) {
      console.log('error', error);
    }

    handleCloseConfirmationDialog();
    setServant(null);
  };

  const handleCloseSnackBar = () => {
    setIsSnackBarOpen(false);
  };

  return (
    <>
      <Head>
        <title>Those who serve - Servants</title>
      </Head>

      <LoggedInGuard>
        <Container>
          <>
            {/* Delete servant dialog */}
            <Dialog
              open={isConfirmDeletionOpen}
              onClose={handleCloseConfirmationDialog}
              fullScreen={fullScreen}
            >
              {servant ? (
                <>
                  <DialogTitle id="alert-dialog-title">
                    Would you like to delete servant {servant.firstName}{' '}
                    {servant.lastName}?
                  </DialogTitle>
                  <DialogContent>
                    <DialogContentText>
                      Deleting servant{' '}
                      <strong>
                        {servant.firstName} {servant.lastName}
                      </strong>{' '}
                      will no longer allow us to add them to Those Who Serve
                      calendar.
                      <Box pt={2} component="span" sx={{ display: 'block' }}>
                        <strong>This action cannot be undone.</strong>
                      </Box>
                    </DialogContentText>
                  </DialogContent>
                  <DialogActions>
                    <Button
                      onClick={handleCloseConfirmationDialog}
                      variant="outlined"
                    >
                      No
                    </Button>
                    <Button
                      onClick={handleDeleteServant}
                      autoFocus
                      color="error"
                      variant="outlined"
                    >
                      Yes
                    </Button>
                  </DialogActions>
                </>
              ) : null}
            </Dialog>
            {/* / Delete servant dialog */}

            {/* Edit servant dialog */}
            {servant && isEditDialogOpen ? (
              <EditServant
                servant={servant}
                fullScreen={fullScreen}
                onClose={handleCloseEditDialog}
                onUpdate={handleUpdateEditDialog}
                open={isEditDialogOpen}
              />
            ) : null}
            {/* / Edit servant dialog */}

            <Snackbar
              open={isSnackBarOpen}
              autoHideDuration={6000}
              onClose={handleCloseSnackBar}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
              <Alert
                onClose={handleCloseSnackBar}
                severity="info"
                sx={{ width: '100%' }}
              >
                Servant successfully {servantUpdateText}
              </Alert>
            </Snackbar>

            <Typography variant="h2">Servants</Typography>
            <Box
              sx={{
                bgcolor: 'background.paper',
                display: fullScreen ? 'block' : 'flex',
                height: 224,
              }}
            >
              <Tabs
                value={value}
                onChange={(_, newValue: number) => setValue(newValue)}
                orientation={fullScreen ? 'horizontal' : 'vertical'}
                variant={fullScreen ? 'fullWidth' : null}
                sx={{
                  borderRight: fullScreen ? 0 : 1,
                  borderColor: fullScreen ? null : 'divider',
                }}
              >
                <Tab icon={<VisibilityIcon />} label="VIEW" />
                <Tab icon={<AddCircleIcon />} label="ADD" />
              </Tabs>

              <TabPanel value={value} index={0}>
                <>
                  {servantData.length ? (
                    <Box sx={{ height: '400px' }}>
                      <DataGrid
                        onCellClick={(params: GridCellParams) => {
                          onCellSelect(params);
                        }}
                        rows={servantData}
                        columns={servantColumns}
                        pageSize={5}
                        rowsPerPageOptions={[5]}
                        components={{
                          Toolbar: GridToolbar,
                        }}
                      />
                    </Box>
                  ) : null}

                  {servant ? (
                    <>
                      <Box mt={2} mb={1}>
                        <Typography variant="subtitle1">
                          Servant
                          <strong>
                            {' '}
                            {servant.firstName} {servant.lastName}{' '}
                          </strong>
                          Selected
                        </Typography>
                      </Box>
                      <Button
                        variant="contained"
                        color="info"
                        startIcon={<EditIcon />}
                        onClick={handleOpenEditDialog}
                      >
                        Edit
                      </Button>{' '}
                      <Button
                        variant="contained"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={handleOpenConfirmationDialog}
                      >
                        Delete
                      </Button>
                    </>
                  ) : (
                    <Box pt={2}>
                      <Typography variant="body2">
                        Select Servant for options
                      </Typography>
                    </Box>
                  )}
                </>
              </TabPanel>
              <TabPanel value={value} index={1}>
                <AddServant afterSave={handleAfterSave} />
              </TabPanel>
            </Box>
          </>
        </Container>
      </LoggedInGuard>
    </>
  );
};

export default Servants;
