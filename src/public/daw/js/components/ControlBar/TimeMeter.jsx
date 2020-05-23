import * as React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
const TimeMeter = (props) => {
    const getMin = () => {
        const minutes = Math.floor((props.currSixteenth * 0.25 * (60 / props.bpm)) / 60);
        if (minutes < 10) {
            return '0' + minutes;
        } else {
            return minutes.toString();
        }
    };

    const getSec = () => {
        const secounds = (props.currSixteenth * 0.25 * (60 / props.bpm)) % 60;
        if (secounds < 10) {
            return '0' + secounds;
        } else {
            return secounds.toString();
        }
    };

    const getCs = () => {
        const csecounds = (props.currSixteenth * 2.5 * (60 / props.bpm)) % 10;

        return csecounds.toString();
    };

    return (
        <OverlayTrigger
            placement="bottom"
            overlay={<Tooltip id={'tooltipTimeSignature'}>{'Playhead Position (SMPTE)'}</Tooltip>}
            delayShow={500}
        >
            <div className="clockWrap">
                <div className="clockTime">
                    <div className="clockNumber">{getMin()[0]}</div>
                    <div className="clockNumber">{getMin()[1]}</div>
                    <div className="projectInfoBoxPropertyName">Min</div>
                </div>
                <div className="clockTime">
                    <div className="clockNumber">{getSec()[0]}</div>
                    <div className="clockNumber">{getSec()[1]}</div>
                    <div className="projectInfoBoxPropertyName">Sec</div>
                </div>
                <div className="clockTimeCs">
                    <div className="clockNumber">{getCs()[0]}</div>
                    <div className="projectInfoBoxPropertyName">Cs</div>
                </div>
            </div>
        </OverlayTrigger>
    );
};
export default TimeMeter;
