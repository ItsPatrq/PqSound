import * as React from 'react';
import { connect } from 'react-redux';
import InstrumentInput from 'components/TrackDetails/InstrumentInput';
import PluginsList from 'components/TrackDetails/PluginsList';
import Output from 'components/TrackDetails/Output';
import Oscilloscope from 'components/TrackDetails/Oscilloscope';
import * as Actions from 'slices/trackDetailsSlice';
import {
    changeTrackVolume,
    changeTrackInstrument,
    changeTrackOutput,
    changeSoloState,
    changeMuteState,
    changeTrackPan,
    addNewPlugin,
    removePlugin,
    changePluginPreset,
    updateInstrumentPreset,
} from 'actions/trackListActions';
import { fetchSamplerInstrument } from 'actions/webAudioActions';
import * as Utils from 'engine/Utils';
import { TrackTypes, Instruments } from 'constants/Constants';
import AudioEngine from 'engine/AudioEngine';

class TrackDetails extends React.Component {
    constructor() {
        super();
        this.state = { tab: 'track' };
    }

    getTrackName(index) {
        if (!Utils.isNullOrUndefined(index)) {
            for (let i = 0; i < this.props.trackList.length; i++) {
                if (this.props.trackList[i].index === index) {
                    return this.props.trackList[i].name;
                }
            }
        }
    }

    getTrackInstrument(index) {
        for (let i = 0; i < this.props.trackList.length; i++) {
            if (this.props.trackList[i].index === index) {
                return this.props.trackList[i].instrument;
            }
        }
    }

    getTrackPreset(index) {
        for (let i = 0; i < this.props.trackList.length; i++) {
            if (this.props.trackList[i].index === index) {
                return this.props.trackList[i].instrument.preset;
            }
        }
    }

    instrumentModalVisibilitySwitch() {
        this.props.dispatch(Actions.instrumentModalVisibilitySwitch());
    }

