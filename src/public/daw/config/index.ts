import { localConfig } from './local';
import { herokuConfig } from './heroku';
let config;
if (process.env.NODE_HOST === 'heroku') {
    config = herokuConfig;
} else {
    config = localConfig;
}

export { config };
