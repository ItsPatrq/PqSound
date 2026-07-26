import * as React from 'react';
import { Button } from 'react-bootstrap';
import { ChevronRight } from 'react-bootstrap-icons';

const OptionKeyRight = (props) => {
    return (
        <div className="optionKey right" style={{ marginLeft: props.margin + 'px' }}>
            <div className="shiftKeyDiv">
                <Button
                    className="shiftKeyDiv"
                    size="lg"
                    variant="link"
                    onClick={() => {
                        props.onChangeKeyboardRange(1);
                    }}
                >
                    <ChevronRight />
                </Button>
            </div>
            <div className="shiftKeyDiv">
                <Button
                    className="shiftKeyDiv"
                    size="lg"
                    variant="link"
                    onClick={() => {
                        props.onChangeKeyboardRange(12);
                    }}
                >
                    <ChevronRight />
                    <ChevronRight />
                </Button>
            </div>
        </div>
    );
};

export default OptionKeyRight;
