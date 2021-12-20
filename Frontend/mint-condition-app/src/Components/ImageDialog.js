import * as React from 'react';
import Dialog from '@mui/material/Dialog';

export default function ImageDialog(props) {
    return (
        <Dialog open={props.visible} onClose={props.handleClose} maxWidth={props.maxWidth}>
            <img
                src={props.item.src}
                srcSet={props.item.srcSet}
                alt={props.labels}
                loading="lazy"
                style={{"width": 'auto', "maxHeight": "calc(100vh - 64px)", "objectFit": "contain"}}/>
        </Dialog>
    );
}