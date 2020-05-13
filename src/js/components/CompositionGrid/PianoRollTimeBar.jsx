import React from 'react';
import { Row } from 'react-bootstrap';

const PianoRollTimeBar = (props) => {
    const beats = [];
    for (let i = 0; i <= props.bits; i++) {
        beats.push(
            <div key={(i + props.beatStart).toString()}>
                <div
                    className="timeBarBeat"
                    style={{ left: i * 30 * 16 - props.scroll + 'px' }}
                    onClick={() => props.changeCurrSixteenth((i + props.beatStart) * 16)}
                >
                    {i + props.beatStart}
                </div>
                <div
                    className="timeBarBeat"
                    style={{ left: i * 30 * 16 + 120 - props.scroll + 'px' }}
                    onClick={() => props.changeCurrSixteenth((i + props.beatStart) * 16 + 4)}
                >
                    1/4
                </div>
                <div
                    className="timeBarBeat"
                    style={{ left: i * 30 * 16 + 240 - props.scroll + 'px' }}
                    onClick={() => props.changeCurrSixteenth((i + props.beatStart) * 16 + 8)}
                >
                    2/4
                </div>
                <div
                    className="timeBarBeat"
                    style={{ left: i * 30 * 16 + 360 - props.scroll + 'px' }}
                    onClick={() => props.changeCurrSixteenth((i + props.beatStart) * 16 + 12)}
                >
                    3/4
                </div>
            </div>,
        );
    }
    return (
        <Row className="pianoRollTimeBar" style={{ width: 30 * props.bits * 16 + 'px' }}>
            <div className="pianoRollTimeBarContent">
                {beats}
                <svg
                    className="timePointer"
                    style={{ left: props.sixteenthNotePlaying * 30 - props.scroll - props.beatStart * 30 * 16 + 'px' }}
                >
                    <polygon points="2,2 10,8 18,2"></polygon>
                </svg>
            </div>
        </Row>
    );
};

export default PianoRollTimeBar;
