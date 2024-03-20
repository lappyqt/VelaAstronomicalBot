import { BaseScene } from "telegraf/scenes";
import { nasaApiService } from "../services/nasaApiService.js"; 
import translate from "translate";

const nasaService = new nasaApiService(); 
const targetLang = "ru";

export const apodScene = new BaseScene("APOD_SCENE");

apodScene.enter((context) => 
{
    context.reply("Пожалуйста, укажите дату астрономической фотографии...", { reply_markup: {
        inline_keyboard: [
            [{ text: "Сегодня", callback_data: "today" }, { text: "Другая дата", callback_data: "another_date" }],
            [{ text: "5 случайных", callback_data: "multiple" }]
        ]
    }})
});

apodScene.leave(async (context) => 
{
    await context.reply("Чтобы снова просматривать астрономические фотографии, введите: /apod");
});

apodScene.command("leave", (context) => context.scene.leave());

apodScene.action("today", async (context) => 
{
    /** @type { ApodResponse } */
    const apodData = await nasaService.getAPOD(new Date().toISOString().slice(0, 10));
    
    await Promise.all([
        context.answerCbQuery(),
        context.replyWithPhoto(apodData.url, { caption: await translate(apodData.title, targetLang) }),
        context.reply(await translate(apodData.explanation, targetLang), { reply_markup: {
            inline_keyboard: [
                [{ text: "Просмотреть в высоком разрешении", url: apodData.hdurl }]
            ]
        }})
    ]);

    context.scene.leave();
});

apodScene.action("another_date", (context) => 
{
    context.reply("Укажите дату в формате ГГГГ-ММ-ДД. Например: 2005-10-13.");
    context.answerCbQuery();

    apodScene.on("text", async (context) => {
        const dateFormat = /^\d{4}-((0\d)|(1[012]))-(([012]\d)|3[01])$/;

        if (context.message.text.match(dateFormat)) {
            try 
            {
                /** @type { ApodResponse } */
                const apodData = await nasaService.getAPOD(context.message.text);

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
                context.reply("На данную дату нет фотографии. В базе данных Nasa находятся фотографии с 16 января 1995 по сегодняшнее число.");
            }
        }
        else 
        {
            context.reply("Неверный формат даты...");
        }
    });
});

apodScene.action("multiple", async (context) => 
{
     /** @type { ApodResponse[] } */
    const apods = await nasaService.getMultipleAPOD(5);

    for (let apod of apods) {
        apod.title = await translate(apod.title, targetLang);
    }

    const mediaGroup = apods.map(apod => new Object({ media: apod.url, type: "photo", caption: `${apod.title} (${apod.date})` }));

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