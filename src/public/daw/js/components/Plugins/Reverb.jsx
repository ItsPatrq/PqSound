import * as React from 'react';

require('styles/Plugins/Reverb.css');

const Reverb = (props) => {
    const handleChange = (newSustain, newDecay, newReverse, newWet, newDry) => {
        props.onPresetChange({
            sustain: newSustain ? Number(newSustain) : props.plugin.preset.sustain,
            decay: newDecay ? Number(newDecay) : props.plugin.preset.decay,
            reverse: newReverse ? Number(newReverse) : props.plugin.preset.reverse,
            wet: newWet ? Number(newWet) : props.plugin.preset.wet,
            dry: newDry ? Number(newDry) : props.plugin.preset.dry,
        });
    };
    return (
        <div>
            <div className="reverbModal">
                <div className="reverbControlRow">
                    <label>Sustain: {props.plugin.preset.sustain}</label>
                    <input
                        type="range"
                        value={props.plugin.preset.sustain}
                        step="0.02"
                        min="0"
                        max="10"
                        onChange={(event) => handleChange(event.target.value)}
                    />
                </div>
                <div className="reverbControlRow">
                    <label>Decay: {props.plugin.preset.decay}</label>
                    <input
                        type="range"
                        value={props.plugin.preset.decay}
                        step="0.02"
                        min="0"
                        max="10"
                        onChange={(event) => handleChange(null, event.target.value)}
                    />
                </div>
                <div className="reverbControlRow">
                    <label>Reverse: {props.plugin.preset.reverse}</label>
                    <input
                        type="range"
                        value={props.plugin.preset.reverse}
                        step="1"
                        min="0"
                        max="1"
                        onChange={(event) => handleChange(null, null, event.target.value)}
                    />
                </div>
                <div className="reverbControlRow">
                    <label>Wet signal: {props.plugin.preset.wet}</label>
                    <input
                        type="range"
                        value={props.plugin.preset.wet}
                        step="0.01"
                        min="0"
                        max="2"
                        onChange={(event) => handleChange(null, null, null, event.target.value)}
                    />
                </div>
                <div className="reverbControlRow">
                    <label>Dry signal: {props.plugin.preset.dry}</label>
                    <input
                        type="range"
                        value={props.plugin.preset.dry}
                        step="0.01"
                        min="0"
                        max="2"
                        onChange={(event) => handleChange(null, null, null, null, event.target.value)}
                    />
                </div>
            </div>
        </div>
    );
};
export default Reverb;
