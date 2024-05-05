import { Telegraf, session } from "telegraf";
import { Stage } from "telegraf/scenes";
import { apodScene } from "./scenes/apodScene.js";
import { sdoService } from "./services/sdoService.js";
import { join } from "path";

import cron from "node-cron";
import dotenvt from "dotenv";

import replicas from "./assets/json/replicas_text.json" assert { type: "json" };
import commands from "./assets/json/command_list.json" assert { type: "json" };

export const rootDir = import.meta.dirname;

dotenvt.config();

const bot = new Telegraf(process.env.TELEGRAM_API_KEY);
const stage = new Stage([apodScene]); 

bot.telegram.setMyCommands(commands.command_list);

bot.start(context => {
    context.replyWithAnimation("https://i.pinimg.com/originals/fa/48/bb/fa48bb0e04197ec44a2948a4f3ae9173.gif", { caption: replicas.bot_start });
});

bot.use(session());
bot.use(stage.middleware());

bot.command("apod", (context) => context.scene.enter("APOD_SCENE"));
bot.command("sun", (context) => sdoService.handleSunCommand(context));

bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

await sdoService.donwloadSunPhotos(join(rootDir, "assets/SDO"));

cron.schedule("* * 6 * * *", async () => {
    await sdoService.donwloadSunPhotos(join(rootDir, "assets/SDO"));
});

console.log("https://t.me/VelaAstronomicalBot");