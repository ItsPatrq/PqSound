import React from 'react';
import { regionToDrawParser } from 'engine/CompositionParser';
import { TrackTypes } from 'constants/Constants';

const TrackCompositionRow = (props) => {
    const bits = [];
    const bitsToDraw = regionToDrawParser(props.trackIndex, props.bits, props.copiedRegion);

    if (props.trackType === TrackTypes.aux) {
        return (
            <div className="auxTrackCompositionRow" >
            </div>
        );
    } else {
        for (let i = 0; i < props.bits; i++) {
            if (bitsToDraw[i] === 1 || bitsToDraw[i] === 2) {
                bits.push(<div className="trackCompositionBit nopadding region noRightBorder" key={i} onClick={(e) => props.onRegionClick(e, props.trackIndex, i)}></div>);
            } else if (bitsToDraw[i] === 3) {
                bits.push(<div className="trackCompositionBit nopadding region" key={i} onClick={(e) => props.onRegionClick(e, props.trackIndex, i)}></div>);
            } else if (bitsToDraw[i] === 4 || bitsToDraw[i] === 5) {
                bits.push(<div className="trackCompositionBit nopadding region copied noRightBorder" key={i} onClick={(e) => props.onRegionClick(e, props.trackIndex, i)}></div>);
            } else if (bitsToDraw[i] === 6) {
                bits.push(<div className="trackCompositionBit nopadding region copied" key={i} onClick={(e) => props.onRegionClick(e, props.trackIndex, i)}></div>);
            } else {
                bits.push(<div className="trackCompositionBit nopadding" key={i} onClick={(e) => props.onEmptyBarClick(e, props.trackIndex, i, bitsToDraw)}></div>);
            }
        }
        return (
            <div className="trackCompositionRow" >
                {bits}
            </div>
        );
    }
}


export default TrackCompositionRow;