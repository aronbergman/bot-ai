import axios from "axios";
import fs from "fs";
import { URL } from "url";

export const saveAndSendPhoto = async (
  imgUrl: string,
  imgDir: fs.PathLike,
  filePath: string | number | Buffer | URL,
  chatID: any,
  bot: any,
  options: any
) => {
  try {
    if (!fs.existsSync(imgDir)) {
      fs.mkdirSync(imgDir);
    }
    await axios
      .get(imgUrl, { responseType: "arraybuffer" })
      .then(response => {
        fs.writeFileSync(filePath, Buffer.from(response.data, "binary"));
        // @ts-ignore
        const stream = fs.createReadStream(filePath);
        bot.sendDocument(chatID, stream, options || {});
      })
      .catch(error => {
        console.error(error);
      });
  } catch (error) {
    console.log(error);
  }
};
