import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuth } from "@/utils/get-auth";

export async function POST(req) {
  const { text } = await req.json();
  const { session, user } = await getAuth(req);

  if (!session || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const feedback = await prisma.feedback.create({
      data: {
        userId: user.id,
        text,
      },
      include: {
        user: true,
      },
    });

    return NextResponse.json({
      message: "Feedback created successfully",
      feedback,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
