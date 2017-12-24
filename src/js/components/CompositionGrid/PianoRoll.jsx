import React from 'react';
import { Row } from 'react-bootstrap';
import { keyNotes, defaultKeysNames } from 'constants/Constants';
import { isNullOrUndefined } from 'engine/Utils';

const PianoRoll = (props) => {
    let keyRows = new Array;
    let handleRowClicked = (note, event) => {
        let el = event.target.className === 'note' ? event.target.parentElement : event.target;
        let sixteenth = Math.floor((event.clientX - el.getClientRects()[0].left) / 30);
        props.onNoteClick(note, sixteenth);
    }
    for (let i = 87; i >= 0; i--) {
        let rowClassName;
        let notes = new Array;
        if (keyNotes[i]) {
            rowClassName = 'nopadding keyRow black'
        } else {
            rowClassName = 'nopadding keyRow white';
        }
        if (!isNullOrUndefined(props.notes[i])) {
            for (let j = 0; j < props.notes[i].length; j++) {
                notes.push(
                    <div
                        key={'note'+i.toString()+j.toString()}
                        className="note"
                        style={{
                            width: props.notes[i][j].length * 30 + 'px',
                            left: props.notes[i][j].sixteenthNumber * 30 + 'px'
                        }}
                    >
                        {defaultKeysNames[i]}
                    </div>
                )
            }
        }
        keyRows.push(
            <Row
                className={rowClassName}
                key={'pianRollKeyRow' + i}
                onClick={(e) => handleRowClicked(i, e)}
                style={{ width: props.bitsNumber * 16 * 30 + 'px' }}
            >
                {notes}
            </Row>
        );
    }

    let onScroll = (event) => {
        props.onScroll({
            pianoRollY: event.target.scrollTop,
            pianoRollX: event.target.scrollLeft
        });
    }

    return (
        <div className="pianRollKeyRows" onScroll={onScroll} >
            <div className="pianoRollKeyRowsContent" onScroll={onScroll}>
                {keyRows}
            </div>
        </div>
    );
}
export default PianoRoll;