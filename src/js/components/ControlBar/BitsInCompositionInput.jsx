import React from 'react';
import { FormControl } from 'react-bootstrap';

const BitsInCompositionInput = (props) => {
    let _handleChange = (e) => {
        let newValue = Number(e.target.value);
        if (Number.isInteger(newValue)) {
            props.onTempBitsInCompositionChange(newValue);
        }
    }
    let _handleKeyPress = (e) => {
        var keyCode = e.keyCode || e.which;
        if (keyCode === 13 /* ENTER */) {
            props.onBitsInCompositionChange();
        }
    }

    return (
        <FormControl value={props.bitsInComposition} onChange={_handleChange} onKeyDown={_handleKeyPress} onBlur={props.onBitsInCompositionChange} />
    )
}
export default BitsInCompositionInput;