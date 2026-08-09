/**
 * @jest-environment jsdom
 */
import { createElement } from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import store from '../store';
import Header from './Header';

/**
 * #253: Header registered its Alt-shortcut keydown listener in the
 * *constructor* — not componentDidMount — as an anonymous inline function, and
 * the class had no componentWillUnmount at all. React may construct an instance
 * it never mounts, and every construction added a permanent global listener
 * that could not be removed even deliberately, pinning the component and its
 * dispatch closure. Duplicates also mean one Alt+P dispatches the toggle N
 * times, which on even counts looks like the key doing nothing.
 *
 * JSX is avoided here because jest.config only matches `*.test.ts`.
 */
// React 19 requires this opt-in before act() will drive updates quietly.
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

describe('Header keyboard shortcuts', () => {
    const keydownListeners = () => addSpy.mock.calls.filter(([type]) => type === 'keydown').length;
    const keydownRemovals = () => removeSpy.mock.calls.filter(([type]) => type === 'keydown').length;

    let addSpy: jest.SpyInstance;
    let removeSpy: jest.SpyInstance;
    let container: HTMLDivElement;

    beforeEach(() => {
        addSpy = jest.spyOn(window, 'addEventListener');
        removeSpy = jest.spyOn(window, 'removeEventListener');
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    afterEach(() => {
        container.remove();
        jest.restoreAllMocks();
    });

    const mount = () => {
        const root = createRoot(container);
        act(() => {
            root.render(createElement(Provider as any, { store, children: createElement(Header as any) } as any));
        });
        return root;
    };

    it('removes its global listener on unmount', () => {
        const root = mount();
        const added = keydownListeners();
        expect(added).toBeGreaterThan(0);

        act(() => root.unmount());

        // Every listener it added is handed back. Registering in the
        // constructor made this impossible: the handler was anonymous.
        expect(keydownRemovals()).toBe(added);
    });

    it('does not accumulate listeners across mount/unmount cycles', () => {
        const first = mount();
        act(() => first.unmount());
        const afterOne = keydownListeners() - keydownRemovals();

        const second = mount();
        act(() => second.unmount());
        const afterTwo = keydownListeners() - keydownRemovals();

        expect(afterTwo).toBe(afterOne);
    });
});
