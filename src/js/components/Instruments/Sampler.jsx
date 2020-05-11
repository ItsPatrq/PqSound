import React from 'react';
import { MenuItem, DropdownButton } from 'react-bootstrap';
import SamplerPresets from 'constants/SamplerPresets';
import { Utils as SamplerPresetsUtils } from 'constants/SamplerPresets';

require('styles/Instruments/Sampler.css');

const Sampler = (props) => {
    const allPresets = [];
    for (let i = 0; i < SamplerPresets.length; i++) {
        const availablePresets = [];
        for (let j = 0; j < SamplerPresets[i].presets.length; j++) {
            availablePresets.push(
                <MenuItem
                    key={SamplerPresets[i].presets[j].id.toString()}
                    eventKey={SamplerPresets[i].presets[j].id.toString()}
                    onClick={() => {
                        const newPreset = SamplerPresetsUtils.getPresetById(SamplerPresets[i].presets[j].id);
                        newPreset.attack = props.instrument.preset.attack;
                        newPreset.release = props.instrument.preset.release;
                        props.onPresetChange(newPreset);
                    }}
                >
                    {SamplerPresets[i].presets[j].name}
                </MenuItem>
            )
        }
        allPresets.push(
            <DropdownButton id={'preset-drop-down-' + i} key={i} bsStyle="default" className="drop-down" title={SamplerPresets[i].name} >
                {availablePresets}
            </DropdownButton>
        )
    }
    const handleChange = (newAttack, newRelease) => {
        props.onPresetChange({
            ...props.instrument.preset,
            attack: newAttack ? Number(newAttack) : props.instrument.preset.attack,
            release: newRelease ? Number(newRelease) : props.instrument.preset.release
        })
    }
    return (
        <div className="samplerContainer">
            <div className="samplerPresetInstrument">
            <div className="brandName">
                SAMPLER
            </div>
            <div className="presetName">
            <p>Selected preset: {props.instrument.preset.name}</p>
            </div>
                {allPresets}
            </div>
            <div className="samplerSliderContainer">
            <label>Attack: {props.instrument.preset.attack}</label>
                    <input type="range"
                        value={props.instrument.preset.attack}
                        step="0.02"
                        min="0"
                        max="4"
                        onChange={(event) => handleChange(event.target.value)}
                    />
            </div>
            <div className="samplerSliderContainer">
            <label>Release: {props.instrument.preset.release}</label>
                    <input type="range"
                        value={props.instrument.preset.release}
                        step="0.02"
                        min="0"
                        max="4"
                        onChange={(event) => handleChange(null, event.target.value)}
                    />
            </div>
        </div>
    );
}
export default Sampler;