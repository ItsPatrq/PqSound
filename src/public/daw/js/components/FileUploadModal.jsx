import * as React from 'react';
import Dropzone from 'react-dropzone';
import Modal from 'components/Modal';

const FileUploadModal = (props) => {
    return (
        <Modal
            show={props.showModal}
            size="sm"
            title="File Upload"
            onHide={() => props.modalVisibilitySwitch()}
            dialogClassName="instrumentModal"
        >
            <Dropzone accept=".json" onDrop={props.onFileUpload}>
                {({ getRootProps, getInputProps }) => {
                    return (
                        <div {...getRootProps()}>
                            <p>Drag or click to upload your exported composition</p>
                            <input {...getInputProps()} />
                        </div>
                    );
                }}
            </Dropzone>
        </Modal>
    );
};

export default FileUploadModal;
