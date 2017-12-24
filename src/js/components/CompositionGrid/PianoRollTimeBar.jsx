import React from 'react';
import { Row } from 'react-bootstrap';
import { isNullOrUndefined } from 'engine/Utils';

const PianoRollTimeBar = (props) => {
    let beats = new Array;
    for (let i = 0; i <= props.bits; i++) {
        beats.push(
            <div key={i.toString()}>
            <div className="timeBarBeat" style={{ left: i * 30 * 16 - props.scroll + 'px' }}>
                {i}
            </div>
            <div className="timeBarBeat" style={{ left: i * 30 * 16 + 120 - props.scroll + 'px' }}>
                1/4
            </div>
            <div className="timeBarBeat" style={{ left: i * 30 * 16 + 240 - props.scroll + 'px' }}>
                2/4
            </div>
            <div className="timeBarBeat" style={{ left: i * 30 * 16 + 360 - props.scroll + 'px' }}>
                3/4
            </div>
            </div>
        );
    }
    console.log(props.scroll)
    return (
        <Row className="pianoRollTimeBar" style={{ width: 30 * props.bits * 16 + 'px' }}>
            <div
                className="pianoRollTimeBarContent"
            >
                {beats}
            </div>
        </Row>
    );
}

export default PianoRollTimeBar;