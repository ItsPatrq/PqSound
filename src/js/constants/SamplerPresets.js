import * as AudioFiles from 'constants/AudioFiles';

export default [
    {
        name: 'Drums & Percussion',
        presets: [
            {
                name: 'Slingerland Kit',
                id: 1,
                content: AudioFiles.SlingerlandKit
            }
        ]
    },
    {
        name: 'Acoustic Pianos',
        presets: [
            {
                name: 'Classical Piano',
                id: 0,
                content: AudioFiles.ClassicalPiano
            }
        ]
    }
]