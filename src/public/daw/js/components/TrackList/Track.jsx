import * as React from 'react';
import { TrackTypes } from 'constants/Constants';

/**
 * Track lane header — re-skinned to the PqSound.dc.html design.
 * Wired to real track state: select (row), solo/mute/record chips, inline
 * rename, reorder, remove. Row height stays 65px to align with the timeline
 * grid lanes (CompositionGrid) until that panel is re-skinned too.
 * All static styling lives in styles/TrackList.css; only the volume-bar width
 * (data-driven) stays inline.
 */
const instrumentLabel = (t) => {
    if (t.trackType === TrackTypes.aux) return 'AUX · BUS';
    if (t.trackType === TrackTypes.audio) return 'AUDIO';
    const name = t.instrument && t.instrument.name ? t.instrument.name : 'instrument';
    return name.toUpperCase();
};

const Track = (props) => {
    const t = props.trackDetails;
    const selected = props.selected === t.index;
    const stop = (fn) => (e) => {
        e.stopPropagation();
        fn();
    };

    const chip = (label, on, kind, onClick) => (
        <span
            className={'pq-track-chip' + (kind === 'R' ? ' is-rec' : '') + (on ? ' is-active' : '')}
            onClick={stop(onClick)}
            title={label}
        >
            {label}
        </span>
    );

    const vol = Math.max(0, Math.min(100, (t.volume || 0) * 100));

    return (
        <div
            className={'pq-track-lane' + (selected ? ' is-selected' : '')}
            onClick={() => props.handleRowClicked(t.index)}
        >
            <div className="pq-track-main">
                <input
                    className="pq-track-name"
                    value={t.name}
                    onChange={(e) => props.handleTrackNameChange(e, t.index)}
                    onFocus={props.onInputFocusSwitch}
                    onBlur={props.onInputFocusSwitch}
                    onClick={(e) => e.stopPropagation()}
                />
                <div className="pq-track-meta pq-mono">{instrumentLabel(t)}</div>
                <div className="pq-track-vol">
                    <div className="pq-track-vol-fill" style={{ width: vol + '%' }} />
                </div>
            </div>

            <div className="pq-track-chips">
                {chip('S', t.solo, 'S', () => props.onSoloButtonClicked(t.index))}
                {chip('M', t.mute, 'M', () => props.onMuteButtonClicked(t.index))}
                {t.trackType !== TrackTypes.aux && chip('R', t.record, 'R', () => props.onRecordButtonClicked(t.index))}
            </div>

            <div className="pq-track-reorder">
                {t.index > 1 ? (
                    <span className="pq-lane-icon" onClick={stop(() => props.onIndexDown(t.index))} title="Move up">
                        ▲
                    </span>
                ) : (
                    <span className="pq-lane-icon is-empty">▲</span>
                )}
                {t.index + 1 < props.trackListLength ? (
                    <span className="pq-lane-icon" onClick={stop(() => props.onIndexUp(t.index))} title="Move down">
                        ▼
                    </span>
                ) : (
                    <span className="pq-lane-icon is-empty">▼</span>
                )}
                <span className="pq-lane-icon" onClick={stop(() => props.handleRemove(t.index))} title="Remove track">
                    ×
                </span>
            </div>
        </div>
    );
};

export default Track;
