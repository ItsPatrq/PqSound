import * as React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

const BarsInCompositionInput = (props) => {
    const _handleChange = (e) => {
        const newValue = Number(e.target.value);
        if (Number.isInteger(newValue)) {
            props.onTempBarsInCompositionChange(newValue);
        }
    };
    const _handleKeyPress = (e) => {
        const keyCode = e.keyCode || e.which;
        if (keyCode === 13 /* ENTER */) {
            props.onBarsInCompositionChange();
        }
    };
    return (
        <div className="formControlBarsInComposition">
            <OverlayTrigger
                placement="bottom"
                overlay={<Tooltip id={'tooltipTimeSignature'}>{'Bars in composition'}</Tooltip>}
                delayShow={500}
            >
                <div className="barsInCompositionDisplay">
                    <input
                        type="text"
                        className="barsInCompositionInput"
                        value={props.barsInComposition}
                        onChange={_handleChange}
                        onKeyDown={_handleKeyPress}
                        onBlur={() => {
                            props.onBarsInCompositionChange();
                            props.onInputFocusSwitch();
                        }}
                        onFocus={props.onInputFocusSwitch}
                    />
                </div>
            </OverlayTrigger>
            <div className="projectInfoBoxPropertyName">Total Bars</div>
        </div>
    );
};
export default BarsInCompositionInput;
