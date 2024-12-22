import { connectDB } from "@/lib/db";
import { User } from "@/models/users.model";
import { sendVerificationEmail } from "@/utils/sendVerificationEmail";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  await connectDB();
  try {
    const { username, email, password } = await req.json();
    const isExistingUserByUsername = await User.findOne({
      username,
      isVerified: true,
    });

    if (isExistingUserByUsername) {
      return Response.json(
        { success: false, message: "username already taken" },
        { status: 400 }
      );
    }

    const isExistingUserByEmail = await User.findOne({ email });
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    if (isExistingUserByEmail) {
      if (isExistingUserByEmail.isVerified) {
        return Response.json(
          { success: false, message: "User already exists" },
          { status: 400 }
        );
      } else {
        const encryptedPassword = await bcrypt.hash(password, 10);
        isExistingUserByEmail.password = encryptedPassword;
        isExistingUserByEmail.verifyCode = verifyCode;
        isExistingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 15*60*1000);
        isExistingUserByEmail.isVerified = false;
        isExistingUserByEmail.username = username;
        await isExistingUserByEmail.save();
      }
    } else {
      const encryptedPassword = await bcrypt.hash(password, 10);
      const verifyCodeExpiry = new Date();
      verifyCodeExpiry.setMinutes(verifyCodeExpiry.getMinutes() + 15);
      const user = await User.create({
        username,
        email,
        password: encryptedPassword,
        verifyCode,
        verifyCodeExpiry,
        messages: [],
      });
      await user.save();
    }

    const emailResponse = await sendVerificationEmail(
      email,
      username,
      verifyCode
    );
    if (!emailResponse.success) {
      return Response.json(
        { success: false, message: emailResponse.message },
        { status: 500 }
      );
    }
    return Response.json(
      {
        success: true,
        message: "User Registered Successfully. Please verify your email",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error Registering User", error);
    return Response.json(
      { success: false, message: "Error Registering User" },
      { status: 500 }
    );
  }
}
