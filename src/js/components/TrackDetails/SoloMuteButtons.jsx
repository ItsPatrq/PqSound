import React from 'react';
import { ButtonGroup, Button, Col } from 'react-bootstrap';

const SoloMuteButtons = (props) => {
    let buttonSolo, buttonMute;
    if (props.trackDetails.mute) {
        buttonMute = <Button block={true} className="btn-block" bsStyle="info" onClick={() => props.onMuteButtonClicked(props.trackDetails.index)}>M</Button>;
    } else {
        buttonMute = <Button block={true} className="btn-block" onClick={() => props.onMuteButtonClicked(props.trackDetails.index)}>M</Button>;
    }
    if (props.trackDetails.solo) {
        buttonSolo = <Button block={true} className="btn-block" bsStyle="warning" onClick={() => props.onSoloButtonClicked(props.trackDetails.index)}>S</Button>;
    } else {
        buttonSolo = <Button block={true} className="btn-block" onClick={() => props.onSoloButtonClicked(props.trackDetails.index)}>S</Button>;
    }
    if(props.trackDetails.index === 0){
        buttonSolo = null;
    }
    return (
        <div className="soloMuteButtons">
            <ButtonGroup justified>
                <Col xs={6} className="nopadding">
                    {buttonSolo}

                </Col>
                <Col xs={6} className="nopadding">
                    {buttonMute}
                </Col>
            </ButtonGroup>
        </div>
    );
}

export default SoloMuteButtons;