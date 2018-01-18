import React from 'react';
import { Modal, Button } from 'react-bootstrap';
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
        let modalHeader = 'Track: ' + props.trackName + ' Plugin: ' + props.plugin.name;
        let modalBody;
        switch (props.plugin.id) {
            case PluginsEnum.Equalizer.id: {
                modalBody = <EqualizerComponent
                    plugin={props.plugin}
                    onPresetChange={props.onPresetChange}
                />
                break;
            }
            case PluginsEnum.Compressor.id: {
                modalBody = <CompressorComponent
                    plugin={props.plugin}
                    onPresetChange={props.onPresetChange}
                />
                break;
            }
            case PluginsEnum.Distortion.id: {
                modalBody = <DistortionComponent
                    plugin={props.plugin}
                    onPresetChange={props.onPresetChange}
                />
                break;
            }
            case PluginsEnum.Delay.id: {
                modalBody = <DelayComponent
                    plugin={props.plugin}
                    onPresetChange={props.onPresetChange}
                />
                break;
            }
            case PluginsEnum.Reverb.id: {
                modalBody = <ReverbComponent
                    plugin={props.plugin}
                    onPresetChange={props.onPresetChange}
                />
                break;
            }
            case PluginsEnum.Chorus.id: {
                modalBody = <ChorusComponent
                    plugin={props.plugin}
                    onPresetChange={props.onPresetChange}
                />
                break;
            }
        }
        return (
            <Modal
                backdrop="static"
                show={props.showModal}
                bsSize="small"
                onHide={() => props.modalVisibilitySwitch()}
                dialogClassName="instrumentModal"
            >
                <Modal.Header closeButton>
                    <Modal.Title>{modalHeader}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {modalBody}
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={() => props.modalVisibilitySwitch()}>Close</Button>
                </Modal.Footer>
            </Modal>

        );
    } else {
        return null;
    }

}

export default InstrumentModal;