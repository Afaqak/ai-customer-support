"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { lucia } from "@/lib/lucia";
import prisma from "@/lib/prisma";
import { Argon2id } from "oslo/password";

export const login = async (formData) => {
  console.log(formData);
  try {
    const user = await prisma.user.findUnique({
      where: { email: formData.email },
    });

    if (!user) {
      throw new Error("Invalid email or password.");
    }

    const passwordMatch = await new Argon2id().verify(
      user.hashedPassword,
      formData.password
    );

    if (!passwordMatch) {
      throw new Error("Invalid email or password.");
    }

    const session = await lucia.createSession(user.id, {});
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
