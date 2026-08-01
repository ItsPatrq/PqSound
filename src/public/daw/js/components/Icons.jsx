import * as React from 'react';

/**
 * Inline SVG icons replacing the former `react-bootstrap-icons` dependency.
 * Paths are the Bootstrap Icons originals (x, chevron-left, chevron-right) so
 * the glyphs are visually identical. Icons inherit color via `currentColor`
 * and size to `1em` by default; pass `size` to override.
 */
const svgProps = (size) => ({
    xmlns: 'http://www.w3.org/2000/svg',
    width: size,
    height: size,
    viewBox: '0 0 16 16',
    fill: 'currentColor',
});

export const X = ({ size = '1em' }) => (
    <svg {...svgProps(size)}>
        <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
    </svg>
);

export const ChevronLeft = ({ size = '1em' }) => (
    <svg {...svgProps(size)}>
        <path
            fillRule="evenodd"
            d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0"
        />
    </svg>
);

export const ChevronRight = ({ size = '1em' }) => (
    <svg {...svgProps(size)}>
        <path
            fillRule="evenodd"
            d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708"
        />
    </svg>
);
