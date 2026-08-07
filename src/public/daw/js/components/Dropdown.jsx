import * as React from 'react';

/**
 * Dependency-free replacement for react-bootstrap's `DropdownButton` + `Dropdown.Item`.
 *
 * Props:
 *   - title:    node shown on the toggle button (the current selection / label)
 *   - items:    [{ key, label, onClick, active? }] menu entries
 *   - disabled: disables the toggle
 *   - className / menuClassName: extra classes forwarded to the wrapper / menu
 *   - id:       forwarded to the toggle button
 *
 * Opens on click, closes on item pick or an outside mousedown. Styling lives in
 * `styles/theme.css` under `.pq-dropdown*`.
 */
class Dropdown extends React.Component {
    constructor(props) {
        super(props);
        this.state = { open: false };
        this.ref = React.createRef();
        this.onDocMouseDown = this.onDocMouseDown.bind(this);
        this.toggle = this.toggle.bind(this);
    }

    componentDidMount() {
        document.addEventListener('mousedown', this.onDocMouseDown);
    }
    componentWillUnmount() {
        document.removeEventListener('mousedown', this.onDocMouseDown);
    }

    onDocMouseDown(e) {
        if (this.ref.current && !this.ref.current.contains(e.target)) {
            this.setState({ open: false });
        }
    }

    toggle() {
        if (this.props.disabled) return;
        this.setState((s) => ({ open: !s.open }));
    }

    pick(item) {
        this.setState({ open: false });
        if (item.onClick) item.onClick();
    }

    render() {
        const { title, items, disabled, className, menuClassName, id } = this.props;
        const { open } = this.state;
        return (
            <div className={'pq-dropdown' + (className ? ' ' + className : '')} ref={this.ref}>
                <button
                    type="button"
                    id={id}
                    className={'pq-dropdown-toggle' + (open ? ' is-open' : '')}
                    disabled={disabled}
                    onClick={this.toggle}
                >
                    {title !== '' && title != null && <span className="pq-dropdown-title">{title}</span>}
                    <span className="pq-dropdown-caret" aria-hidden="true" />
                </button>
                {open && (
                    <div className={'pq-dropdown-menu' + (menuClassName ? ' ' + menuClassName : '')} role="menu">
                        {items.map((it) => (
                            <button
                                type="button"
                                key={it.key}
                                role="menuitem"
                                className={'pq-dropdown-item' + (it.active ? ' is-active' : '')}
                                onClick={() => this.pick(it)}
                            >
                                {it.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        );
    }
}

export default Dropdown;
