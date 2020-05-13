import React from 'react';
import { Button, Glyphicon } from 'react-bootstrap';

const OptionKeyLeft = (props) => {
    return (
        <div className="optionKey left">
            <div className="shiftKeyDiv">
                <Button
                    className="shiftKeyDiv"
                    bsSize="lg"
                    bsStyle="link"
                    onClick={() => {
                        props.onChangeKeyboardRange(-1);
                    }}
                >
                    <Glyphicon glyph="chevron-left" />
                </Button>
            </div>
            <div className="shiftKeyDiv">
                <Button
                    className="shiftKeyDiv"
                    bsSize="lg"
                    bsStyle="link"
                    onClick={() => {
                        props.onChangeKeyboardRange(-12);
                    }}
                >
                    <Glyphicon glyph="chevron-left" />
                    <Glyphicon glyph="chevron-left" />
                </Button>
            </div>
        </div>
    );
};

export default OptionKeyLeft;
