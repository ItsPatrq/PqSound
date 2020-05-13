import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const FileUploadModal = (props) => {
    return (
        <Modal
            backdrop="static"
            show={props.showModal}
            bsSize="large"
            onHide={() => props.modalVisibilitySwitch()}
            dialogClassName="instrumentModal"
        >
            <Modal.Header closeButton>
                <Modal.Title>About</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>
                    PqSound is an online DAW application. It allows you to play virtual instruments live and to create
                    your own compositions
                </p>
                <br />
                <div>
                    Icons for pencil and rubber tools made by{' '}
                    <a href="http://www.freepik.com" title="Freepik">
                        Freepik
                    </a>{' '}
                    from{' '}
                    <a href="https://www.flaticon.com/" title="Flaticon">
                        www.flaticon.com
                    </a>{' '}
                    are licensed by{' '}
                    <a
                        href="http://creativecommons.org/licenses/by/3.0/"
                        title="Creative Commons BY 3.0"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        CC 3.0 BY
                    </a>
                </div>
                <div>
                    Icon for copy tool made by{' '}
                    <a href="https://www.flaticon.com/authors/dave-gandy" title="Dave Gandy">
                        Dave Gandy
                    </a>{' '}
                    from{' '}
                    <a href="https://www.flaticon.com/" title="Flaticon">
                        www.flaticon.com
                    </a>{' '}
                    is licensed by{' '}
                    <a
                        href="http://creativecommons.org/licenses/by/3.0/"
                        title="Creative Commons BY 3.0"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        CC 3.0 BY
                    </a>
                </div>
                <div>
                    Icons for sampler and AUX track made by{' '}
                    <a href="https://www.flaticon.com/authors/smashicons" title="Smashicons">
                        Smashicons
                    </a>{' '}
                    from{' '}
                    <a href="https://www.flaticon.com/" title="Flaticon">
                        www.flaticon.com
                    </a>{' '}
                    are licensed by{' '}
                    <a
                        href="http://creativecommons.org/licenses/by/3.0/"
                        title="Creative Commons BY 3.0"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        CC 3.0 BY
                    </a>
                </div>
                <div>
                    Icon for synthesizer track made by{' '}
                    <a href="https://www.flaticon.com/authors/dale-humphries" title="Dale Humphries">
                        Dale Humphries
                    </a>{' '}
                    from{' '}
                    <a href="https://www.flaticon.com/" title="Flaticon">
                        www.flaticon.com
                    </a>{' '}
                    is licensed by{' '}
                    <a
                        href="http://creativecommons.org/licenses/by/3.0/"
                        title="Creative Commons BY 3.0"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        CC 3.0 BY
                    </a>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={() => props.modalVisibilitySwitch()}>Close</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default FileUploadModal;
