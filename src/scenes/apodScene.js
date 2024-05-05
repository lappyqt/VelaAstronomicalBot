import { BaseScene } from "telegraf/scenes";
import { nasaApiService } from "../services/nasaApiService.js"; 
import translate from "translate";

import replicas from "../assets/json/replicas_text.json" assert { type: "json" };

const targetLang = "ru";

export const apodScene = new BaseScene("APOD_SCENE");

apodScene.enter((context) => 
{
    context.reply(replicas.scenes.apod.enter, { reply_markup: {
        inline_keyboard: [
            [{ text: "Сегодня", callback_data: "today" }, { text: "Другая дата", callback_data: "another_date" }],
            [{ text: "Случайные", callback_data: "multiple" }]
        ]
    }})
});

apodScene.leave(async (context) => 
{
    await context.reply(replicas.scenes.apod.leave);
});

apodScene.command("leave", (context) => context.scene.leave());

apodScene.action("today", async (context) => 
{
    /** @type { ApodResponse } */
    const apodData = await nasaApiService.getAPOD(new Date().toISOString().slice(0, 10));

    if (apodData.media_type != "image") {
        await Promise.all([
            context.answerCbQuery(),
            context.reply(apodData.url),
            context.scene.leave()
        ]);

        return;
    }

    await Promise.all([
        context.answerCbQuery(),
        context.replyWithPhoto(apodData.url, { caption: await translate(apodData.title, targetLang) }),
        context.reply(await translate(apodData.explanation, targetLang), { reply_markup: {
            inline_keyboard: [
                [{ text: "Просмотреть в высоком разрешении", url: apodData.hdurl }]
            ]
        }}),
        context.scene.leave()
    ]);
});

apodScene.action("another_date", (context) => 
{
    context.reply(replicas.scenes.apod.another_date.first_reply);
    context.answerCbQuery();

    apodScene.on("text", async (context) => {
        const dateFormat = /^\d{4}-((0\d)|(1[012]))-(([012]\d)|3[01])$/;

        if (context.message.text.match(dateFormat)) {
            try 
            {
                /** @type { ApodResponse } */
                const apodData = await nasaApiService.getAPOD(context.message.text);

                if (apodData.media_type != "image") {
                    await context.reply(apodData.url);
                    await context.scene.leave();

                    return;
                }

                await context.replyWithPhoto(apodData.url, { caption: await translate(apodData.title, targetLang) });
                await context.reply(await translate(apodData.explanation, targetLang) + "\n\nМожете продолжать писать даты или выйти", { reply_markup: { 
                    inline_keyboard: [
                        [{ text: "Просмотреть в высоком разрешении", url: apodData.hdurl }],
                        [{ text: "Выйти", callback_data: "leave" }]
                    ]
                }});
            } 
            catch (exception) 
            {
                console.log(exception);
                context.reply(replicas.scenes.apod.another_date.wrond_date);
            }
        }
        else 
        {
            context.reply(replicas.scenes.apod.another_date.wrong_format);
        }
    });
});

apodScene.action("multiple", async (context) => 
{
     /** @type { ApodResponse[] } */
    const apods = await nasaApiService.getMultipleAPOD(5);

    for (let apod of apods) {
        apod.title = await translate(apod.title, targetLang);
    }

    const mediaGroup = apods
        .filter(x => x.media_type == "image")
        .map(apod => new Object({ media: apod.url, type: "photo", caption: `${apod.title} (${apod.date})` }));

    await Promise.all([
        context.answerCbQuery(),
        context.replyWithMediaGroup(mediaGroup)
    ]);

    context.scene.leave();
});

apodScene.action("leave", (context) => 
{
    context.answerCbQuery();
    context.scene.leave();
});