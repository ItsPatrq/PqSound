import React from 'react';
import { MenuItem, DropdownButton } from 'react-bootstrap';
import SamplerPresets from 'constants/SamplerPresets';
import { Utils as SamplerPresetsUtils } from 'constants/SamplerPresets';

const Sampler = (props) => {
    let allPresets = new Array;
    for (let i = 0; i < SamplerPresets.length; i++) {
        let availablePresets = new Array;
        for (let j = 0; j < SamplerPresets[i].presets.length; j++) {
            availablePresets.push(
                <MenuItem
                    key={SamplerPresets[i].presets[j].id.toString()}
                    eventKey={SamplerPresets[i].presets[j].id.toString()}
                    onClick={() => {
                        let newPreset = SamplerPresetsUtils.getPresetById(SamplerPresets[i].presets[j].id);
                        newPreset.attack = props.instrument.preset.attack;
                        newPreset.decay = props.instrument.preset.decay;
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
    let handleChange = (newAttack, newDecay) => {
        props.onPresetChange({
            ...props.instrument.preset,
            attack: newAttack ? Number(newAttack) : props.instrument.preset.attack,
            decay: newDecay ? Number(newDecay) : props.instrument.preset.decay
        })
    }
    return (
        <div className="samplerContainer">
            <p>Preset: </p>
            <div className="samplerPresetInstrument">
                <DropdownButton id="preset-main-drop-down" bsStyle="default" className="drop-down" title={props.instrument.preset.name} >
                    {allPresets}
                </DropdownButton>
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
            <label>Decay: {props.instrument.preset.decay}</label>
                    <input type="range"
                        value={props.instrument.preset.decay}
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