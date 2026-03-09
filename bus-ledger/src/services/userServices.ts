import { prisma } from "@/lib/prisma";

export const userService = {

  async getAllUsers() {
    return await prisma.user.findMany();
  },

  async getUserById(id: number) {
    return await prisma.user.findUnique({
      where: { id }
    });
  },

  async getUserByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email }
    });
  },

};