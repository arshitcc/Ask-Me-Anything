import mongoose, { Document } from "mongoose";

export interface IMessage extends Document {
  _id: mongoose.Types.ObjectId
  userId : mongoose.Types.ObjectId
  message: string;
  createdAt: Date;
  updatedAt: Date;
}

export const messageSchema = new mongoose.Schema<IMessage>(
  {
    message: {
      type: String,
      required: true,
      trim: true,
    },
    userId : {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export const Message =
  (mongoose.models.Message as mongoose.Model<IMessage>) ||
  mongoose.model<IMessage>("Message", messageSchema);
