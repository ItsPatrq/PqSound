import React from 'react';
import { FormControl } from 'react-bootstrap';

const RegionDrawLengthInput = (props) => {
    let _handleChange = (e) => {
        let newValue = Number(e.target.value);
        if (Number.isInteger(newValue)) {
            props.onTempRegionDrawLengthChange(newValue);
        }
    }
    let _handleKeyPress = (e) => {
        var keyCode = e.keyCode || e.which;
        if (keyCode === 13 /* ENTER */) {
            props.onRegionDrawLengthChange();
        }
    }
    if (props.isVisible) {
        return (
            <div className="regionDrawLengthInput">
                <FormControl value={props.regionDrawLength} onChange={_handleChange} onKeyDown={_handleKeyPress} onBlur={props.onRegionDrawLengthChange} />
            </div>
        )
    } else {
        return null;
    }
}
export default RegionDrawLengthInput;