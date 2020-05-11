import React from 'react';
import { keyboardWidths, defaultKeysNamesNoOctaveNumber, defaultKeysNames } from 'constants/Constants';
import { noteToMIDI } from 'engine/Utils';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { isNullOrUndefined } from 'engine/Utils';


const PianoRollKeyboard = (props) => {
    const getTooltip = (index) => {
        return (
            <Tooltip id={'tooltip' + index}>{props.instrument.getNoteName(index)}</Tooltip>
        )
    }
    const keys = [];
    for (let i = 87; i > 0; i--) {
        if (keyboardWidths[i].sharp) {
            keys.push(
                <OverlayTrigger key={i.toString()} placement="right" overlay={getTooltip(noteToMIDI(i))} delayShow={500}>
                    <div
                        className="pianoRollKey sharp"
                        onMouseEnter={(event) => props.onDown(event, noteToMIDI(i))}
                        onMouseDown={(event) => props.onDown(event, noteToMIDI(i))}
                        onMouseLeave={(event) => props.onUp(event, noteToMIDI(i))}
                        onMouseUp={(event) => props.onUp(event, noteToMIDI(i))}
                    />
                </OverlayTrigger>
            );
        } else {
            if (['F', 'E', 'B', 'C'].includes(defaultKeysNamesNoOctaveNumber[i])) {
                keys.push(
                    <OverlayTrigger key={i.toString()} placement="right" overlay={getTooltip(noteToMIDI(i))} delayShow={500}>
                        <div
                            className="pianoRollKey short"
                            onMouseEnter={(event) => props.onDown(event, noteToMIDI(i))}
                            onMouseDown={(event) => props.onDown(event, noteToMIDI(i))}
                            onMouseLeave={(event) => props.onUp(event, noteToMIDI(i))}
                            onMouseUp={(event) => props.onUp(event, noteToMIDI(i))}
                        >{defaultKeysNamesNoOctaveNumber[i] === 'C' ? defaultKeysNames[i] : null}</div>
                    </OverlayTrigger>
                )
            } else {
                keys.push(
                    <OverlayTrigger key={i.toString()} placement="right" overlay={getTooltip(noteToMIDI(i))} delayShow={500}>
                        <div
                            className="pianoRollKey long"
                            onMouseEnter={(event) => props.onDown(event, noteToMIDI(i))}
                            onMouseDown={(event) => props.onDown(event, noteToMIDI(i))}
                            onMouseLeave={(event) => props.onUp(event, noteToMIDI(i))}
                            onMouseUp={(event) => props.onUp(event, noteToMIDI(i))}
                        />
                    </OverlayTrigger>
                )
            }
        }
    }
    keys.push(
        <OverlayTrigger key="0" placement="right" overlay={getTooltip(noteToMIDI(0))} delayShow={500}>
            <div
                className="pianoRollKey"
                style={{ height: 20 + 'px' }}
                onMouseEnter={(event) => props.onDown(event, noteToMIDI(0))}
                onMouseDown={(event) => props.onDown(event, noteToMIDI(0))}
                onMouseLeave={(event) => props.onUp(event, noteToMIDI(0))}
                onMouseUp={(event) => props.onUp(event, noteToMIDI(0))}
            />
        </OverlayTrigger>)
    return (
        <div className="pianoRollKeyboard" >
            <div
                className="pianoRollKeyboardContent"
                ref={(div) => { if (!isNullOrUndefined(div)) { div.style.marginTop = -props.scroll + 'px' } }}
            >
                {keys}
            </div>
        </div>
    );
}

export default PianoRollKeyboard;