import React from 'react';
import { Button, Glyphicon } from 'react-bootstrap';

const OptionKeyRight = (props) => {
    return (
        <div className="optionKey right" style={{ marginLeft: props.margin + 'px' }}>
            <div className="shiftKeyDiv">
                <Button
                    className="shiftKeyDiv"
                    bsSize="lg"
                    bsStyle="link"
                    onClick={() => {
                        props.onChangeKeyboardRange(1);
                    }}
                >
                    <Glyphicon glyph="chevron-right" />
                </Button>
            </div>
            <div className="shiftKeyDiv">
                <Button
                    className="shiftKeyDiv"
                    bsSize="lg"
                    bsStyle="link"
                    onClick={() => {
                        props.onChangeKeyboardRange(12);
                    }}
                >
                    <Glyphicon glyph="chevron-right" />
                    <Glyphicon glyph="chevron-right" />
                </Button>
            </div>
        </div>
    );
};

export default OptionKeyRight;
