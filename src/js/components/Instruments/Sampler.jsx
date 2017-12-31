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
                    onClick={() => props.onPresetChange(
                        SamplerPresetsUtils.getPresetById(SamplerPresets[i].presets[j].id)
                    )
                    }
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
    return (
        <div className="samplerInstrument">
            <p>Preset: </p>
            <div className="instrumentInput">
                <DropdownButton id="preset-main-drop-down" bsStyle="default" className="drop-down" title={props.instrument.preset.name} >
                    {allPresets}
                </DropdownButton>
            </div>
        </div>
    );
}
export default Sampler;