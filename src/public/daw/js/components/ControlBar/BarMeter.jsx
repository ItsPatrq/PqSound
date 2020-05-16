import * as React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
const BarMeter = (props) => {
    const getSixteenth = () => {
        return props.currSixteenth % 4;
    };

    const getBeat = () => {
        return Math.floor(props.currSixteenth / 4) % 4;
    };

    const getBar = () => {
        const bars = Math.floor(props.currSixteenth / 16);
        if (bars < 10) {
            return '00' + bars;
        } else if (bars < 100) {
            return '0' + bars;
        } else {
            return bars.toString();
        }
    };

    return (
        <OverlayTrigger
            placement="bottom"
            overlay={<Tooltip id={'tooltipTimeSignature'}>{'Playhead Position (Bars)'}</Tooltip>}
            delayShow={500}
        >
            <div className="clockWrap">
                <div className="clockBars">
                    <div className="clockNumber">{getBar()[0]}</div>
                    <div className="clockNumber">{getBar()[1]}</div>
                    <div className="clockNumber">{getBar()[2]}</div>
                    <div className="projectInfoBoxPropertyName">Bar</div>
                </div>
                <div className="clockBeats">
                    <div className="clockNumber">{getBeat()}</div>
                    <div className="projectInfoBoxPropertyName">Beat</div>
                </div>
                <div className="clockSixteenth">
                    <div className="clockNumber">{getSixteenth()}</div>
                    <div className="projectInfoBoxPropertyName">Tick</div>
                </div>
            </div>
        </OverlayTrigger>
    );
};
export default BarMeter;
