// `show` optional: omit to toggle (the name-click), or pass true/false to set it
// explicitly (open on instrument-change, close on the panel's × button) so the two
// callers can't desync the panel's open state.
export function instrumentModalVisibilitySwitch(show) {
    return {
        type: 'INSTRUMENT_MODAL_VISIBILITY_SWITCH',
        payload: show,
    };
}

export function pluginModalVisibilitySwitch(newPluginIndex, newTrackIndex) {
    return {
        type: 'PLUGIN_MODAL_VISIBILITY_SWITCH',
        payload: {
            selectedPluginIndex: newPluginIndex,
            selectedPluginTrackIndex: newTrackIndex,
        },
    };
}
