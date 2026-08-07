import * as React from 'react';
import Modal from 'components/Modal';

const AboutModal = (props) => {
    return (
        <Modal
            show={props.showModal}
            size="lg"
            title="About"
            onHide={() => props.modalVisibilitySwitch()}
            dialogClassName="instrumentModal"
        >
            <div>
                <p>
                    PqSound is an online DAW application. It allows you to play virtual instruments live and to create
                    your own compositions.
                    <br />
                    <br />
                    Feel free to visit my{' '}
                    <a href="https://itsmeaga1n.github.io/" target="_blank" rel="noreferrer">
                        website
                    </a>{' '}
                    for more of my projects.
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
            </div>
        </Modal>
    );
};

export default AboutModal;
