import * as React from 'react';
import Modal from 'components/Modal';
import EqualizerComponent from 'components/Plugins/Equalizer';
import CompressorComponent from 'components/Plugins/Compressor';
import DistortionComponent from 'components/Plugins/Distortion';
import DelayComponent from 'components/Plugins/Delay';
import ReverbComponent from 'components/Plugins/Reverb';
import ChorusComponent from 'components/Plugins/Chorus';
import { isNullOrUndefined } from 'engine/Utils';
import { PluginsEnum } from 'constants/Constants';

const InstrumentModal = (props) => {
    if (!isNullOrUndefined(props.trackName) && !isNullOrUndefined(props.plugin)) {
        const modalHeader = 'Track: ' + props.trackName + ' Plugin: ' + props.plugin.name;
        let modalBody;
        switch (props.plugin.id) {
            case PluginsEnum.Equalizer: {
                modalBody = <EqualizerComponent plugin={props.plugin} onPresetChange={props.onPresetChange} />;
                break;
            }
            case PluginsEnum.Compressor: {
                modalBody = <CompressorComponent plugin={props.plugin} onPresetChange={props.onPresetChange} />;
                break;
            }
            case PluginsEnum.Distortion: {
                modalBody = <DistortionComponent plugin={props.plugin} onPresetChange={props.onPresetChange} />;
                break;
            }
            case PluginsEnum.Delay: {
                modalBody = <DelayComponent plugin={props.plugin} onPresetChange={props.onPresetChange} />;
                break;
            }
            case PluginsEnum.Reverb: {
                modalBody = <ReverbComponent plugin={props.plugin} onPresetChange={props.onPresetChange} />;
                break;
            }
            case PluginsEnum.Chorus: {
                modalBody = <ChorusComponent plugin={props.plugin} onPresetChange={props.onPresetChange} />;
                break;
            }
        }
        return (
            <Modal
                show={props.showModal}
                size="sm"
                title={modalHeader}
                onHide={() => props.modalVisibilitySwitch()}
                dialogClassName="instrumentModal"
            >
                {modalBody}
            </Modal>
        );
    } else {
        return null;
    }
};

export default InstrumentModal;
