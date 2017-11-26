import React from 'react';

const Bit = (props) => {
    let quarterNotes = new Array;
    for (let i = 0; i < 4; i++) {
        quarterNotes.push(
            <div className="nopadding quarterNote" key={i}>
                <div className="nopadding sixteenthNote"
                    onClick={() => props.onNoteClick(props.pianoRollNote, props.bitNumber * 16 + i * 4)}></div>
                <div className="nopadding sixteenthNote"
                    onClick={() => props.onNoteClick(props.pianoRollNote, props.bitNumber * 16 + i * 4 + 1)}></div>
                <div className="nopadding sixteenthNote"
                    onClick={() => props.onNoteClick(props.pianoRollNote, props.bitNumber * 16 + i * 4 + 2)}></div>
                <div className="nopadding sixteenthNote"
                    onClick={() => props.onNoteClick(props.pianoRollNote, props.bitNumber * 16 + i * 4 + 3)}></div>
            </div>
        )
    }
    return (
        <div className="nopadding bit">
            {quarterNotes}
        </div>
    )
}

export default Bit;