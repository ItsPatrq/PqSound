import React from 'react';
import {ButtonGroup, Button, Col} from 'react-bootstrap';

const SoloMuteButtons = () => {
    return (
        <div className="soloMuteButtons">
        <ButtonGroup justified>
            <Col xs={6} className="nopadding">
            <Button block={true} className="btn-block" >S</Button>

            </Col>
            <Col xs={6} className="nopadding">
            <Button block={true} className="btn-block">M</Button>
            </Col>
        </ButtonGroup>
        </div>
    );
}

export default SoloMuteButtons;