import { Config } from '@remotion/cli/config';

// Optimización estricta de memoria para PC con 16GB de RAM:
// Concurrency fijado en 2 para prevenir saturación de Chromium en Windows
Config.setConcurrency(2);

// Formato y códec óptimo para TikTok, Reels y Shorts
Config.setPixelFormat('yuv420p');
Config.setCodec('h264');

// Sobrescribir video existente sin bloquear
Config.setOverwriteOutput(true);

// Parámetros de Chromium ligeros
Config.setChromiumDisableWebSecurity(true);
Config.setChromiumIgnoreCertificateErrors(true);
Config.setChromiumHeadlessMode(true);
