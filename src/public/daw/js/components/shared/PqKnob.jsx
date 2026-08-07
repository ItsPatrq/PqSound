import * as React from 'react';

/**
 * PqKnob — the simplified donut knob from the design comp. A conic-gradient ring
 * (0–270° sweep, gap at the bottom) shows the value; a full-size, fully
 * transparent <input type="range"> overlays it so the user drags/clicks to
 * change the value (horizontal drag). Purely presentational — parents own the
 * value and the onChange payload. Styling lives in InstrumentEditor.css
 * (.pq-knob*). Replaces the old canvas Knob lib for the new editor UIs.
 */
const PqKnob = (props) => {
    const { label, value, min, max, step, display, onChange, disabled } = props;
    const span = max - min;
    const pct = span > 0 ? (value - min) / span : 0;
    const deg = Math.max(0, Math.min(1, pct)) * 270;
    return (
        <div className={'pq-knob' + (disabled ? ' is-disabled' : '')}>
            <div className="pq-knob-dial">
                <div className="pq-knob-ring" style={{ '--pq-knob-deg': deg + 'deg' }} />
                <span className="pq-knob-val">{display != null ? display : value}</span>
                <input
                    className="pq-knob-input"
                    type="range"
                    min={min}
                    max={max}
                    step={step != null ? step : 1}
                    value={value}
                    disabled={disabled}
                    onChange={(e) => onChange(e.target.value)}
                />
            </div>
            <span className="pq-knob-label">{label}</span>
        </div>
    );
};

export default PqKnob;
