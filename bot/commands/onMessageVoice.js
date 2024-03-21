import { INITIAL_SESSION } from "../constants/index.js";
import { OggDownloader } from "../utils/oggDownloader.js";
import { OggConverter } from "../utils/oggConverter.js";
import { OpenAI } from "../utils/openAi.js";

export const onMessageVoice = (bot) => {
  bot.on("voice", async (msg, match) => {
    let res;
    const { id: userId } = msg.from;
    const { id: chatID } = msg.chat;
    const msgId = msg.message_id;
    const options = {
      parse_mode: "HTML",
      reply_to_message_id: msgId
    };

    try {
      msg.ctx ??= INITIAL_SESSION;

      res = await bot.sendMessage(
        chatID,
        "...",
        options
      );

      const url = await bot.getFileLink(msg.voice.file_id);
      const userId = String(msg.from.id);

      const oggDownloader = new OggDownloader(url);

      const oggPath = await oggDownloader.download(userId);

      if (!oggPath) {
        await oggDownloader.delete();
        throw new Error("Something went wrong please try again.");
      }

      const oggConverter = new OggConverter(oggPath);

      const mp3Path = await oggConverter.toMp3(userId);
      await oggDownloader.delete();

      if (!mp3Path) {
        await oggConverter.delete();
        throw new Error("Something went wrong please try again.");
      }

      const openAi = new OpenAI(mp3Path);

      const data = await openAi.transcription();

      const { message_id } = res;
      await bot.editMessageText(
        `...${data.text}...`,
        {
          ...options,
          message_id
        }
      );

      await oggConverter.delete();

      msg?.ctx.messages.push({
        role: openAi.roles.User,
        content: data.text
      });

      const response = await openAi.chat(msg?.ctx.messages);

      if (!response) {
        throw new Error("Something went wrong please try again.");
      }

      msg?.ctx.messages.push({
        role: openAi.roles.Assistant,
        content: response.content
      });

      await bot.sendMessage(
        chatID,
        response.content,
        options
      );
    } catch (error) {
      if (error instanceof Error) {
        return await bot.sendMessage(
        chatID,
        error.message,
        options
      );
      }
    }
  });
};