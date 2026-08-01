import * as React from 'react';

/**
 * Instrument row in the CHANNEL panel: shows the current instrument name and an
 * Edit button. Edit is now the sole trigger for the instrument editor column
 * (InstrumentPanel) — instrument selection AND per-instrument tweaking both live
 * inside that editor. The old click-the-name toggle + inline type dropdown are
 * gone (they desynced the panel and split "select" from "edit").
 */
const InstrumentInput = (props) => {
    return (
        <div className="pq-ch-inst-row">
            <span className="pq-ch-inst">{props.selectedTrack.instrument.name}</span>
            {props.isLoading && <span className="pq-ch-inst-loading">loading samples…</span>}
            <button
                className={'pq-ch-edit' + (props.showModal ? ' is-active' : '')}
                onClick={() => props.onEdit()}
                title="Edit instrument"
            >
                Edit
            </button>
        </div>
    );
};

export default InstrumentInput;
