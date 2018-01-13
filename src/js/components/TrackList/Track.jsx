import React from 'react';
import PropTypes from 'prop-types';
import { Col, Row, Button, ButtonGroup, Glyphicon, FormControl } from 'react-bootstrap';
import { TrackTypes, samplerIcon, virtualInstrumentIcon, auxIcon  } from 'constants/Constants';

const Track = (props) => {
    let handleTrackNameChange = (event) => {
        props.handleTrackNameChange(event, props.trackDetails.index);
    }
    let getTrackRowClassName = () => {
        if (props.selected === props.trackDetails.index) {
            return 'trackRow selected'
        } else {
            return 'trackRow'
        }
    }
    let buttonRecord, buttonSolo, buttonMute, buttonIndexUp, buttonIndexDown;
    if (props.trackDetails.trackType !== TrackTypes.aux) {
        if (props.trackDetails.record) {
            buttonRecord = <Button bsSize="xsmall" bsStyle="danger" onClick={() => props.onRecordButtonClicked(props.trackDetails.index)}>R</Button>;
        } else {
            buttonRecord = <Button bsSize="xsmall" onClick={() => props.onRecordButtonClicked(props.trackDetails.index)}>R</Button>;
        }
    } else {
        buttonRecord = null;
    }
    if (props.trackDetails.solo) {
        buttonSolo = <Button bsSize="xsmall" bsStyle="warning" onClick={() => props.onSoloButtonClicked(props.trackDetails.index)}>S</Button>;
    } else {
        buttonSolo = <Button bsSize="xsmall" onClick={() => props.onSoloButtonClicked(props.trackDetails.index)}>S</Button>;
    }
    if (props.trackDetails.mute) {
        buttonMute = <Button bsSize="xsmall" bsStyle="info" onClick={() => props.onMuteButtonClicked(props.trackDetails.index)}>M</Button>;
    } else {
        buttonMute = <Button bsSize="xsmall" onClick={() => props.onMuteButtonClicked(props.trackDetails.index)}>M</Button>;
    }
    if (props.trackDetails.index > 1) {
        buttonIndexDown = <Button bsSize="xsmall" onClick={() => props.onIndexDown(props.trackDetails.index)}>
            <Glyphicon glyph="arrow-up" />
        </Button>;
    }
    if (props.trackDetails.index + 1 < props.trackListLength) {
        buttonIndexUp = <Button bsSize="xsmall" onClick={() => props.onIndexUp(props.trackDetails.index)}>
            <Glyphicon glyph="arrow-down" />
        </Button>;
    }
    let getIcon = () => {
        switch(props.trackDetails.trackType ){
            case TrackTypes.aux:{
                return auxIcon;
            }
            case TrackTypes.virtualInstrument:{
                if(props.trackDetails.instrument.name === 'Sampler'){
                    return samplerIcon;
                } else {
                    return virtualInstrumentIcon;
                }
            }
        }
    }
    //TODO: text input not triggering piano
    return (
        <Row
            className={getTrackRowClassName()}
            onClick={() => props.handleRowClicked(props.trackDetails.index)}
            style={{ marginLeft: 0, marginRight: 0 }}
        >
            <Col xs={2} className="nopadding">
                <p> {props.trackDetails.index} </p>
                {buttonIndexDown}
                {buttonIndexUp}
            </Col>
            <Col xs={2} className="nopadding">
                <img src={getIcon()} />
            </Col>
            <Col xs={8} className="nopadding">
                    <ButtonGroup style={{ display: 'flex-inline', position: 'absolute', right: '0' }}>
                        {buttonSolo}
                        {buttonMute}
                        {buttonRecord}
                        <Button bsSize="xsmall"><Glyphicon glyph="remove" onClick={() => props.handleRemove(props.trackDetails.index)} /></Button>
                    </ButtonGroup>
                    <FormControl className="trackNameFormControl" value={props.trackDetails.name} onChange={handleTrackNameChange} onFocus={props.onInputFocusSwitch} onBlur={props.onInputFocusSwitch}/>
                </Col>
        </Row>
            );
}
Track.propTypes = {
                trackDetails: PropTypes.object.isRequired
}

export default Track;