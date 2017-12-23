import React from 'react';
import { Row } from 'react-bootstrap';

const PianoRollTimeBar = (props) => {
    let beats = new Array;
    for (let i = 0; i <= props.bits; i++) {
        beats.push(
            <div className="timeBarBeat" style={{ left: i * 50 + 'px' }} key={i.toString()}>
                {i}
            </div>
        );
    }
    return (
        <Row className="pianoRollTimeBar" style={{width: 50 * props.bits + 'px'}}>
            {beats}
        </Row>
    );
}

export default PianoRollTimeBar;