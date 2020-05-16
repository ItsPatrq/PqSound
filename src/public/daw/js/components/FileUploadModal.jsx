import * as React from 'react';
import Dropzone from 'react-dropzone';
import { Modal, Button } from 'react-bootstrap';

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
                <Dropzone accept=".json" onDrop={props.onFileUpload}>
                    <p>Drag or click to upload your exported composition</p>
                </Dropzone>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={() => props.modalVisibilitySwitch()}>Close</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default FileUploadModal;
