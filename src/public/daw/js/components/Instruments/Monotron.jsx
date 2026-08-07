import * as React from 'react';
import PqKnob from 'components/shared/PqKnob';

require('styles/Instruments/InstrumentEditor.css');

// Log-scaled knob ranges (unchanged from the original canvas-knob version): the
// knob position is 0–100, mapped exponentially onto the real parameter range.
const PARAMS = {
    pitch: { min: 0.0, max: 2000.0, scale: 1.1 },
    rate: { min: 0.001, max: 900.0, scale: 1.1 },
    int: { min: 0.5, max: 350.0, scale: 1.05 },
    cutoff: { min: 0.001, max: 900.0, scale: 1.03 },
    peak: { min: 0.001, max: 1000.0, scale: 1.1 },
};

const MODS = ['standby', 'pitch', 'cutoff'];

// knob position (0–100) -> real parameter value
const toValue = (id, pos) => {
    const p = PARAMS[id];
    const ratio = Math.pow(p.scale, pos) / Math.pow(p.scale, 100);
    return ratio * (p.max - p.min) + p.min;
};

const Monotron = (props) => {
    const preset = props.instrument.preset;
    const change = (patch) => props.onPresetChange(patch);

    const onKnob = (id, rawPos) => {
        const pos = Number(rawPos);
        const value = toValue(id, pos);
        switch (id) {
            case 'pitch':
                change({ vco: { pitch: value, knobPitch: pos } });
                break;
            case 'rate':
                change({
                    lfo: { rate: value, knobRate: pos, int: preset.lfo.int, knobInt: preset.lfo.knobInt },
                });
                break;
            case 'int':
                change({
                    lfo: { int: value, knobInt: pos, rate: preset.lfo.rate, knobRate: preset.lfo.knobRate },
                });
                break;
            case 'cutoff':
                change({
                    vcf: { cutoff: value, knobCutoff: pos, peak: preset.vcf.peak, knobPeak: preset.vcf.knobPeak },
                });
                break;
            case 'peak':
                change({
                    vcf: { peak: value, knobPeak: pos, cutoff: preset.vcf.cutoff, knobCutoff: preset.vcf.knobCutoff },
                });
                break;
        }
    };

    return (
        <div className="pq-inst-body">
            <div className="pq-inst-sec">
                <div className="pq-inst-sec-head">
                    <span>MOD</span>
                </div>
                <div className="pq-seg">
                    {MODS.map((m) => (
                        <button
                            key={m}
                            className={'pq-seg-btn' + (preset.mod === m ? ' is-active' : '')}
                            onClick={() => change({ mod: m })}
                        >
                            {m}
                        </button>
                    ))}
                </div>
            </div>

            <div className="pq-inst-sec">
                <div className="pq-inst-sec-head">
                    <span>VCO · LFO · VCF</span>
                </div>
                <div className="pq-knob-grid">
                    <PqKnob
                        label="PITCH"
                        value={preset.vco.knobPitch}
                        min={0}
                        max={100}
                        step={1}
                        display={Math.round(preset.vco.knobPitch)}
                        onChange={(v) => onKnob('pitch', v)}
                    />
                    <PqKnob
                        label="RATE"
                        value={preset.lfo.knobRate}
                        min={0}
                        max={100}
                        step={1}
                        display={Math.round(preset.lfo.knobRate)}
                        onChange={(v) => onKnob('rate', v)}
                    />
                    <PqKnob
                        label="INT."
                        value={preset.lfo.knobInt}
                        min={0}
                        max={100}
                        step={1}
                        display={Math.round(preset.lfo.knobInt)}
                        onChange={(v) => onKnob('int', v)}
                    />
                    <PqKnob
                        label="CUTOFF"
                        value={preset.vcf.knobCutoff}
                        min={0}
                        max={100}
                        step={1}
                        display={Math.round(preset.vcf.knobCutoff)}
                        onChange={(v) => onKnob('cutoff', v)}
                    />
                    <PqKnob
                        label="PEAK"
                        value={preset.vcf.knobPeak}
                        min={0}
                        max={100}
                        step={1}
                        display={Math.round(preset.vcf.knobPeak)}
                        onChange={(v) => onKnob('peak', v)}
                    />
                </div>
            </div>
        </div>
    );
};

export default Monotron;
