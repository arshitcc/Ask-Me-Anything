import { IMessage } from "@/models/message.models";

export interface ApiResponse {
  success: boolean;
  message: string;
  isAcceptingMessages?: boolean;
  messages?: IMessage[];
}
