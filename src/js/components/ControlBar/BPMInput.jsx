import React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

const BPMInput = (props) => {
    const _handleChange = (e) => {
        const newValue = Number(e.target.value);
        if (Number.isInteger(newValue)) {
            props.changeTempBPM(newValue);
        }
    }
    const _handleKeyPress = (e) => {
        const keyCode = e.keyCode || e.which;
        if (keyCode === 13 /* ENTER */) {
            props.changeBPM();
        }
    }

    return (
        <div className="formControlBPM">
            <OverlayTrigger placement="bottom" overlay={
                <Tooltip id={'tooltipTimeSignature'}>{'Tempo'}</Tooltip>
            } delayShow={500}>
                <div className="bpmDisplay">
                    <input
                        className="bpmInput"
                        value={props.BPM}
                        type="text"
                        onChange={_handleChange}
                        onKeyDown={_handleKeyPress}
                        onBlur={() => {props.changeBPM(); props.onInputFocusSwitch();}}
                        onFocus={props.onInputFocusSwitch}
                    />
                </div>
            </OverlayTrigger>
            <div className="projectInfoBoxPropertyName">
                BPM
            </div>
        </div>
    )
}
export default BPMInput;