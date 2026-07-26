import * as React from 'react';
import { ButtonGroup, Button, Col } from 'react-bootstrap';

const SoloMuteButtons = (props) => {
    let buttonSolo, buttonMute;
    if (props.trackDetails.mute) {
        buttonMute = (
            <Button
                className="w-100"
                variant="info"
                onClick={() => props.onMuteButtonClicked(props.trackDetails.index)}
            >
                M
            </Button>
        );
    } else {
        buttonMute = (
            <Button className="w-100" onClick={() => props.onMuteButtonClicked(props.trackDetails.index)}>
                M
            </Button>
        );
    }
    if (props.trackDetails.solo) {
        buttonSolo = (
            <Button
                className="w-100"
                variant="warning"
                onClick={() => props.onSoloButtonClicked(props.trackDetails.index)}
            >
                S
            </Button>
        );
    } else {
        buttonSolo = (
            <Button className="w-100" onClick={() => props.onSoloButtonClicked(props.trackDetails.index)}>
                S
            </Button>
        );
    }
    if (props.trackDetails.index === 0) {
        buttonSolo = null;
    }
    return (
        <div className="soloMuteButtons">
            <ButtonGroup className="w-100">
                <Col xs={6} className="nopadding">
                    {buttonSolo}
                </Col>
                <Col xs={6} className="nopadding">
                    {buttonMute}
                </Col>
            </ButtonGroup>
        </div>
    );
};

export default SoloMuteButtons;
