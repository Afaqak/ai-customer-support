import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  const { searchParams } = new URL(req.url);
  const skip = searchParams.get("skip");
  const take = searchParams.get("take");

  try {
    const feedbacks = await prisma.feedback.findMany({
      skip: parseInt(skip),
      take: parseInt(take),
      orderBy: [
        {
          createdAt: "desc",
        },
      ],
      include: {
        user: true,
      },
    });
    return NextResponse.json(feedbacks);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error fetching feedback" },
      { status: 500 }
    );
  }
}
