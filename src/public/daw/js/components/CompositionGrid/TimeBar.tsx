import * as React from 'react';

interface TimeBarProps {
    bits: number;
    scroll: number;
    changeCurrSixteenth(change: number): void;
    sixteenthNotePlaying: number;
}

export const TimeBar: React.FunctionComponent<TimeBarProps> = (props: TimeBarProps) => {
    const beats: JSX.Element[] = [];
    for (let i = 0; i <= props.bits; i++) {
        beats.push(
            <div
                className="timeBarBeat"
                style={{ left: i * 50 - props.scroll + 'px' }}
                key={i.toString()}
                onClick={(): void => props.changeCurrSixteenth(i * 16)}
            >
                {i}
            </div>,
        );
    }
    return (
        <div className="pq-inline-row timeBar" style={{ width: 50 * props.bits + 'px' }}>
            <div className="timeBarContent">
                {beats}
                <svg
                    className="timePointer"
                    style={{ left: (props.sixteenthNotePlaying * 50) / 16 - props.scroll + 'px' }}
                >
                    <polygon points="2,2 10,8 18,2"></polygon>
                </svg>
            </div>
        </div>
    );
};

export default TimeBar;
