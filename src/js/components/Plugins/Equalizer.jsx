import React from 'react';
import { MenuItem, DropdownButton } from 'react-bootstrap';
import SamplerPresets from 'constants/SamplerPresets';

require('styles/Equalizer.css');

const EqualizerComponent = (props) => {
    let handleChange = (newLow, newMid, newHigh) => {
        props.onPresetChange({
            lowFilterGain: newLow ? Number(newLow) : props.plugin.preset.lowFilterGain,
            midFilterGain: newMid ? Number(newMid) : props.plugin.preset.midFilterGain,
            highFilterGain: newHigh ? Number(newHigh) : props.plugin.preset.highFilterGain
        })
    }
    return (
        <div>
            <div className="equalizerModal">
                <div className="gainControl">
                    <label>Low Gain: {props.plugin.preset.lowFilterGain}</label>
                    <input
                        type="range"
                        value={props.plugin.preset.lowFilterGain}
                        step="0.01"
                        min="0"
                        max="2"
                        onChange={(event) => handleChange(event.target.value, null, null)}
                    />
                </div>
                <div className="gainControl">
                    <label>Mid Gain: {props.plugin.preset.midFilterGain}</label>
                    <input type="range"
                        value={props.plugin.preset.midFilterGain}
                        step="0.01"
                        min="0"
                        max="2"
                        onChange={(event) => handleChange(null, event.target.value, null)}
                    />
                </div>
                <div className="gainControl">
                    <label>High Gain: {props.plugin.preset.highFilterGain}</label>
                    <input
                        type="range"
                        value={props.plugin.preset.highFilterGain}
                        step="0.01"
                        min="0"
                        max="2"
                        onChange={(event) => handleChange(null, null, event.target.value)}
                    />
                </div>
            </div>

        </div>
    );
}
export default EqualizerComponent;