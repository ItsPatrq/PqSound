import React from 'react';
import Dropzone from 'react-dropzone'
import { Modal, Button } from 'react-bootstrap';
import EqualizerComponent from 'components/Plugins/Equalizer';
import CompressorComponent from 'components/Plugins/Compressor';
import DistortionComponent from 'components/Plugins/Distortion';
import { isNullOrUndefined } from 'engine/Utils';
import { PluginsEnum } from 'constants/Constants';

const FileUploadModal = (props) => {

    return (
        <Modal
            backdrop="static"
            show={props.showModal}
            bsSize="small"
            onHide={() => props.modalVisibilitySwitch()}
            dialogClassName="instrumentModal"
        >
            <Modal.Header closeButton>
                <Modal.Title>File Upload</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Dropzone
                    accept="application/json"
                    onDrop={props.onFileUpload} 
                >
                    <p>Drag or click to upload your exported composition</p>
                </Dropzone>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={() => props.modalVisibilitySwitch()}>Close</Button>
            </Modal.Footer>
        </Modal>

    );
}

export default FileUploadModal;