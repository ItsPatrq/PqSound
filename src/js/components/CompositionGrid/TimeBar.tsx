import React from 'react';
import { Row } from 'react-bootstrap';

export const TimeBar = (props) => {
    let beats = new Array;
    for (let i = 0; i <= props.bits; i++) {
        beats.push(
            <div
                className="timeBarBeat"
                style={{ left: i * 50 - props.scroll + 'px' }}
                key={i.toString()}
                onClick={() => props.changeCurrSixteenth(i*16)}
            >
                {i}
            </div>
        );
    }
    return (
        <Row className="timeBar" style={{ width: 50 * props.bits + 'px' }}>
            <div
                className="timeBarContent"
            >
                {beats}
                <svg className="timePointer" style={{ left: props.sixteenthNotePlaying*50/16 - props.scroll +'px'}}><polygon points="2,2 10,8 18,2"></polygon></svg>
            </div>
        </Row>
    );
}

export default TimeBar;