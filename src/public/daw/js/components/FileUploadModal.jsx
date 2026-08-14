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
            {/*
              react-dropzone's `accept` takes a MIME-type -> extensions map, not
              a string. `accept=".json"` was silently ignored — the file input
              rendered accept="" and offered every file type — on the installed
              version and on every version since. It is a .jsx file, so nothing
              typechecked it.
            */}
            <Dropzone accept={{ 'application/json': ['.json'] }} onDrop={props.onFileUpload}>
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
