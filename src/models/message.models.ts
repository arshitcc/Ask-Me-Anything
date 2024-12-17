import mongoose, { Document } from "mongoose";

export interface IMessage extends Document {
  message: string;
}

export const messageSchema = new mongoose.Schema<IMessage>(
  {
    message: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Message =
  (mongoose.models.Message as mongoose.Model<IMessage>) ||
  mongoose.model<IMessage>("Message", messageSchema);
