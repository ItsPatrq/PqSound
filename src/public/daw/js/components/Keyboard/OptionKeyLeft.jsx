import * as React from 'react';
import { ChevronLeft } from 'components/Icons';

// One clean control per side = shift the visible range down one octave.
const OptionKeyLeft = (props) => {
    return (
        <button
            className="optionKey left optionKeyBtn"
            title="Octave down"
            onClick={() => props.onChangeKeyboardRange(-12)}
        >
            <ChevronLeft />
        </button>
    );
};

export default OptionKeyLeft;
