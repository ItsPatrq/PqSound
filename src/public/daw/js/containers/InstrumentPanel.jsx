import * as React from 'react';
import { connect } from 'react-redux';
import Dropdown from 'components/Dropdown';
import { X } from 'components/Icons';
import SamplerComponent from 'components/Instruments/Sampler';
import MonotronComponent from 'components/Instruments/Monotron';
import MultiOscComponent from 'components/Instruments/MultiOsc';
import PqSynthComponent from 'components/Instruments/PqSynth';
import * as Actions from 'slices/trackDetailsSlice';
import { changeTrackInstrument, updateInstrumentPreset } from 'actions/trackListActions';
import { fetchSamplerInstrument } from 'actions/webAudioActions';
import * as Utils from 'engine/Utils';
import { Instruments } from 'constants/Constants';

/**
 * Stage 7 — inline instrument browser + editor column (functional relocation of
 * the old InstrumentModal). Gated by the same `trackDetails.showInstrumentModal`
 * flag the channel's instrument-name click already toggles; renders as a grid
 * column in .pq-body (see Layout.jsx / Layout.css `:has(.pq-instrument-col)`).
 * The per-instrument editor bodies are the existing, already-wired components.
 */
class InstrumentPanel extends React.Component {
    close() {
        this.props.dispatch(Actions.instrumentModalVisibilitySwitch(false));
    }

    getSelectedTrack() {
        return Utils.getTrackByIndex(this.props.trackList, this.props.selected);
    }

    handleInstrumentChange(instrumentId) {
        if (instrumentId !== this.getSelectedTrack().instrument.id) {
            this.props.dispatch(changeTrackInstrument(instrumentId, this.props.selected));
        }
    }

    handleSamplerPresetChange(newPreset) {
        if (this.getSelectedTrack().instrument.preset.id !== newPreset.id) {
            for (let i = 0; i < this.props.samplerInstruments.length; i++) {
                if (this.props.samplerInstruments[i].id === newPreset.id) {
                    if (!this.props.samplerInstruments[i].loaded && !this.props.samplerInstruments[i].fetching) {
                        this.props.dispatch(fetchSamplerInstrument(newPreset.id));
                    }
                    break;
                }
            }
        }
        this.props.dispatch(updateInstrumentPreset(newPreset, this.props.selected));
    }

    handleInstrumentPresetChange(newPreset) {
        this.props.dispatch(updateInstrumentPreset(newPreset, this.props.selected));
    }

    getEditorBody(track) {
        switch (track.instrument.id) {
            case Instruments.Sampler.id:
                return (
                    <SamplerComponent
                        instrument={track.instrument}
                        onPresetChange={this.handleSamplerPresetChange.bind(this)}
                    />
                );
            case Instruments.Monotron.id:
                return (
                    <MonotronComponent
                        instrument={track.instrument}
                        trackIndex={track.index}
                        onPresetChange={this.handleInstrumentPresetChange.bind(this)}
                    />
                );
            case Instruments.MultiOsc.id:
                return (
                    <MultiOscComponent
                        instrument={track.instrument}
                        trackIndex={track.index}
                        onPresetChange={this.handleInstrumentPresetChange.bind(this)}
                    />
                );
            case Instruments.PqSynth.id:
                return (
                    <PqSynthComponent
                        instrument={track.instrument}
                        trackIndex={track.index}
                        onPresetChange={this.handleInstrumentPresetChange.bind(this)}
                    />
                );
            default:
                return null;
        }
    }

    render() {
        if (!this.props.show) {
            return null;
        }
        const track = this.getSelectedTrack();
        // Aux and master tracks carry no instrument. TrackDetails gates the
        // "Edit instrument" button on trackType, but this panel stays mounted on
        // `show` and re-reads whichever track is *currently* selected — so
        // selecting an aux track with the editor open used to read `.id` off
        // null and take the whole tree down (#252).
        if (Utils.isNullOrUndefined(track) || Utils.isNullOrUndefined(track.instrument)) {
            return null;
        }
        const instrumentItems = [];
        for (const property in Instruments) {
            if (Instruments.hasOwnProperty(property)) {
                const id = Instruments[property].id;
                instrumentItems.push({
                    key: (id + 1).toString(),
                    label: Instruments[property].name,
                    active: id === track.instrument.id,
                    onClick: () => this.handleInstrumentChange(id),
                });
            }
        }
        return (
            <div className="pq-instrument-col">
                <div className="pq-inst-head">
                    <span className="pq-ch-eyebrow">INSTRUMENT</span>
                    <button className="pq-inst-close" onClick={this.close.bind(this)} title="Close">
                        <X />
                    </button>
                </div>
                <div className="pq-inst-title">
                    <div className="pq-ch-name">{track.name}</div>
                    <Dropdown title={track.instrument.name} items={instrumentItems} className="pq-inst-select" />
                </div>
                <div className="pq-inst-editor">{this.getEditorBody(track)}</div>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        trackList: state.tracks.trackList,
        selected: state.tracks.selected,
        show: state.trackDetails.showInstrumentModal,
        samplerInstruments: state.webAudio.samplerInstrumentsSounds.map((value) => {
            return { name: value.name, loaded: value.loaded, id: value.id, fetching: value.fetching };
        }),
    };
};

export default connect(mapStateToProps)(InstrumentPanel);
