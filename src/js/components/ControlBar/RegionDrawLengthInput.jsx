import React from 'react';
import { FormControl } from 'react-bootstrap';

const RegionDrawLengthInput = (props) => {
    const _handleChange = (e) => {
        const newValue = Number(e.target.value);
        if (Number.isInteger(newValue)) {
            props.onTempRegionDrawLengthChange(newValue);
        }
    }
    const _handleKeyPress = (e) => {
        const keyCode = e.keyCode || e.which;
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