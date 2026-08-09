import * as React from 'react';
import { connect } from 'react-redux';
import { X } from 'components/Icons';
import EqualizerComponent from 'components/Plugins/Equalizer';
import CompressorComponent from 'components/Plugins/Compressor';
import DistortionComponent from 'components/Plugins/Distortion';
import DelayComponent from 'components/Plugins/Delay';
import ReverbComponent from 'components/Plugins/Reverb';
import ChorusComponent from 'components/Plugins/Chorus';
import * as Actions from 'slices/trackDetailsSlice';
import { changePluginPreset } from 'actions/trackListActions';
import * as Utils from 'engine/Utils';
import { PluginsEnum } from 'constants/Constants';

/**
 * Stage 9 — inline FX editor column (functional relocation of PluginModal). Gated
 * by the same `trackDetails.showPluginModal` flag a chain-row click already sets
 * (with selectedPlugin{TrackIndex,Index}). Renders as a grid column in .pq-body
 * (see Layout.css `:has(.pq-fx-col)`). The plugin "browser" is the existing
 * "Add new plugin" dropdown in the channel's PLUGIN CHAIN.
 */
class FxPanel extends React.Component {
    close() {
        this.props.dispatch(Actions.pluginModalVisibilitySwitch());
    }

    getSelectedPlugin() {
        if (
            !Utils.isNullOrUndefined(this.props.selectedPluginTrackIndex) &&
            !Utils.isNullOrUndefined(this.props.selectedPluginIndex)
        ) {
            return Utils.getTrackByIndex(this.props.trackList, this.props.selectedPluginTrackIndex).pluginList[
                this.props.selectedPluginIndex
            ];
        }
    }

    handlePresetChange(newPreset) {
        this.props.dispatch(
            changePluginPreset(this.props.selectedPluginTrackIndex, this.props.selectedPluginIndex, newPreset),
        );
    }

    getEditorBody(plugin) {
        const onPresetChange = this.handlePresetChange.bind(this);
        switch (plugin.id) {
            case PluginsEnum.Equalizer:
                return <EqualizerComponent plugin={plugin} onPresetChange={onPresetChange} />;
            case PluginsEnum.Compressor:
                return <CompressorComponent plugin={plugin} onPresetChange={onPresetChange} />;
            case PluginsEnum.Distortion:
                return <DistortionComponent plugin={plugin} onPresetChange={onPresetChange} />;
            case PluginsEnum.Delay:
                return <DelayComponent plugin={plugin} onPresetChange={onPresetChange} />;
            case PluginsEnum.Reverb:
                return <ReverbComponent plugin={plugin} onPresetChange={onPresetChange} />;
            case PluginsEnum.Chorus:
                return <ChorusComponent plugin={plugin} onPresetChange={onPresetChange} />;
            default:
                return null;
        }
    }

    getTrackName() {
        const track = Utils.getTrackByIndex(this.props.trackList, this.props.selectedPluginTrackIndex);
        return track ? track.name : '';
    }

    render() {
        if (!this.props.show) {
            return null;
        }
        const plugin = this.getSelectedPlugin();
        if (!plugin) {
            return null;
        }
        return (
            <div className="pq-fx-col">
                <div className="pq-inst-head">
                    <span className="pq-ch-eyebrow">EFFECT</span>
                    <button className="pq-inst-close" onClick={this.close.bind(this)} title="Close">
                        <X />
                    </button>
                </div>
                <div className="pq-inst-title">
                    <div className="pq-ch-name">{plugin.name}</div>
                    <div className="pq-ch-inst">{this.getTrackName()}</div>
                </div>
                <div className="pq-inst-editor">{this.getEditorBody(plugin)}</div>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        trackList: state.tracks.trackList,
        show: state.trackDetails.showPluginModal,
        selectedPluginTrackIndex: state.trackDetails.selectedPluginTrackIndex,
        selectedPluginIndex: state.trackDetails.selectedPluginIndex,
    };
};

export default connect(mapStateToProps)(FxPanel);
