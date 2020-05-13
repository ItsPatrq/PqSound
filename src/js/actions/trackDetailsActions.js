export function instrumentModalVisibilitySwitch() {
    return {
        type: 'INSTRUMENT_MODAL_VISIBILITY_SWITCH',
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
