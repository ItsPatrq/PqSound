import React from 'react';

require('styles/Plugins/Distortion.css');

const Distortion = (props) => {
    const handleChange = (newOutputGain, newDistortion) => {
        props.onPresetChange({
            outputGain: newOutputGain ? Number(newOutputGain) : props.plugin.preset.outputGain,
            distortion: newDistortion ? Number(newDistortion) : props.plugin.preset.distortion
        })
    }
    return (
        <div>
            <div className="distortionModal">
                <div className="distortionControlRow">
                    <label>Distortion: {props.plugin.preset.distortion}</label>
                    <input type="range"
                        value={props.plugin.preset.distortion}
                        step="1"
                        min="0"
                        max="100"
                        onChange={(event) => handleChange(null, event.target.value)}
                    />
                </div>
                <div className="distortionControlRow">
                    <label>Output gain: {props.plugin.preset.outputGain}</label>
                    <input
                        type="range"
                        value={props.plugin.preset.outputGain}
                        step="0.01"
                        min="0"
                        max="2"
                        onChange={(event) => handleChange(event.target.value, null)}
                    />
                </div>
            </div>

        </div>
    );
}
export default Distortion;