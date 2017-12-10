import React from 'react';

const TimeBox = (props) => {
    //props.ms <---- milisekundy

    if (false) {
        return (
            <div className="regionDrawLengthInput">
                <FormControl value={props.regionDrawLength} onChange={_handleChange} onKeyDown={_handleKeyPress} onBlur={props.onRegionDrawLengthChange} />
            </div>
        )
    } else {
        return null;
    }
}
export default TimeBox;