'use strict';

let keys = ['C', 'Cs', 'D', 'Ds', 'E', 'F', 'Fs', 'G', 'Gs', 'A', 'As', 'B'];
let baseURL = 'http://localhost:3000/api/samplerinstrument/';

let DSKGrandPianoURL = baseURL + 'DSKGrandPiano/DSK_Grand_';
let DSKGrandPiano = [
    {
        name: 'DSKGrandPiano' + 'A' + 0,
        url: DSKGrandPianoURL + 'A' + 0 + '.wav'
    },
    {
        name: 'DSKGrandPiano' + 'As' + 0,
        url: DSKGrandPianoURL + 'As' + 0 + '.wav'
    },
    {
        name: 'DSKGrandPiano' + 'B' + 0,
        url: DSKGrandPianoURL + 'B' + 0 + '.wav'
    }
];
for(let i = 1; i < 8; i++){
    for(let j = 0; j < keys.length; j++){
        DSKGrandPiano.push({
            name: 'DSKGrandPiano' + keys[j] + i.toString(),
            url: DSKGrandPianoURL + keys[j] + i + '.wav'
        });
    }
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
];

let rockKitURL = baseURL + 'RockKit/';
module.exports.RockKit = [
    {
        name: 'Rock-Kit-Crash-1-1',
        url: rockKitURL + 'Rock-Kit-Crash-1-1.wav'
    },
    {
        name: 'Rock-Kit-Crash-1-2',
        url: rockKitURL + 'Rock-Kit-Crash-1-2.wav'
    },
    {
        name: 'Rock-Kit-Crash-2-1',
        url: rockKitURL + 'Rock-Kit-Crash-2-1.wav'
    },
    {
        name: 'Rock-Kit-Crash-2-2',
        url: rockKitURL + 'Rock-Kit-Crash-2-2.wav'
    },
    {
        name: 'Rock-Kit-Floor-1',
        url: rockKitURL + 'Rock-Kit-Floor-1.wav'
    },
    {
        name: 'Rock-Kit-Floor-2',
        url: rockKitURL + 'Rock-Kit-Floor-2.wav'
    },
    {
        name: 'Rock-Kit-HiHat-Open',
        url: rockKitURL + 'Rock-Kit-HiHat-Open.wav'
    },
    {
        name: 'Rock-Kit-HiHat-OpenClose',
        url: rockKitURL + 'Rock-Kit-HiHat-OpenClose.wav'
    },
    {
        name: 'Rock-Kit-HiHat-Pedal',
        url: rockKitURL + 'Rock-Kit-HiHat-Pedal.wav'
    },
    {
        name: 'Rock-Kit-HiHat-Shank-1',
        url: rockKitURL + 'Rock-Kit-HiHat-Shank-1.wav'
    },
    {
        name: 'Rock-Kit-HiHat-Shank-2',
        url: rockKitURL + 'Rock-Kit-HiHat-Shank-2.wav'
    },
    {
        name: 'Rock-Kit-HiHat-Tip-1',
        url: rockKitURL + 'Rock-Kit-HiHat-Tip-1.wav'
    },
    {
        name: 'Rock-Kit-HiHat-Tip-2',
        url: rockKitURL + 'Rock-Kit-HiHat-Tip-2.wav'
    },
    {
        name: 'Rock-Kit-Kick-ff-1',
        url: rockKitURL + 'Rock-Kit-Kick-ff-1.wav'
    },
    {
        name: 'Rock-Kit-Kick-ff-2',
        url: rockKitURL + 'Rock-Kit-Kick-ff-2.wav'
    },
    {
        name: 'Rock-Kit-Kick-pp-1',
        url: rockKitURL + 'Rock-Kit-Kick-pp-1.wav'
    },
    {
        name: 'Rock-Kit-Kick-pp-2',
        url: rockKitURL + 'Rock-Kit-Kick-pp-2.wav'
    },
    {
        name: 'Rock-Rack-1',
        url: rockKitURL + 'Rock-Rack-1.wav'
    },
    {
        name: 'Rock-Rack-2',
        url: rockKitURL + 'Rock-Rack-2.wav'
    },
    {
        name: 'Rock-Ride-Bell',
        url: rockKitURL + 'Rock-Ride-Bell.wav'
    },
    {
        name: 'Rock-Ride-Shank',
        url: rockKitURL + 'Rock-Ride-Shank.wav'
    },
    {
        name: 'Rock-Ride-Tip',
        url: rockKitURL + 'Rock-Ride-Tip.wav'
    },
    {
        name: 'Rock-Snare-ff-1',
        url: rockKitURL + 'Rock-Snare-ff-1.wav'
    },
    {
        name: 'Rock-Snare-ff-2',
        url: rockKitURL + 'Rock-Snare-ff-2.wav'
    },
    {
        name: 'Rock-Snare-ff-3',
        url: rockKitURL + 'Rock-Snare-ff-3.wav'
    },
    {
        name: 'Rock-Snare-pp-1',
        url: rockKitURL + 'Rock-Snare-pp-1.wav'
    },
    {
        name: 'Rock-Snare-pp-2',
        url: rockKitURL + 'Rock-Snare-pp-2.wav'
    },
    {
        name: 'Rock-Snare-pp-3',
        url: rockKitURL + 'Rock-Snare-pp-3.wav'
    }
];