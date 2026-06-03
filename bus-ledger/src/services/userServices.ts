import { prisma } from "@/lib/prisma";

const USER_SELECT = { id: true, name: true, email: true, createdAt: true } as const;

export const userService = {
  async getAllUsers() {
    return await prisma.user.findMany({ select: USER_SELECT });
  },

  async getUserById(id: number) {
    return await prisma.user.findUnique({ where: { id }, select: USER_SELECT });
  },

  async getUserByEmail(email: string) {
    return await prisma.user.findUnique({ where: { email }, select: USER_SELECT });
  },
};
