import React from 'react';
import {notesToDrawParser} from 'engine/CompositionParser';
const Bit = (props) => {
    let quarterNotes = new Array;
    let notesToDraw = notesToDrawParser(props.pianoRollNote);
    for (let i = 0; i < 4; i++) {
        let activeClassNames = new Array;
        for(let j = 0; j < 4; j++){
            if(!notesToDraw[props.bitNumber * 16 + i * 4 + j]){
                activeClassNames[j] = 'nopadding sixteenthNote';
            } else {
                activeClassNames[j] = notesToDraw[props.bitNumber * 16 + i * 4 + j] === 3 ? 'nopadding sixteenthNote active' :
                'nopadding sixteenthNote active noRightBorder'
            }
        }
        quarterNotes.push(
            <div className="nopadding quarterNote" key={i}>
                <div className={activeClassNames[0]}
                    onClick={() => props.onNoteClick(props.pianoRollNote, props.bitNumber * 16 + i * 4, notesToDraw)}></div>
                <div className={activeClassNames[1]}
                    onClick={() => props.onNoteClick(props.pianoRollNote, props.bitNumber * 16 + i * 4 + 1, notesToDraw)}></div>
                <div className={activeClassNames[2]}
                    onClick={() => props.onNoteClick(props.pianoRollNote, props.bitNumber * 16 + i * 4 + 2, notesToDraw)}></div>
                <div className={activeClassNames[3]}
                    onClick={() => props.onNoteClick(props.pianoRollNote, props.bitNumber * 16 + i * 4 + 3, notesToDraw)}></div>
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