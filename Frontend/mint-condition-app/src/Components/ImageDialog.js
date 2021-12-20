import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Grid from '@mui/material/Grid';

export default function ImageDialog(props) {
    return (
        <Dialog open={props.visible} onClose={props.handleClose} maxWidth={props.maxWidth}
                maxHeight={false}>
            <DialogContent style={{backgroundColor: "#575757"}}>
                <Grid container
                      justifyContent='space-evenly'
                      alignItems='center'
                      direction='column'
                >
                    <Grid item>
                        <img
                            src={props.item.src}
                            srcSet={props.item.srcSet}
                            alt={props.labels}
                            loading="lazy"
                            style={{"maxWidth": "100%", "objectFit": "cover"}}/>
                    </Grid>
                </Grid>
            </DialogContent>
        </Dialog>
    );
}