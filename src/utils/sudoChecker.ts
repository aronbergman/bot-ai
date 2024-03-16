// Only specified user can run the bot

import { SUDOER } from "../db/mjSchema";

export const sudoChecker = async (
  userId: any,
  username: any,
  sudoUser: any,
  bot: any,
  chatID: any,
  options: any
) => {
  if (userId !== sudoUser) {
    const foundSudoer = await SUDOER.findOne(
      { sudoer: chatID } || { sudoer: userId }
    );
    if (!foundSudoer) {
      bot.sendMessage(
        chatID,
        `@${username} you don't have enough permission to run this command.`,
        options || {}
      );
      return false;
    }
  }

  return true;
};
