import React from 'react';

require('styles/Plugins/Chorus.css');

const Chorus = (props) => {
    const handleChange = (newFeedback, newDelay, newDepth, newRate, newDry, newWet) => {
        props.onPresetChange({
            feedback: newFeedback ? Number(newFeedback) : props.plugin.preset.feedback,
            delay: newDelay ? Number(newDelay) : props.plugin.preset.delay,
            depth: newDepth ? Number(newDepth) : props.plugin.preset.depth,
            rate: newRate ? Number(newRate) : props.plugin.preset.rate,
            dry: newDry ? Number(newDry) : props.plugin.preset.dry,
            wet: newWet ? Number(newWet) : props.plugin.preset.wet,
        });
    };
    return (
        <div>
            <div className="compressorModal">
                <div className="compressorControlRow">
                    <label>Feedback: {props.plugin.preset.feedback}</label>
                    <input
                        type="range"
                        value={props.plugin.preset.feedback}
                        step="0.001"
                        min="0"
                        max="1"
                        onChange={(event) => handleChange(event.target.value)}
                    />
                </div>
                <div className="compressorControlRow">
                    <label>Delay: {props.plugin.preset.delay}</label>
                    <input
                        type="range"
                        value={props.plugin.preset.delay}
                        step="0.005"
                        min="0.005"
                        max="0.1"
                        onChange={(event) => handleChange(null, event.target.value)}
                    />
                </div>
                <div className="compressorControlRow">
                    <label>Depth: {props.plugin.preset.depth}</label>
                    <input
                        type="range"
                        value={props.plugin.preset.depth}
                        step="0.0005"
                        min="0.0005"
                        max="0.004"
                        onChange={(event) => handleChange(null, null, event.target.value)}
                    />
                </div>
                <div className="compressorControlRow">
                    <label>Rate: {props.plugin.preset.rate}</label>
                    <input
                        type="range"
                        value={props.plugin.preset.rate}
                        step="0.25"
                        min="0.5"
                        max="15"
                        onChange={(event) => handleChange(null, null, null, event.target.value)}
                    />
                </div>
                <div className="compressorControlRow">
                    <label>Dry signal: {props.plugin.preset.dry}</label>
                    <input
                        type="range"
                        value={props.plugin.preset.dry}
                        step="0.001"
                        min="0"
                        max="1"
                        onChange={(event) => handleChange(null, null, null, null, event.target.value)}
                    />
                </div>
                <div className="compressorControlRow">
                    <label>Wet signal: {props.plugin.preset.wet}</label>
                    <input
                        type="range"
                        value={props.plugin.preset.wet}
                        step="0.001"
                        min="0"
                        max="1"
                        onChange={(event) => handleChange(null, null, null, null, null, event.target.value)}
                    />
                </div>
            </div>
        </div>
    );
};
export default Chorus;
