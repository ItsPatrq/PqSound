import * as React from 'react';
import PqKnob from 'components/shared/PqKnob';
import { oscillatorTypes } from 'constants/Constants';

require('styles/Instruments/InstrumentEditor.css');

const WAVES = [
    ...oscillatorTypes.map((w) => ({ key: w, label: w })),
    { key: 'whiteNoise', label: 'white' },
    { key: 'pinkNoise', label: 'pink' },
    { key: 'brownianNoise', label: 'brown' },
];
const OCTAVES = [-3, -2, -1, 0, 1, 2, 3];

const PqSynth = (props) => {
    const [oscIndex, setOscIndex] = React.useState(0);
    const preset = props.instrument.preset;
    const osc = preset.oscillators[oscIndex];

    const set = (param, value) => {
        const newPreset = JSON.parse(JSON.stringify(preset));
        newPreset.oscillators[oscIndex][param] = value;
        props.onPresetChange(newPreset);
    };

    return (
        <div className="pq-inst-body">
            <div className="pq-inst-sec">
                <div className="pq-inst-sec-head">
                    <span>OSCILLATOR</span>
                </div>
                <div className="pq-seg">
                    {preset.oscillators.map((o, i) => (
                        <button
                            key={i}
                            className={'pq-seg-btn' + (i === oscIndex ? ' is-active' : '')}
                            onClick={() => setOscIndex(i)}
                        >
                            {'Osc ' + (i + 1)}
                        </button>
                    ))}
                    <button
                        className={'pq-seg-btn' + (osc.active ? ' is-active' : '')}
                        onClick={() => set('active', !osc.active)}
                        title="Toggle oscillator"
                    >
                        {osc.active ? 'On' : 'Off'}
                    </button>
                </div>
            </div>

            <div className="pq-inst-sec">
                <div className="pq-inst-sec-head">
                    <span>WAVEFORM</span>
                </div>
                <div className="pq-seg">
                    {WAVES.map((w) => (
                        <button
                            key={w.key}
                            className={'pq-seg-btn' + (osc.waveForm === w.key ? ' is-active' : '')}
                            onClick={() => set('waveForm', w.key)}
                        >
                            {w.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="pq-inst-sec">
                <div className="pq-inst-sec-head">
                    <span>OCTAVE</span>
                </div>
                <div className="pq-seg">
                    {OCTAVES.map((o) => (
                        <button
                            key={o}
                            className={'pq-seg-btn' + ((osc.frequencyModOct || 0) === o ? ' is-active' : '')}
                            onClick={() => set('frequencyModOct', o)}
                        >
                            {o > 0 ? '+' + o : o}
                        </button>
                    ))}
                </div>
            </div>

            <div className="pq-inst-sec">
                <div className="pq-inst-sec-head">
                    <span>FREQUENCY MOD</span>
                </div>
                <div className="pq-seg">
                    <button
                        className={'pq-seg-btn' + (osc.frequencyModLfo ? ' is-active' : '')}
                        onClick={() => set('frequencyModLfo', !osc.frequencyModLfo)}
                    >
                        {osc.frequencyModLfo ? 'LFO On' : 'LFO Off'}
                    </button>
                </div>
                <div className="pq-knob-grid">
                    <PqKnob
                        label="SHIFT %"
                        value={osc.frequencyModPercent}
                        min={-100}
                        max={100}
                        step={0.01}
                        display={Math.round(osc.frequencyModPercent)}
                        onChange={(v) => set('frequencyModPercent', Number(v))}
                    />
                    <PqKnob
                        label="LFO HZ"
                        value={osc.frequencyModLfoHz}
                        min={0.1}
                        max={1000}
                        step={0.01}
                        display={Number(osc.frequencyModLfoHz).toFixed(1)}
                        disabled={!osc.frequencyModLfo}
                        onChange={(v) => set('frequencyModLfoHz', Number(v))}
                    />
                    <PqKnob
                        label="LFO WIDTH"
                        value={osc.frequencyModLfoWidth}
                        min={0.01}
                        max={1000}
                        step={0.01}
                        display={Number(osc.frequencyModLfoWidth).toFixed(1)}
                        disabled={!osc.frequencyModLfo}
                        onChange={(v) => set('frequencyModLfoWidth', Number(v))}
                    />
                </div>
            </div>

            <div className="pq-inst-sec">
                <div className="pq-inst-sec-head">
                    <span>AMPLITUDE MOD</span>
                </div>
                <div className="pq-seg">
                    <button
                        className={'pq-seg-btn' + (osc.amplitudeModLfo ? ' is-active' : '')}
                        onClick={() => set('amplitudeModLfo', !osc.amplitudeModLfo)}
                    >
                        {osc.amplitudeModLfo ? 'LFO On' : 'LFO Off'}
                    </button>
                </div>
                <div className="pq-knob-grid">
                    <PqKnob
                        label="SCALE %"
                        value={osc.amplitudeModPercent}
                        min={0}
                        max={100}
                        step={1}
                        display={Math.round(osc.amplitudeModPercent)}
                        onChange={(v) => set('amplitudeModPercent', Number(v))}
                    />
                    <PqKnob
                        label="LFO HZ"
                        value={osc.amplitudeModLfoHz}
                        min={0.1}
                        max={20}
                        step={0.01}
                        display={Number(osc.amplitudeModLfoHz).toFixed(1)}
                        disabled={!osc.amplitudeModLfo}
                        onChange={(v) => set('amplitudeModLfoHz', Number(v))}
                    />
                    <PqKnob
                        label="LFO WIDTH"
                        value={osc.amplitudeModLfoWidth}
                        min={0}
                        max={1}
                        step={0.01}
                        display={Number(osc.amplitudeModLfoWidth).toFixed(2)}
                        disabled={!osc.amplitudeModLfo}
                        onChange={(v) => set('amplitudeModLfoWidth', Number(v))}
                    />
                </div>
            </div>
        </div>
    );
};
export default PqSynth;
