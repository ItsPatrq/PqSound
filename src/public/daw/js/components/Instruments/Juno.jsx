import * as React from 'react';
import PqKnob from 'components/shared/PqKnob';

require('styles/Instruments/InstrumentEditor.css');

/**
 * Juno-106 panel, laid out in the hardware's left-to-right order. Every slider
 * is the raw 0–127 value the hardware (and its SysEx) uses; the engine owns
 * the conversion to Hz and seconds. The store keeps the whole patch, so each
 * change sends the full patch merged with the edit.
 */

const Seg = ({ options, value, onChange }) => (
    <div className="pq-seg">
        {options.map(([v, label]) => (
            <button
                key={label}
                className={'pq-seg-btn' + (value === v ? ' is-active' : '')}
                onClick={() => onChange(v)}
            >
                {label}
            </button>
        ))}
    </div>
);

const Section = ({ title, children }) => (
    <div className="pq-inst-sec">
        <div className="pq-inst-sec-head">
            <span>{title}</span>
        </div>
        {children}
    </div>
);

const Juno = (props) => {
    const preset = props.instrument.preset;
    const change = (patch) => props.onPresetChange({ ...preset, ...patch });
    const slider = (key, label) => (
        <PqKnob
            key={key}
            label={label}
            value={preset[key]}
            min={0}
            max={127}
            step={1}
            onChange={(v) => change({ [key]: Number(v) })}
        />
    );

    return (
        <div className="pq-inst-body pq-juno">
            <Section title="LFO">
                <div className="pq-knob-grid">
                    {slider('lfoRate', 'RATE')}
                    {slider('lfoDelay', 'DELAY')}
                </div>
            </Section>

            <Section title="DCO">
                <Seg
                    options={[
                        [0, "16'"],
                        [1, "8'"],
                        [2, "4'"],
                    ]}
                    value={preset.octave}
                    onChange={(octave) => change({ octave })}
                />
                <div className="pq-knob-grid">
                    {slider('dcoLfo', 'LFO')}
                    {slider('dcoPwm', 'PWM')}
                    {slider('dcoSub', 'SUB')}
                    {slider('dcoNoise', 'NOISE')}
                </div>
                <Seg
                    options={[
                        [false, 'PWM LFO'],
                        [true, 'PWM MAN'],
                    ]}
                    value={preset.pwmManual}
                    onChange={(pwmManual) => change({ pwmManual })}
                />
                <Seg
                    options={[
                        [true, 'PULSE'],
                        [false, 'PULSE OFF'],
                    ]}
                    value={preset.pulse}
                    onChange={(pulse) => change({ pulse })}
                />
                <Seg
                    options={[
                        [true, 'SAW'],
                        [false, 'SAW OFF'],
                    ]}
                    value={preset.saw}
                    onChange={(saw) => change({ saw })}
                />
            </Section>

            <Section title="HPF">
                <Seg
                    options={[
                        [0, '0'],
                        [1, '1'],
                        [2, '2'],
                        [3, '3'],
                    ]}
                    value={preset.hpf}
                    onChange={(hpf) => change({ hpf })}
                />
            </Section>

            <Section title="VCF">
                <div className="pq-knob-grid">
                    {slider('vcfFreq', 'FREQ')}
                    {slider('vcfRes', 'RES')}
                    {slider('vcfEnv', 'ENV')}
                    {slider('vcfLfo', 'LFO')}
                    {slider('vcfKbd', 'KYBD')}
                </div>
                <Seg
                    options={[
                        [false, 'ENV +'],
                        [true, 'ENV −'],
                    ]}
                    value={preset.vcfEnvInvert}
                    onChange={(vcfEnvInvert) => change({ vcfEnvInvert })}
                />
            </Section>

            <Section title="VCA">
                <Seg
                    options={[
                        [false, 'ENV'],
                        [true, 'GATE'],
                    ]}
                    value={preset.vcaGate}
                    onChange={(vcaGate) => change({ vcaGate })}
                />
                <div className="pq-knob-grid">{slider('vcaLevel', 'LEVEL')}</div>
            </Section>

            <Section title="ENV">
                <div className="pq-knob-grid">
                    {slider('envA', 'A')}
                    {slider('envD', 'D')}
                    {slider('envS', 'S')}
                    {slider('envR', 'R')}
                </div>
            </Section>

            <Section title="CHORUS">
                <Seg
                    options={[
                        [0, 'OFF'],
                        [1, 'I'],
                        [2, 'II'],
                    ]}
                    value={preset.chorus}
                    onChange={(chorus) => change({ chorus })}
                />
            </Section>
        </div>
    );
};

export default Juno;
