import React from 'react';
import { Row } from 'react-bootstrap';
import QuarterNote from './QuarterNote';
import * as Utils from 'engine/Pq.Utils';

const PianoRoll = (props) => {
    let keyRows = new Array;
    for (let i = 0; i < 88; i++) {
        let rowClassName;
        if (i % 2 === 0) {
            rowClassName = 'nopadding keyRow black'
        } else {
            rowClassName = 'nopadding keyRow white';
        }
        keyRows.push(
            <Row className={rowClassName} key={'pianRollKeyRow' + i}>
                <QuarterNote index={1} pianoRollKey={i} state={[]} />
            </Row>
        );
    }
    return (
        <div >
            {keyRows}
        </div>
    );
}

export default PianoRoll;