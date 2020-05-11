import React from 'react';

require('styles/Plugins/Delay.css');

const Delay = (props) => {
    const handleChange = (newDelay, newFeedback, newIterations, newHighCut, newLowCut, newWet, newDry) => {
        props.onPresetChange({
            delay: newDelay ? Number(newDelay) : props.plugin.preset.delay,
            feedback: newFeedback ? Number(newFeedback) : props.plugin.preset.feedback,
            iterations: newIterations ? Number(newIterations) : props.plugin.preset.iterations,
            highCut: newHighCut ? Number(newHighCut) : props.plugin.preset.highCut,
            lowCut: newLowCut ? Number(newLowCut) : props.plugin.preset.lowCut,
            wet: newWet ? Number(newWet) : props.plugin.preset.wet,
            dry: newDry ? Number(newDry) : props.plugin.preset.dry
            
        })
    }
    return (
        <div>
            <div className="delayModal">
                <div className="delayControlRow">
                    <label>Delay: {props.plugin.preset.delay}</label>
                    <input type="range"
                        value={props.plugin.preset.delay}
                        step="0.02"
                        min="0"
                        max="1"
                        onChange={(event) => handleChange(event.target.value)}
                    />
                </div>
                <div className="delayControlRow">
                    <label>Feedback: {props.plugin.preset.feedback}</label>
                    <input type="range"
                        value={props.plugin.preset.feedback}
                        step="0.02"
                        min="0"
                        max="2"
                        onChange={(event) => handleChange(null, event.target.value)}
                    />
                </div>
                <div className="delayControlRow">
                    <label>Delays number: {props.plugin.preset.iterations}</label>
                    <input type="range"
                        value={props.plugin.preset.iterations}
                        step="1"
                        min="1"
                        max="50"
                        onChange={(event) => handleChange(null, null, event.target.value)}
                    />
                </div>
                <div className="delayControlRow">
                    <label>Highcut: {props.plugin.preset.highCut}</label>
                    <input type="range"
                        value={props.plugin.preset.highCut}
                        step="1"
                        min="0"
                        max="24000"
                        onChange={(event) => handleChange(null, null, null, event.target.value)}
                    />
                </div>
                <div className="delayControlRow">
                    <label>Lowcut: {props.plugin.preset.lowCut}</label>
                    <input type="range"
                        value={props.plugin.preset.lowCut}
                        step="1"
                        min="0"
                        max="24000"
                        onChange={(event) => handleChange(null, null, null, null, event.target.value)}
                    />
                </div>
                <div className="delayControlRow">
                    <label>Wet signal: {props.plugin.preset.wet}</label>
                    <input
                        type="range"
                        value={props.plugin.preset.wet}
                        step="0.01"
                        min="0"
                        max="1"
                        onChange={(event) => handleChange(null, null, null, null, null,  event.target.value)}
                    />
                </div>
                <div className="delayControlRow">
                    <label>Dry signal: {props.plugin.preset.dry}</label>
                    <input
                        type="range"
                        value={props.plugin.preset.dry}
                        step="0.01"
                        min="0"
                        max="1"
                        onChange={(event) => handleChange(null, null, null, null, null, null, event.target.value)}
                    />
                </div>
            </div>

        </div>
    );
}
export default Delay;