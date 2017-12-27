import React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

const BarsInCompositionInput = (props) => {
    let _handleChange = (e) => {
        let newValue = Number(e.target.value);
        if (Number.isInteger(newValue)) {
            props.onTempBarsInCompositionChange(newValue);
        }
    }
    let _handleKeyPress = (e) => {
        var keyCode = e.keyCode || e.which;
        if (keyCode === 13 /* ENTER */) {
            props.onBarsInCompositionChange();
        }
    }
    console.log(props)
    return (
        <div className="formControlBarsInComposition">
            <OverlayTrigger placement="bottom" overlay={
                <Tooltip id={'tooltipTimeSignature'}>{'Bars in composition'}</Tooltip>
            } delayShow={500}>
                <div className="barsInCompositionDisplay">
                    <input
                        type="text"
                        className="barsInCompositionInput"
                        value={props.barsInComposition}
                        onChange={_handleChange}
                        onKeyDown={_handleKeyPress}
                        onBlur={props.onBarsInCompositionChange}
                    />
                </div>
            </OverlayTrigger>
            <div className="projectInfoBoxPropertyName">
                Total Bars
            </div>
        </div>
    )
}
export default BarsInCompositionInput;