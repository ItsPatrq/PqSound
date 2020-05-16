import * as React from 'react';
import { Modal, Button } from 'react-bootstrap';
import SamplerComponent from 'components/Instruments/Sampler';
import MonotronComponent from 'components/Instruments/Monotron';
import MultiOscComponent from 'components/Instruments/MultiOsc';
import PqSynthComponent from 'components/Instruments/PqSynth';
import { Instruments } from 'constants/Constants';

const InstrumentModal = (props) => {
    const modalHeader = 'Track name: ' + props.track.name + ', instrument: ' + props.track.instrument.name;
    let modalBody;
    switch (props.track.instrument.id) {
        case Instruments.Sampler.id: {
            modalBody = (
                <SamplerComponent instrument={props.track.instrument} onPresetChange={props.onSamplerPresetChange} />
            );
            break;
        }
        case Instruments.Monotron.id: {
            modalBody = (
                <MonotronComponent
                    instrument={props.track.instrument}
                    trackIndex={props.track.index}
                    onPresetChange={props.onInstrumentPresetChange}
                />
            );
            break;
        }
        case Instruments.MultiOsc.id: {
            modalBody = (
                <MultiOscComponent
                    instrument={props.track.instrument}
                    trackIndex={props.track.index}
                    onPresetChange={props.onInstrumentPresetChange}
                />
            );
            break;
        }
        case Instruments.PqSynth.id: {
            modalBody = (
                <PqSynthComponent
                    instrument={props.track.instrument}
                    trackIndex={props.track.index}
                    onPresetChange={props.onInstrumentPresetChange}
                />
            );
            break;
        }
    }
    return (
        <Modal
            backdrop="static"
            show={props.showModal}
            bsSize="large"
            onHide={() => props.modalVisibilitySwitch()}
            dialogClassName="instrumentModal"
        >
            <Modal.Header closeButton>
                <Modal.Title>{modalHeader}</Modal.Title>
            </Modal.Header>
            <Modal.Body>{modalBody}</Modal.Body>
            <Modal.Footer>
                <Button onClick={() => props.modalVisibilitySwitch()}>Close</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default InstrumentModal;
