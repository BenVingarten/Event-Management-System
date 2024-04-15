import { fileURLToPath } from 'url';
import { dirname, join} from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import { promises as fsPromises } from 'fs';
import fs from 'fs';
import { format } from 'date-fns';

const logEvents = async (message, fileName) => {
    const date = format(new Date(), 'dd-MM-yyyy HH:mm:ss');
    const logItem = `${date}\t${message}\n`;
    try {
        if(!fs.existsSync(join(__dirname, '..', 'logs'))) 
            await fsPromises.mkdir(join(__dirname, '..', 'logs'));
        
        await fs.promises.appendFile(join(__dirname, '..', 'logs', fileName), logItem);
    } catch(err) {
        console.error(err);
    }
}

export const logger = (request, response, next) => {
    const message = `${request.url}\t${request.method}\t${request.headers.origin}`;
    logEvents(message, 'logFile.log');
    next();
}