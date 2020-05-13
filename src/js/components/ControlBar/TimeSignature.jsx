import React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

const TimeSignature = () => {
    return (
        <div className="formControlTimeSignature">
            <OverlayTrigger
                placement="bottom"
                overlay={<Tooltip id={'tooltipTimeSignature'}>{'Time Signature'}</Tooltip>}
                delayShow={500}
            >
                <div className="timeSignatureDisplay">4/4</div>
            </OverlayTrigger>

            <div className="projectInfoBoxPropertyName">Time</div>
        </div>
    );
};
export default TimeSignature;
