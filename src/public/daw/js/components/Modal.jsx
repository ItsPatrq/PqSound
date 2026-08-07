import * as React from 'react';

/**
 * Dependency-free replacement for react-bootstrap's `Modal`.
 *
 * Props:
 *   - show:            render when truthy
 *   - onHide:          called by the header ✕, the footer Close button, and ESC
 *   - title:           header text
 *   - size:            'sm' | 'lg' (maps to a max-width); default medium
 *   - dialogClassName: extra class on the dialog box (kept for existing CSS hooks)
 *   - footer:          optional node; when omitted a single Close button is rendered
 *   - children:        modal body
 *
 * Backdrop is static (a backdrop click does NOT close — matches the former
 * `backdrop="static"` on every call site). Styling lives in `styles/theme.css`
 * under `.pq-modal*`.
 */
class Modal extends React.Component {
    constructor(props) {
        super(props);
        this.onKeyDown = this.onKeyDown.bind(this);
    }
    componentDidMount() {
        document.addEventListener('keydown', this.onKeyDown);
    }
    componentWillUnmount() {
        document.removeEventListener('keydown', this.onKeyDown);
    }
    onKeyDown(e) {
        if (e.key === 'Escape' && this.props.show && this.props.onHide) this.props.onHide();
    }
    render() {
        const { show, onHide, title, size, dialogClassName, footer, children } = this.props;
        if (!show) return null;
        const sizeClass = size === 'sm' ? ' pq-modal-sm' : size === 'lg' ? ' pq-modal-lg' : '';
        return (
            <div className="pq-modal-backdrop">
                <div
                    className={'pq-modal-dialog' + sizeClass + (dialogClassName ? ' ' + dialogClassName : '')}
                    role="dialog"
                    aria-modal="true"
                >
                    <div className="pq-modal-header">
                        <span className="pq-modal-title">{title}</span>
                        <button type="button" className="pq-modal-close" aria-label="Close" onClick={onHide}>
                            ×
                        </button>
                    </div>
                    <div className="pq-modal-body">{children}</div>
                    <div className="pq-modal-footer">
                        {footer != null ? (
                            footer
                        ) : (
                            <button type="button" className="pq-button" onClick={onHide}>
                                Close
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }
}

export default Modal;
