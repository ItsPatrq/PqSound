import { DawApiServer } from './DawApi/DawApiServer';

// Start the server or run tests
if (process.argv[2] !== 'test') {
    const server = new DawApiServer();
    server.start(3000);
}
