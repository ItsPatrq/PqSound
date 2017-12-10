import React from 'react';
import { Row } from 'react-bootstrap';
import Bit from './Bit';
import {keyNotes} from 'constants/Constants';

const PianoRoll = (props) => {
    let keyRows = new Array;
    for (let i = 87; i >= 0; i--) {
        let rowClassName;
        if (keyNotes[i]) {
            rowClassName = 'nopadding keyRow black'
        } else {
            rowClassName = 'nopadding keyRow white';
        }
        let bits = new Array;
        for (let j = 0; j < props.bitsNumber; j++){
            bits.push(<Bit key={j} pianoRollNote={i} bitNumber={j} onNoteClick={props.onNoteClick}/>);
        }
        keyRows.push(
            <Row className={rowClassName} key={'pianRollKeyRow' + i}>
                {bits}
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