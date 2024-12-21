import { connectDB } from "@/lib/db";
import { User } from "@/models/users.model";
import { User as NextUser } from "next-auth";
import { getServerSession } from "next-auth";
import { AuthOptions } from "../auth/[...nextauth]/options";


export async function PATCH(req: Request) {
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
    const user = session?.user as NextUser;
    const updatedUser = await User.findOneAndUpdate(
      { _id: user._id },
      { $set: { isAcceptingMessages: !user.isAcceptingMessages } },
      { new: true }
    );
    if (!updatedUser) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    return Response.json(
      {
        success: true,
        message: "User's Accepting Messages toggled successfully",
        data: updatedUser,
      },
      {
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error toggling accept messages : ", error);
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

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
    const user = session?.user;    
    const isExistingUser = await User.findOne({_id : user._id});
    if (!isExistingUser) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }
    return Response.json(
      {
        success: true,
        message: "User found",
        isAcceptingMessages: isExistingUser.isAcceptingMessages,
      },
      {
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error retrieving message acceptance status:", error);
    return Response.json(
      { success: false, message: "Error retrieving message acceptance status" },
      { status: 500 }
    );
  }
}
