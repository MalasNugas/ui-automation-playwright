import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config();

export const Config = {
    BASE_URL: process.env.BASE_URL || 'https://cctv.malangkota.go.id/',
    TIMEOUT: 10000,
    SCREENSHOT_DIR: path.join(__dirname, '../../screenshots'),
};
