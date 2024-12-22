import mongoose, { Document } from "mongoose";
import { IMessage, messageSchema } from "./message.models";

export interface IUser extends Document {
  _id : mongoose.Types.ObjectId;
  username: string;
  email: string;
  password: string;
  verifyCode: string;
  verifyCodeExpiry: Date;
  isVerified : boolean;
  isAcceptingMessages: boolean;
  messages: IMessage[];
}

const userSchema = new mongoose.Schema<IUser>(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: [/.+@.+\..+/, "Please enter a valid email address"],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    verifyCode: {
      type: String,
      required: true,
    },
    verifyCodeExpiry: {
      type: Date,
      required: true,
    },
    isVerified: {
      type: Boolean,
      required: true,
      default: false
    },
    isAcceptingMessages: {
      type: Boolean,
      required: true,
      default: true
    },
    messages: [messageSchema],
  },
  {
    timestamps: true,
  }
);

export const User =
  (mongoose.models.User as mongoose.Model<IUser>) ||
  mongoose.model<IUser>("User", userSchema);
