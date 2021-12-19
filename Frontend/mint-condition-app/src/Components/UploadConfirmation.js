import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

export default function UploadConfirmation(props) {

    const [labels, setLabels] = React.useState();

    const handleSubmission = () => {
        props.handleUpload(labels)
        props.handleClose()
    }

    return (
        <div>
            <Dialog open={props.visible} onClose={props.handleClose}>
                <DialogTitle>Confirmation</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Specify any labels in a comma separated list. Ex. pikachu,2018,shiny
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        label="Labels"
                        type="labels"
                        fullWidth
                        variant="standard"
                        onChange={(event) => {
                            setLabels(event.target.value)
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleSubmission}>Confirm</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}