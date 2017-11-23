import React from 'react';
import { FormControl } from 'react-bootstrap';

const BPMInput = (props) => {
    let _handleChange = (e) => {
        let newValue = Number(e.target.value);
        if (Number.isInteger(newValue)) {
            props.changeTempBPM(newValue);
        }
    }
    let _handleKeyPress = (e) => {
        var keyCode = e.keyCode || e.which;
        if (keyCode === 13 /* ENTER */) {
            props.changeBPM();
        }
    }

    return (
        <FormControl value={props.BPM} onChange={_handleChange} onKeyDown={_handleKeyPress} onBlur={props.changeBPM} />
    )
}
export default BPMInput;