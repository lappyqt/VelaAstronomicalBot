import fs from "fs";

import { image } from "image-downloader";
import { rootDir } from "../index.js";
import { join } from "path";

import * as cheerio from "cheerio";
import axios from "axios";

export class SdoService {
    async handleSunCommand(context) {
        const solarFlares = await this.getSolarFlaresInfo();

        await context.replyWithMediaGroup([
            { media: { source: join(rootDir, "/assets/SDO/SDO.png") }, type: "photo", caption: "Солнечные вспышки" },
            { media: { source: join(rootDir, "/assets/SDO/HMIIF.png") }, type: "photo", caption: "HMI Интенсивнограмма" },
            { media: { source: join(rootDir, "/assets/SDO/HMIBC.png") }, type: "photo", caption: "HMI Магнетограмма" }
        ]);

        await context.reply(solarFlares);
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

    async getSolarFlaresInfo() {
        const response = await axios.get("https://xras.ru/sun_flares.html", { responseType: "arraybuffer", responseEncoding: "binary" });
        const decoder = new TextDecoder('windows-1251');
        const html = decoder.decode(response.data);

        const $ = cheerio.load(html);
        let result = $("body > div > main > div > section.weather-content > p:nth-child(9)").text().trim().replace("           :", ".");

        return result;
    }
}

export const sdoService = new SdoService();