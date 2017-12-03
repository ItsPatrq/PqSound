import React from 'react';
import PropTypes from 'prop-types';
import { Col, Row, Button, ButtonGroup, Glyphicon, FormControl } from 'react-bootstrap';

const Track = (props) => {
    let handleTrackNameChange = (event) => {
        props.handleTrackNameChange(event, props.trackDetails.index);
    }
    let getTrackRowClassName = () => {
        if(props.selected === props.trackDetails.index){
            return 'trackRow selected'
        } else {
            return 'trackRow'
        }
    }
    let buttonrecord;
    if(props.trackDetails.record){
        buttonrecord = <Button bsSize="xsmall" bsStyle="danger" onClick={() => props.handleRecord(props.trackDetails.index)}>R</Button>;
    } else {
        buttonrecord = <Button bsSize="xsmall" onClick={() => props.handleRecord(props.trackDetails.index)}>R</Button>;
    }
    return (
        <Row className={getTrackRowClassName()} onClick={() => props.handleRowClicked(props.trackDetails.index)}>
            <Col xs={2}>
                <p> {props.trackDetails.index} </p>
            </Col>
            <Col xs={2}>
                <Glyphicon glyph="picture" />
            </Col>
            <Col xs={8}>
                <ButtonGroup>
                    <Button bsSize="xsmall">S</Button>
                    <Button bsSize="xsmall">M</Button>
                    {buttonrecord}
                </ButtonGroup>
                <FormControl value={props.trackDetails.name} onChange={handleTrackNameChange}/>
                <Button bsSize="xsmall"><Glyphicon glyph="remove" onClick={() => props.handleRemove(props.trackDetails.index)}/></Button>
            </Col>
        </Row>
    );
}
Track.propTypes = {
    trackDetails: PropTypes.object.isRequired
}

export default Track;