import { Schema, model } from "mongoose";
import { schemaOptions } from "../config";

const sudoerSchema = new Schema(
  {
    sudoer: {
      type: Number,
      required: true,
      unique: true
    }
  },
  schemaOptions
);

// @ts-ignore
export const SUDOER = new model("SUDOER", sudoerSchema);
