import * as React from 'react';
import { keyboardWidths, defaultKeysNamesNoOctaveNumber, defaultKeysNames } from 'constants/Constants';
import { noteToMIDI } from 'engine/Utils';
import { isNullOrUndefined } from 'engine/Utils';

const PianoRollKeyboard = (props) => {
    // Note-name hint, formerly a react-bootstrap Tooltip — now a native title attribute.
    const noteName = (index) => props.instrument.getNoteName(index);
    const keys = [];
    for (let i = 87; i > 0; i--) {
        if (keyboardWidths[i].sharp) {
            keys.push(
                <div
                    key={i.toString()}
                    className="pianoRollKey sharp"
                    title={noteName(noteToMIDI(i))}
                    onMouseEnter={(event) => props.onDown(event, noteToMIDI(i))}
                    onMouseDown={(event) => props.onDown(event, noteToMIDI(i))}
                    onMouseLeave={(event) => props.onUp(event, noteToMIDI(i))}
                    onMouseUp={(event) => props.onUp(event, noteToMIDI(i))}
                />,
            );
        } else {
            if (['F', 'E', 'B', 'C'].includes(defaultKeysNamesNoOctaveNumber[i])) {
                keys.push(
                    <div
                        key={i.toString()}
                        className="pianoRollKey short"
                        title={noteName(noteToMIDI(i))}
                        onMouseEnter={(event) => props.onDown(event, noteToMIDI(i))}
                        onMouseDown={(event) => props.onDown(event, noteToMIDI(i))}
                        onMouseLeave={(event) => props.onUp(event, noteToMIDI(i))}
                        onMouseUp={(event) => props.onUp(event, noteToMIDI(i))}
                    >
                        {defaultKeysNamesNoOctaveNumber[i] === 'C' ? defaultKeysNames[i] : null}
                    </div>,
                );
            } else {
                keys.push(
                    <div
                        key={i.toString()}
                        className="pianoRollKey long"
                        title={noteName(noteToMIDI(i))}
                        onMouseEnter={(event) => props.onDown(event, noteToMIDI(i))}
                        onMouseDown={(event) => props.onDown(event, noteToMIDI(i))}
                        onMouseLeave={(event) => props.onUp(event, noteToMIDI(i))}
                        onMouseUp={(event) => props.onUp(event, noteToMIDI(i))}
                    />,
                );
            }
        }
    }
    keys.push(
        <div
            key="0"
            className="pianoRollKey"
            title={noteName(noteToMIDI(0))}
            style={{ height: 20 + 'px' }}
            onMouseEnter={(event) => props.onDown(event, noteToMIDI(0))}
            onMouseDown={(event) => props.onDown(event, noteToMIDI(0))}
            onMouseLeave={(event) => props.onUp(event, noteToMIDI(0))}
            onMouseUp={(event) => props.onUp(event, noteToMIDI(0))}
        />,
    );
    return (
        <div className="pianoRollKeyboard">
            <div
                className="pianoRollKeyboardContent"
                ref={(div) => {
                    if (!isNullOrUndefined(div)) {
                        div.style.marginTop = -props.scroll + 'px';
                    }
                }}
            >
                {keys}
            </div>
        </div>
    );
};

export default PianoRollKeyboard;
