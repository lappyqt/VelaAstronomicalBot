import fs from "fs";

import { image } from "image-downloader";
import { rootDir } from "../index.js";
import { join } from "path";

export class SdoService {
    async handleSDOCommand(context) {
        await context.replyWithPhoto({ source: join(rootDir, "/assets/SDO/SDO.png") });
    }

    async donwloadSunPhotos(directory) {
        if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory);
        }

        await Promise.all([
            image({ url: "https://sdo.gsfc.nasa.gov/assets/img/latest/latest_1024_HMIIF.jpg", dest: `${directory}/HMIIF.png`}),
            image({ url: "https://sdo.gsfc.nasa.gov/assets/img/latest/latest_1024_0131.jpg", dest: `${directory}/SDO.png`}),
            image({ url: "https://sdo.gsfc.nasa.gov/assets/img/latest/latest_1024_HMIBC.jpg", dest: `${directory}/HMIBC.png`})
        ]);
    }
}

export const sdoService = new SdoService();