import * as React from 'react';

/** Tracks-panel header — "TRACKS · N" with solo-all + add, per the design comp. */
const TrackListButtons = (props) => {
    return (
        <div className="trackListButtons pq-tracks-head">
            <span className="pq-mono pq-tracks-title">TRACKS · {props.trackCount}</span>
            <div style={{ display: 'flex', gap: 6 }}>
                <button
                    className={'pq-btn pq-tracks-btn' + (props.isAnySolo ? ' is-active' : '')}
                    onClick={props.onSoloAllClicked}
                    title="Solo selected / clear solo"
                >
                    S
                </button>
                <button className="pq-btn pq-tracks-btn" onClick={props.onAddNewTrack} title="Add track">
                    +
                </button>
            </div>
        </div>
    );
};

export default TrackListButtons;
