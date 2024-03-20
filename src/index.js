import { Telegraf, session } from "telegraf";
import { Stage } from "telegraf/scenes";
import { apodScene } from "./scenes/ApodScene.js";
import { commandList } from "./helpers/commandList.js";
import dotenvt from "dotenv";

dotenvt.config();

const bot = new Telegraf(process.env.TELEGRAM_API_KEY);
const stage = new Stage([apodScene]); 

bot.telegram.setMyCommands(commandList);

bot.use(session());
bot.use(stage.middleware());

bot.command("apod", (context) => context.scene.enter("APOD_SCENE"));

bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));