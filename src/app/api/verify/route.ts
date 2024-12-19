import { connectDB } from "@/lib/db";
import { User } from "@/models/users.model";

export async function POST(req: Request) {
  await connectDB();
  try {
    const { username, verifyCode } = await req.json();
    const decodedUsername = decodeURIComponent(username);

    const user = await User.findOne({
      username: decodedUsername,
    });

    if (!user) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    const isCodeValid = user.verifyCode === verifyCode;
    const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();
    if (isCodeValid && isCodeNotExpired) {
      user.isVerified = true;
      await user.save();
      return Response.json(
        { success: true, message: "User Verified Successfully" },
        { status: 200 }
      );
    } else if (!isCodeNotExpired) {
      return Response.json(
        {
          success: false,
          message: "Verification code has expired. Please sign up again",
        },
        { status: 400 }
      );
    } else if (!isCodeValid) {
      return Response.json(
        {
          success: false,
          message: "Verfication code didn't matched",
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error verifying user:", error);
    return Response.json(
      {
        success: false,
        message: "Verification Failed",
      },
      { status: 500 }
    );
  }
}
