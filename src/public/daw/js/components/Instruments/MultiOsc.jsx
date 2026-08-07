import * as React from 'react';
import PqKnob from 'components/shared/PqKnob';
import { oscillatorTypes } from 'constants/Constants';

require('styles/Instruments/InstrumentEditor.css');

const MultiOsc = (props) => {
    const preset = props.instrument.preset;
    const handleChange = (patch) => {
        props.onPresetChange({ ...preset, ...patch });
    };
    return (
        <div className="pq-inst-body">
            <div className="pq-inst-sec">
                <div className="pq-inst-sec-head">
                    <span>WAVEFORM</span>
                </div>
                <div className="pq-seg">
                    {oscillatorTypes.map((type) => (
                        <button
                            key={type}
                            className={'pq-seg-btn' + (preset.oscilatorType === type ? ' is-active' : '')}
                            onClick={() => handleChange({ oscilatorType: type })}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            <div className="pq-inst-sec">
                <div className="pq-inst-sec-head">
                    <span>SOUND</span>
                </div>
                <div className="pq-knob-grid">
                    <PqKnob
                        label="VOICES"
                        value={preset.waveNumber}
                        min={1}
                        max={20}
                        step={1}
                        onChange={(v) => handleChange({ waveNumber: Number(v) })}
                    />
                    <PqKnob
                        label="DETUNE"
                        value={preset.detune}
                        min={0}
                        max={100}
                        step={1}
                        onChange={(v) => handleChange({ detune: Number(v) })}
                    />
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
export default MultiOsc;
