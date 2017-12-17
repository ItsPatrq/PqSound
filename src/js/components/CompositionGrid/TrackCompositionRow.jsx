import React from 'react';
import { regionToDrawParser } from 'engine/CompositionParser';
import { getTrackByIndex } from 'engine/Utils';
import { TrackTypes } from 'constants/Constants';

const TrackCompositionRow = (props) => {
    let bits = new Array;
    let bitsToDraw = regionToDrawParser(props.trackIndex, props.bits);

    if (props.trackType === TrackTypes.aux) {
        return (
            <div className="auxTrackCompositionRow" >
            </div>
        );
    } else {
        for (let i = 0; i < props.bits; i++) {
            if (bitsToDraw[i] === 1 || bitsToDraw[i] === 2) {
                bits.push(<div className="trackCompositionBit nopadding region noRightBorder" key={i} onClick={() => props.onRegionClick(props.trackIndex, i)}></div>);
            } else if (bitsToDraw[i] === 3) {
                bits.push(<div className="trackCompositionBit nopadding region" key={i} onClick={() => props.onRegionClick(props.trackIndex, i)}></div>);
            } else {
                bits.push(<div className="trackCompositionBit nopadding" key={i} onClick={() => props.onEmptyBitClick(props.trackIndex, i, bitsToDraw)}></div>);
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