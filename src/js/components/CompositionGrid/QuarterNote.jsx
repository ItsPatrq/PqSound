import React from 'react';
import { Col } from 'react-bootstrap';
import SixteenthNote from './SixteenthNote'
import * as Utils from 'engine/Pq.Utils';

const QuarterNote = (props) => {
    let quarterNote = new Array;
    for (let i = 0; i < 4; i++) {
        quarterNote.push(
            <Col xs={3} className="nopadding quarterNote" key={i}>
                <SixteenthNote
                    pianoRollKey={props.pianoRollKey} quarterIndex={i} />
            </Col>
        );

    }
    console.log(quarterNote);
    return (
        <div >
            {quarterNote}
        </div>
    );
}

export default QuarterNote;