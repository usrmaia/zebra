import { Prisma } from '@/generated/prisma/index.js';
import prisma from '@/infra/prisma.js';
import type { User, Filter } from '@/schemas.js';
import { UserSchema, FilterSchema } from '@/schemas.js';

export class UserService {
  getUserById = async (
    id: string,
    include?: Prisma.UserInclude,
  ): Promise<User> => {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { ...include },
    });
    if (!user) throw new Error('Usuário não encontrado!');
    return user;
  };
}
