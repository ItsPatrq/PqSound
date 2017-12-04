'use strict';
let keys = ['C', 'Cs', 'D', 'Ds', 'E', 'F', 'Fs', 'G', 'Gs', 'A', 'As', 'B'];
let baseURL = 'http://localhost:3000/api/samplerinstrument/';

let classicalPianoURL = baseURL + 'ClassicalPiano/';
let ClassicalPiano = new Array;
for(let i = 0; i < keys.length; i++){
    ClassicalPiano.push({
        name: '2'+keys[i],
        url: classicalPianoURL + '2' + keys[i] + '.ogg'
    });
}
module.exports.ClassicalPiano = ClassicalPiano;

let DSKGrandPianoURL = baseURL + 'DSKGrandPiano/DSK_Grand_';
let DSKGrandPiano = new Array;
for(let i = 0; i < 8; i++)
for(let j = 0; j < keys.length; j++){
    DSKGrandPiano.push({
        name: keys[j] + i.toString(),
        url: DSKGrandPianoURL + keys[j] + i + '.wav'
    });
}
module.exports.DSKGrandPiano = DSKGrandPiano;

let slingerlandKitURL = baseURL + 'SlingerlandKit/';
module.exports.SlingerlandKit = [
    {
        name: 'Ludwig-Snare-A',
        url: slingerlandKitURL + 'Ludwig-Snare-A.wav'
    },
    {
        name: 'Ludwig-Snare-B',
        url: slingerlandKitURL + 'Ludwig-Snare-A.wav'
    },
    {
        name: 'Ludwig-Snare-C',
        url: slingerlandKitURL + 'Ludwig-Snare-C.wav'
    },
    {
        name: 'Ludwig-Snare-D',
        url: slingerlandKitURL + 'Ludwig-Snare-D.wav'
    },
    {
        name: 'Slingerland-Kit-FloorTom-A',
        url: slingerlandKitURL + 'Slingerland-Kit-FloorTom-A.wav'
    },
    {
        name: 'Slingerland-Kit-FloorTom-B',
        url: slingerlandKitURL + 'Slingerland-Kit-FloorTom-B.wav'
    },
    {
        name: 'Slingerland-Kit-Kick-A',
        url: slingerlandKitURL + 'Slingerland-Kit-Kick-A.wav'
    },
    {
        name: 'Slingerland-Kit-Kick-B',
        url: slingerlandKitURL + 'Slingerland-Kit-Kick-B.wav'
    },
    {
        name: 'Slingerland-Kit-RackTom-A',
        url: slingerlandKitURL + 'Slingerland-Kit-RackTom-A.wav'
    },
    {
        name: 'Slingerland-Kit-RackTom-B',
        url: slingerlandKitURL + 'Slingerland-Kit-RackTom-B.wav'
    },
    {
        name: 'Slingerland-Kit-Sabian-Crash-Left-A',
        url: slingerlandKitURL + 'Slingerland-Kit-Sabian-Crash-Left-A.wav'
    },
    {
        name: 'Slingerland-Kit-Sabian-Crash-Left-B',
        url: slingerlandKitURL + 'Slingerland-Kit-Sabian-Crash-Left-B.wav'
    },
    {
        name: 'Slingerland-Kit-Sabian-Crash-Right-A',
        url: slingerlandKitURL + 'Slingerland-Kit-Sabian-Crash-Right-A.wav'
    },
    {
        name: 'Slingerland-Kit-Sabian-Crash-Right-B',
        url: slingerlandKitURL + 'Slingerland-Kit-Sabian-Crash-Right-B.wav'
    },
    {
        name: 'Slingerland-Kit-Sabian-Ride-A',
        url: slingerlandKitURL + 'Slingerland-Kit-Sabian-Ride-A.wav'
    },
    {
        name: 'Slingerland-Kit-Sabian-Ride-B',
        url: slingerlandKitURL + 'Slingerland-Kit-Sabian-Ride-B.wav'
    },
    {
        name: 'Slingerland-Kit-SabianHHX-HiHat-Closed-A',
        url: slingerlandKitURL + 'Slingerland-Kit-SabianHHX-HiHat-Closed-A.wav'
    },
    {
        name: 'Slingerland-Kit-SabianHHX-HiHat-Closed-B',
        url: slingerlandKitURL + 'Slingerland-Kit-SabianHHX-HiHat-Closed-B.wav'
    },
    {
        name: 'Slingerland-Kit-SabianHHX-HiHat-Closed-C',
        url: slingerlandKitURL + 'Slingerland-Kit-SabianHHX-HiHat-Closed-C.wav'
    },
    {
        name: 'Slingerland-Kit-SabianHHX-HiHat-Closed-D',
        url: slingerlandKitURL + 'Slingerland-Kit-SabianHHX-HiHat-Closed-D.wav'
    },
    {
        name: 'Slingerland-Kit-SabianHHX-HiHat-Open-A',
        url: slingerlandKitURL + 'Slingerland-Kit-SabianHHX-HiHat-Open-A.wav'
    },
    {
        name: 'Slingerland-Kit-SabianHHX-HiHat-OpenClose-A',
        url: slingerlandKitURL + 'Slingerland-Kit-SabianHHX-HiHat-OpenClose-A.wav'
    },
    {
        name: 'Slingerland-Kit-SabianHHX-HiHat-OpenClose-B',
        url: slingerlandKitURL + 'Slingerland-Kit-SabianHHX-HiHat-OpenClose-B.wav'
    }
]