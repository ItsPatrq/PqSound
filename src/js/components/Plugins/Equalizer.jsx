import React from 'react';

require('styles/Plugins/Equalizer.css');

const Equalizer = (props) => {
    const handleChange = (newLow, newMid, newHigh) => {
        props.onPresetChange({
            lowFilterGain: newLow ? Number(newLow) : props.plugin.preset.lowFilterGain,
            midFilterGain: newMid ? Number(newMid) : props.plugin.preset.midFilterGain,
            highFilterGain: newHigh ? Number(newHigh) : props.plugin.preset.highFilterGain,
        });
    };
    return (
        <div>
            <div className="equalizerModal">
                <div className="equalizerControlRow">
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
                <div className="equalizerControlRow">
                    <label>Mid Gain: {props.plugin.preset.midFilterGain}</label>
                    <input
                        type="range"
                        value={props.plugin.preset.midFilterGain}
                        step="0.01"
                        min="0"
                        max="2"
                        onChange={(event) => handleChange(null, event.target.value, null)}
                    />
                </div>
                <div className="equalizerControlRow">
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
};
export default Equalizer;
