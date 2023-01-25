import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from '@mui/material';

const DeleteJob = ({
  jobName,
  onClose,
  onDelete,
}: {
  onClose: () => void;
  onDelete: () => Promise<void>;
  jobName?: string;
}) => {
  return (
    <Dialog maxWidth="sm" open fullWidth onClose={onClose}>
      <DialogTitle>Are you sure you want to delete job {jobName}?</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Deleting job <strong>{jobName}</strong> is a permanent option that
          cannot be undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button color="error" onClick={onDelete}>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteJob;
