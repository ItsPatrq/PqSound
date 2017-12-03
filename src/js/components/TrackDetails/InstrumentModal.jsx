import React from 'react';
import {Modal, Button} from 'react-bootstrap';
import SamplerComponent from 'components/Instruments/Sampler';

const InstrumentModal = (props) => {
    let modalHeader = 'Track name: ' + props.track.name + ', instrument: ' + props.track.instrument.name;
    let modalBody;
    switch (props.track.instrument.name) {
        case 'Sampler': {
          modalBody = <SamplerComponent
          instrument={props.track.instrument}
          onPresetChange={props.onSamplerPresetChange}
          />
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
          <Modal.Body>
            {modalBody}
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={() => props.modalVisibilitySwitch()}>Close</Button>
          </Modal.Footer>
        </Modal>
    );
}

export default InstrumentModal;