import { config } from "dotenv";

import mongoose from "mongoose";

import { MJ } from "./models/mjModel";
import { SUDOER } from "./models/sudoerModel";

config();

const { MONGO_DB } = process.env;

mongoose.connect(MONGO_DB);

export { MJ, SUDOER };
