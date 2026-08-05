import { db } from "@/lib/db";
import {
  hashPassword,
  createSession,
  setSessionCookie,
} from "@/lib/auth";
import { signupSchema } from "@/lib/validations";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const result = signupSchema.safeParse(body);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      return NextResponse.json(
        { error: "Validation failed", fieldErrors: errors },
        { status: 400 },
      );
    }

    const { email, password, fullName } = result.data;

    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        {
          error: "An account with this email already exists",
          fieldErrors: { email: ["An account with this email already exists"] },
        },
        { status: 409 },
      );
    }

    const hashedPassword = await hashPassword(password);
    const user = await db.user.create({
      data: { email, hashedPassword, fullName },
    });

    const { jwt, expiresAt } = await createSession(user.id);
    await setSessionCookie(jwt, expiresAt);

    return NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, fullName: user.fullName },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
