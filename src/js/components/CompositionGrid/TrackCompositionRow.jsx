import React from 'react';

const TrackCompositionRow = (props) => {
    let bits = new Array;
    for(let i = 0; i < props.bits; i++){
        bits.push(<div className="trackCompositionBit nopadding" key={i} onClick={() => props.handleRegionClicked(props.trackIndex,i)}></div>);
    }
    return (
        <div className="trackCompositionRow" >
            {bits}
        </div>
    );
}

export default TrackCompositionRow;