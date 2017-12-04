import React from 'react';

const VolumeSlider = (props) => {
    return (
        <div className="volumeSliderDiv">
            <p>Volume: {props.volume}</p>
            <input
                className="volumeSlider"
                type="range" orient="vertical"
                min={0} max={100} value={props.volume * 100}
                onChange={(event) => props.onVolumeChange(props.trackIndex, event.target.value)}
            />
        </div>
    );
}

export default VolumeSlider;