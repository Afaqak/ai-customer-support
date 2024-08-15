"use server";

import { generateId } from "lucia";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Argon2id } from "oslo/password";
import { lucia } from "@/lib/lucia";
import prisma from "@/lib/prisma";

export const register = async (formData) => {
  console.log(formData, "fd");

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: formData.email },
    });
    if (existingUser) {
      throw new Error("Email already exists.");
    }

    const hashedPassword = await new Argon2id().hash(formData.password);
    const userId = generateId(15);
    console.log(hashedPassword, userId);

    await prisma.user.create({
      data: {
        id: userId,
        displayName: formData?.displayName,
        email: formData.email,
        hashedPassword,
      },
    });

    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);

    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};
