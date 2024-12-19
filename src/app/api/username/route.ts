import { User } from "@/models/users.model";
import { connectDB } from "@/lib/db";
import { z } from "zod";
import { usernameSchema } from "@/schemas/signup.schema";

const userQuerySchema = z.object({
  username: usernameSchema,
});

export async function GET(req: Request) {
  await connectDB();
  try {
    const { searchParams } = new URL(req.url);
    const queryParams = {
      username: searchParams.get("username"),
    };
    const result = userQuerySchema.safeParse(queryParams);
    if (!result.success) {
      return Response.json(
        {
          success: false,
          message: result.error.issues[0].message,
        },
        { status: 400 }
      );
    }

    const { username } = result.data;

    const isExistingUser = await User.findOne({
      username,
      isVerified: true,
    });

    if (isExistingUser) {
      return Response.json(
        {
          success: false,
          message: "Username is already taken",
        },
        { status: 400 }
      );
    }

    return Response.json(
      {
        success: true,
        message: "Username is available",
      },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: "Error checking username",
      },
      { status: 500 }
    );
  }
}
