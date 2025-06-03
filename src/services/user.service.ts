import { Prisma } from "@/generated/prisma";
import prisma from "@/infra/prisma";
import type { User } from "@/schemas";

export class UserService {
  getUserById = async (
    id: string,
    include?: Prisma.UserInclude,
  ): Promise<User> => {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { ...include },
    });
    if (!user) throw new Error("Usuário não encontrado!");
    return user;
  };
}
