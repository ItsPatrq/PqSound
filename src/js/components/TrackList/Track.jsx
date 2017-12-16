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
    let buttonRecord, buttonSolo, buttonMute;
    if(props.trackDetails.record){
        buttonRecord = <Button bsSize="xsmall" bsStyle="danger" onClick={() => props.onRecordButtonClicked(props.trackDetails.index)}>R</Button>;
    } else {
        buttonRecord = <Button bsSize="xsmall" onClick={() => props.onRecordButtonClicked(props.trackDetails.index)}>R</Button>;
    }
    if(props.trackDetails.solo){
        buttonSolo = <Button bsSize="xsmall" bsStyle="warning" onClick={() => props.onSoloButtonClicked(props.trackDetails.index)}>S</Button>;
    } else {
        buttonSolo = <Button bsSize="xsmall" onClick={() => props.onSoloButtonClicked(props.trackDetails.index)}>S</Button>;
    }
    if(props.trackDetails.mute){
        buttonMute = <Button bsSize="xsmall" bsStyle="info" onClick={() => props.onMuteButtonClicked(props.trackDetails.index)}>M</Button>;
    } else {
        buttonMute = <Button bsSize="xsmall" onClick={() => props.onMuteButtonClicked(props.trackDetails.index)}>M</Button>;
    }
    //TODO: text input not triggering piano
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
                    {buttonSolo}
                    {buttonMute}
                    {buttonRecord}
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