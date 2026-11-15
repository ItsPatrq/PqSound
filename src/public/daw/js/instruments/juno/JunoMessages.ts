import { JunoPatch } from './JunoPatch';

/** Main thread → worklet. `time` is in AudioContext seconds. */
export type JunoMessage =
    | { type: 'patch'; patch: JunoPatch }
    | { type: 'noteOn'; note: number; time: number }
    | { type: 'noteOff'; note: number; time: number }
    | { type: 'allOff'; time: number };

export const JUNO_PROCESSOR = 'pq-juno';
/** Served by webpackCfg/worklet.ts under the app's publicPath; a test keeps the two in step. */
export const JUNO_WORKLET_URL = '/assets/juno-worklet.js';
