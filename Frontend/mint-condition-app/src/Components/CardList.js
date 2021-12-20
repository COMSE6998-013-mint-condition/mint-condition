import React from 'react';
import {Box, Container, ImageList, ImageListItem, ImageListItemBar, Paper} from '@material-ui/core';
import {useNavigate} from "react-router-dom";
import conditionColorMapper from "./ColorMapper";

function CardList(props) {
    const navigate = useNavigate();

    return (
        <Container maxWidth='xl'>
            <Paper style={{margin: 15}}>
                <Box maxWidth='xl' style={{flexGrow: 1, padding: 10}}>
                    <ImageList cols={4} rowHeight={300} gap={10} style={{flexGrow: 1}}>
                        {
                            props.cards?.reverse().map((card) => (
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
                                        style={{border: '4px outset ' + conditionColorMapper[card.condition_label]}}
                                    />
                                </ImageListItem>
                            ))
                        }
                    </ImageList>
                </Box>
            </Paper>
        </Container>
    )
}

export default CardList;