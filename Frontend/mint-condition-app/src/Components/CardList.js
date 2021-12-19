import React from 'react';
import Grid from '@material-ui/core/Grid';
import {Box, ImageList, ImageListItem, ImageListItemBar} from '@material-ui/core';
import {useNavigate} from "react-router-dom";
import conditionColorMapper from "./ColorMapper";

function CardList(props) {
    const navigate = useNavigate();

    return (
        <Box maxWidth='xl' style={{marginTop: 40, flexGrow: 1}}>
            <Grid container
                  direction="row"
                  spacing={2}
                  style={{margin: 10}}>
                <Grid item>
                    <ImageList cols={4} rowHeight={300} gap={10}>
                        {
                            props.cards?.map((card) => (
                                <ImageListItem key={card.path}>
                                    <img
                                        key={card.path}
                                        src={card.path}
                                        alt={card.path}
                                        onClick={() => {
                                            navigate(`/card/${card.card_id}`)
                                            window.location.reload()
                                        }}
                                    />
                                    <ImageListItemBar
                                        title={card.label}
                                        style={{border: '5px dotted ' + conditionColorMapper[card.condition_label]}}
                                    />
                                </ImageListItem>
                            ))
                        }
                    </ImageList>
                </Grid>
            </Grid>
        </Box>
    )
}

export default CardList;