import React from 'react';
import { MenuItem, DropdownButton } from 'react-bootstrap';
import SamplerPresets from 'constants/SamplerPresets';

require('styles/Plugins/Compressor.css');

const Compressor = (props) => {
    let handleChange = (newThreshold, newKnee, newRatio, newAttack, newRelease) => {
        props.onPresetChange({
            threashold: newThreshold ? Number(newThreshold) : props.plugin.preset.threashold,
            knee: newKnee ? Number(newKnee) : props.plugin.preset.knee,
            ratio: newRatio ? Number(newRatio) : props.plugin.preset.ratio,
            attack: newAttack ? Number(newAttack) : props.plugin.preset.attack,
            release: newRelease ? Number(newRelease) : props.plugin.preset.release
        })
    }
    return (
        <div>
            <div className="compressorModal">
                <div className="compressorControlRow">
                    <label>Threashold: {props.plugin.preset.threashold}</label>
                    <input
                        type="range"
                        value={props.plugin.preset.threashold}
                        step="1"
                        min="-100"
                        max="0"
                        onChange={(event) => handleChange(event.target.value)}
                    />
                </div>
                <div className="compressorControlRow">
                    <label>Knee: {props.plugin.preset.knee}</label>
                    <input type="range"
                        value={props.plugin.preset.knee}
                        step="0.5"
                        min="0"
                        max="40"
                        onChange={(event) => handleChange(null, event.target.value)}
                    />
                </div>
                <div className="compressorControlRow">
                    <label>Ratio: {props.plugin.preset.ratio}</label>
                    <input
                        type="range"
                        value={props.plugin.preset.ratio}
                        step="0.25"
                        min="1"
                        max="20"
                        onChange={(event) => handleChange(null, null, event.target.value)}
                    />
                </div>
                <div className="compressorControlRow">
                    <label>Attack: {props.plugin.preset.attack}</label>
                    <input
                        type="range"
                        value={props.plugin.preset.attack}
                        step="0.01"
                        min="0"
                        max="1"
                        onChange={(event) => handleChange(null, null, null, event.target.value)}
                    />
                </div>
                <div className="compressorControlRow">
                    <label>Release: {props.plugin.preset.release}</label>
                    <input
                        type="range"
                        value={props.plugin.preset.release}
                        step="0.01"
                        min="0"
                        max="1"
                        onChange={(event) => handleChange(null, null, null, null,  event.target.value)}
                    />
                </div>
            </div>

        </div>
    );
}
export default Compressor;