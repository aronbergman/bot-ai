import { INITIAL_SESSION } from "../constants/index.js";

export const startBot = bot => {
  bot.onText(/\/start|\/echo/, msg => {
    const { id: chatId } = msg.chat;
    const msgId = msg.message_id;
    const { id } = msg.from;
    const options = {
      parse_mode: "HTML",
      reply_to_message_id: msgId
    };
    msg["ctx"] = INITIAL_SESSION;
    try {
      bot.sendMessage(
        chatId,
        `Hi, ${id}. I'm an Image Generator bot. Try me\n<code>/mj whats on my mind. </code> `,
        options
      );
    } catch (error) {
      bot.sendMessage(chatId, `${error.message}`, options);
    }
  });
};
