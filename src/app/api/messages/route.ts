import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { User } from "@/models/users.model";
import { Message } from "@/models/message.models";
import { getServerSession } from "next-auth";
import { AuthOptions } from "../auth/[...nextauth]/options";

export async function GET(req: Request) {
  await connectDB();
  try {
    const session = await getServerSession(AuthOptions);
    if (!session?.user) {
      return Response.json(
        {
          success: false,
          message: "Unauthorized request",
        },
        {
          status: 401,
        }
      );
    }
    const userId = session?.user._id;
    const messages = await Message.aggregate([
      {
        $match : {
          userId : new mongoose.Types.ObjectId(userId)
        }
      },
      {
        $sort : {
          createdAt : -1
        }
      }
    ]);

    return Response.json(
      {
        success: true,
        messages: messages,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error fetching messages:", error);
    return Response.json(
      {
        success: false,
        message: "Something went wrong",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(req: Request) {
  await connectDB();
  try {
    const { username, message }: { username: string; message: string } =
      await req.json();
    const user = await User.findOne({ username, isVerified: true }).exec();
    if (!user) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    if (!user.isAcceptingMessages) {
      return Response.json(
        {
          success: false,
          message: "User is not accepting messages",
        },
        { status: 403 }
      );
    }
    const newMessage = await Message.create({
      userId : user._id,
      message
    });

    if(!newMessage) {
      return Response.json(
        {
          success: false,
          message: "Something went wrong",
        },
        { status: 500 }
      );
    }

    return Response.json(
      {
        success: true,
        message: "Message sent successfully",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error sending message:", error);
    return Response.json(
      {
        success: false,
        message: "Something went wrong",
      },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(req: Request) {
  await connectDB();
  try {
    const {messageId} = await req.json();
    const session = await getServerSession(AuthOptions);
    if (!session?.user) {
      return Response.json(
        {
          success: false,
          message: "Unauthorized request",
        },
        {
          status: 401,
        }
      );
    }
    const userId = session?.user._id;
    const user = await User.findOne({ _id: userId }).exec();
    if (!user) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }
    const response = await Message.findByIdAndDelete(messageId);
    if(!response) {
      return Response.json(
        {
          success: false,
          message: "Something went wrong",
        },
        { status: 500 }
      );
    }
    return Response.json(
      {
        success: true,
        message: "Message deleted successfully",
      },
      {
        status: 200,
      }
    )
  } catch (error) {
    console.error("Error deleting message:", error);
    return Response.json(
      {
        success: false,
        message: "Something went wrong",
      },
      {
        status: 500,
      }
    );
  }
}
