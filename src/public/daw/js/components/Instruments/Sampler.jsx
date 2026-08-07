import * as React from 'react';
import Dropdown from 'components/Dropdown';
import PqKnob from 'components/shared/PqKnob';
import SamplerPresets from 'constants/SamplerPresets';
import { Utils as SamplerPresetsUtils } from 'constants/SamplerPresets';

require('styles/Instruments/InstrumentEditor.css');

const Sampler = (props) => {
    const preset = props.instrument.preset;
    const presetGroups = [];
    for (let i = 0; i < SamplerPresets.length; i++) {
        const availablePresets = [];
        for (let j = 0; j < SamplerPresets[i].presets.length; j++) {
            const presetId = SamplerPresets[i].presets[j].id;
            availablePresets.push({
                key: presetId.toString(),
                label: SamplerPresets[i].presets[j].name,
                onClick: () => {
                    const newPreset = SamplerPresetsUtils.getPresetById(presetId);
                    newPreset.attack = preset.attack;
                    newPreset.release = preset.release;
                    props.onPresetChange(newPreset);
                },
            });
        }
        presetGroups.push(
            <Dropdown
                id={'preset-drop-down-' + i}
                key={i}
                className="drop-down"
                title={SamplerPresets[i].name}
                items={availablePresets}
            />,
        );
    }
    const handleChange = (patch) => {
        props.onPresetChange({ ...preset, ...patch });
    };
    return (
        <div className="pq-inst-body">
            <div className="pq-inst-sec">
                <div className="pq-inst-sec-head">
                    <span>PRESET</span>
                </div>
                <div className="pq-inst-preset-row">
                    <div className="pq-inst-preset-name">{preset.name}</div>
                    <div className="pq-inst-preset-groups">{presetGroups}</div>
                </div>
            </div>

            <div className="pq-inst-sec">
                <div className="pq-inst-sec-head">
                    <span>ENVELOPE</span>
                </div>
                <div className="pq-knob-grid">
                    <PqKnob
                        label="ATTACK"
                        value={preset.attack}
                        min={0}
                        max={4}
                        step={0.02}
                        display={Number(preset.attack).toFixed(2)}
                        onChange={(v) => handleChange({ attack: Number(v) })}
                    />
                    <PqKnob
                        label="RELEASE"
                        value={preset.release}
                        min={0}
                        max={4}
                        step={0.02}
                        display={Number(preset.release).toFixed(2)}
                        onChange={(v) => handleChange({ release: Number(v) })}
                    />
                </div>
            </div>
        </div>
    );
};
export default Sampler;