    handleSamplerPresetChange(newPreset) {
        if (this.getTrackPreset(this.props.selected).id !== newPreset.id) {
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

    handleInstrumentChange(instrumentId) {
        if (instrumentId !== this.getTrackInstrument(this.props.selected).id) {
            this.props.dispatch(changeTrackInstrument(instrumentId, this.props.selected));
            // Open the details panel (idempotent) so the new instrument's editor shows;
            // must NOT toggle, or it fights the name-click toggle and desyncs.
            this.props.dispatch(Actions.instrumentModalVisibilitySwitch(true));
        }
    }

    onVolumeChange(index, newVolume) {
        let parsedNewVolume = parseInt(newVolume) / parseInt(100);
        if (!parsedNewVolume) {
            parsedNewVolume = 0.0001;
        }
        this.props.dispatch(changeTrackVolume(index, parsedNewVolume));
    }

    addInputsToArray(currTrack, usedAuxList) {
        for (let i = 0; i < currTrack.input.length; i++) {
            usedAuxList.push(currTrack.input[i]);
            this.addInputsToArray(Utils.getTrackByIndex(this.props.trackList, currTrack.input[i]), usedAuxList);
        }
    }

    getAvailableAuxTracks() {
        const auxTrackList = [];
        const currTrack = Utils.getTrackByIndex(this.props.trackList, this.props.selected);
        const usedAuxList = [];
        this.addInputsToArray(currTrack, usedAuxList);
        for (let i = 0; i < this.props.trackList.length; i++) {
            if (
                this.props.trackList[i].trackType === TrackTypes.aux &&
                this.props.trackList[i].index !== this.props.selected &&
                !usedAuxList.includes(this.props.trackList[i].index)
            ) {
                auxTrackList.push(this.props.trackList[i]);
            }
        }
        return auxTrackList;
    }

    getOutputName(trackIndex) {
        for (let i = 0; i < this.props.trackList.length; i++) {
            if (this.props.trackList[i].index === trackIndex) {
                return this.props.trackList[i].name;
            }
        }
    }

    handleOutputChange(outputIndex) {
        if (Utils.getTrackByIndex(this.props.trackList, this.props.selected).output !== outputIndex) {
            this.props.dispatch(changeTrackOutput(this.props.selected, outputIndex));
        }
    }

    handleSoloButtonClicked(index) {
        this.props.dispatch(changeSoloState(index));
    }

    handleMuteButtonClicked(index) {
        this.props.dispatch(changeMuteState(index));
    }

    getTypeNameByTrackId(trackId) {
        switch (Utils.getTrackByIndex(this.props.trackList, trackId).trackType) {
            case TrackTypes.virtualInstrument: {
                return 'Virtual Instrument';
            }
            case TrackTypes.aux: {
                return 'AUX';
            }
        }
    }

    handlePanChange(index, value) {
        if (value === 0) {
            value = 0.0000001;
        }
        this.props.dispatch(changeTrackPan(index, value));
    }

    handleAddPlugin(trackIndex, pluginId) {
        // `this.props` still holds the pre-dispatch chain here, so the new
        // plugin's index is the old length — reading it after the dispatch gave
        // `length - 1`, which opened the previous plugin (and -1, i.e. nothing,
        // for the first one added).
        const currTrack = Utils.getTrackByIndex(this.props.trackList, trackIndex);
        const addedPluginIndex = currTrack.pluginList.length;
        this.props.dispatch(addNewPlugin(trackIndex, pluginId));
        this.props.dispatch(Actions.pluginModalVisibilitySwitch(addedPluginIndex, trackIndex));
    }

    handleRemovePlugin(trackIndex, pluginIndex) {
        this.props.dispatch(removePlugin(trackIndex, pluginIndex));
    }

    handlePluginModalVisibilitySwitch(pluginIndex, trackIndex) {
        this.props.dispatch(Actions.pluginModalVisibilitySwitch(pluginIndex, trackIndex));
    }

    getSelectedPlugin() {
        if (
            !Utils.isNullOrUndefined(this.props.trackDetails.selectedPluginTrackIndex) &&
            !Utils.isNullOrUndefined(this.props.trackDetails.selectedPluginIndex)
        )
            return Utils.getTrackByIndex(this.props.trackList, this.props.trackDetails.selectedPluginTrackIndex)
                .pluginList[this.props.trackDetails.selectedPluginIndex];
    }

    handlePluginPresetChange(newPreset) {
        this.props.dispatch(
            changePluginPreset(
                this.props.trackDetails.selectedPluginTrackIndex,
                this.props.trackDetails.selectedPluginIndex,
                newPreset,
            ),
        );
    }

    handleInstrumentPresetChange(newPreset) {
        this.props.dispatch(updateInstrumentPreset(newPreset, this.props.selected));
    }

    // Live EQ band control. The engine Equalizer plugin exposes 3 linear gains
    // (lowFilterGain/midFilterGain/highFilterGain, 1.0 = unity). We dispatch a
    // partial preset — the reducer merges it and calls the plugin's updateNodes().
    handleEqChange(trackIndex, pluginIndex, gainKey, value) {
        const gain = parseInt(value) / 100;
        this.props.dispatch(changePluginPreset(trackIndex, pluginIndex, { [gainKey]: gain }));
    }

    render() {
        const isMaster = this.state.tab === 'master';
        const index = isMaster ? 0 : this.props.selected;
        const track = Utils.getTrackByIndex(this.props.trackList, index);
        const isInstrument = !isMaster && track.trackType === TrackTypes.virtualInstrument;

        const pan = Math.round(Utils.normalizePan(track.pan));
        const panLabel = Utils.panLabel(track.pan);

        const vol = track.volume;
        const db = Utils.volumeToDb(vol);

        // 5-band design strip, but the engine Equalizer is 3-band — only LOW/MID/HIGH
        // map to real gains; LO-MID/HI-MID stay disabled. Active only when the shown
        // track has an Equalizer plugin in its chain.
        const eqPlugin = track.pluginList.find((p) => p.name === 'Equalizer');
        const eqBands = [
            { label: 'LOW', key: 'lowFilterGain' },
            { label: 'LO-MID', key: null },
            { label: 'MID', key: 'midFilterGain' },
            { label: 'HI-MID', key: null },
            { label: 'HIGH', key: 'highFilterGain' },
        ];

        return (
            <div className="pq-channel">
                <div className="pq-ch-head">
                    <span className="pq-ch-eyebrow">CHANNEL</span>
                    <div className="pq-ch-tabs">
                        <button
                            className={'pq-ch-tab' + (isMaster ? '' : ' is-active')}
                            onClick={() => this.setState({ tab: 'track' })}
                        >
                            TRACK
                        </button>
                        <button
                            className={'pq-ch-tab' + (isMaster ? ' is-active' : '')}
                            onClick={() => this.setState({ tab: 'master' })}
                        >
                            MASTER
                        </button>
                    </div>
                </div>

                <div className="pq-ch-title">
                    <div className="pq-ch-name">{this.getTrackName(index)}</div>
                    {isInstrument ? (
                        <InstrumentInput
                            onEdit={this.instrumentModalVisibilitySwitch.bind(this)}
                            showModal={this.props.trackDetails.showInstrumentModal}
                            selectedTrack={track}
                            isLoading={
                                track.instrument.id === Instruments.Sampler.id &&
                                !!track.instrument.preset &&
                                this.props.samplerInstruments.some(
                                    (x) => x.id === track.instrument.preset.id && x.fetching,
                                )
                            }
                        />
                    ) : (
                        <div className="pq-ch-inst">{isMaster ? 'MASTER BUS' : 'AUX'}</div>
                    )}
                </div>

                <div className="pq-ch-section">
                    <div className="pq-ch-label">OSCILLOSCOPE</div>
                    <div className="pq-scope">
                        <Oscilloscope key={index} trackNode={AudioEngine.getTrackNode(track.id)} />
                    </div>
                </div>

                <div className="pq-ch-section">
                    <div className="pq-ch-label">EQUALIZER{eqPlugin ? '' : ' · no EQ in chain'}</div>
                    <div className="pq-eq">
                        {eqBands.map((b) => {
                            const active = !!eqPlugin && !!b.key;
                            const gain = active ? (eqPlugin.preset[b.key] ?? 1) : 1;
                            const db = active && gain > 0.0001 ? Math.round(20 * Math.log10(gain)) : null;
                            return (
                                <div className="pq-eq-band" key={b.label}>
                                    <span className="pq-eq-db">
                                        {db === null ? '' : db > 0 ? '+' + db : db} {active ? 'dB' : ''}
                                    </span>
                                    <input
                                        className="pq-eq-slider"
                                        type="range"
                                        min="0"
                                        max="200"
                                        value={Math.round(gain * 100)}
                                        orient="vertical"
                                        disabled={!active}
                                        onChange={
                                            active
                                                ? (e) =>
                                                      this.handleEqChange(index, eqPlugin.index, b.key, e.target.value)
                                                : undefined
                                        }
                                    />
                                    <span className="pq-eq-band-name">{b.label}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="pq-ch-section">
                    <div className="pq-ch-label">PLUGIN CHAIN</div>
                    <PluginsList
                        pluginList={track.pluginList}
                        onPluginAdd={this.handleAddPlugin.bind(this)}
                        trackIndex={index}
                        onPluginRemove={this.handleRemovePlugin.bind(this)}
                        onPluginModalVisibilitySwitch={this.handlePluginModalVisibilitySwitch.bind(this)}
                    />
                </div>

                {isInstrument && (
                    <div className="pq-ch-section">
                        <div className="pq-ch-label">OUTPUT</div>
                        <Output
                            auxTracks={this.getAvailableAuxTracks()}
                            dropDownTitle={this.getOutputName(track.output)}
                            onOutputChange={this.handleOutputChange.bind(this)}
                        />
                    </div>
                )}

                <div className="pq-ch-fader">
                    <div className="pq-ch-fader-row">
                        <span className="pq-ch-label">PAN</span>
                        <span className="pq-ch-val">{panLabel}</span>
                    </div>
                    <input
                        className="pq-h-slider"
                        type="range"
                        min="-100"
                        max="100"
                        value={pan}
                        onChange={(e) => this.handlePanChange(index, Number(e.target.value))}
                    />
                </div>

                <div className="pq-ch-fader">
                    <div className="pq-ch-fader-row">
                        <span className="pq-ch-label">VOLUME</span>
                        <span className="pq-ch-val">{db} dB</span>
                    </div>
                    <input
                        className="pq-h-slider"
                        type="range"
                        min="0"
                        max="200"
                        value={Math.round(vol * 100)}
                        onChange={(e) => this.onVolumeChange(index, e.target.value)}
                    />
                </div>
            </div>
        );
    }
}

//REDUX connection
const mapStateToProps = (state) => {
    return {
        trackList: state.tracks.trackList,
        selected: state.tracks.selected,
        trackDetails: state.trackDetails,
        samplerInstruments: state.webAudio.samplerInstrumentsSounds.map((value) => {
            return { name: value.name, loaded: value.loaded, id: value.id, fetching: value.fetching };
        }),
    };
};

export default connect(mapStateToProps)(TrackDetails);
