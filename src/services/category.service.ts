import { Prisma } from '@/generated/prisma/index.js';
import prisma from '@/infra/prisma.js';
import type { Category, Filter } from '@/schemas.js';
import { CategorySchema, FilterSchema } from '@/schemas.js';

export class CategoryService {
  getCategories = async (
    filter?: Filter,
    where?: Prisma.CategoryWhereInput,
  ): Promise<Category[]> => {
    const { success, data, error } = await FilterSchema.safeParseAsync(filter);
    if (!success) throw new Error(error.message);
    return prisma.category.findMany({ ...data, where });
  };

  getCategoryById = async (id: string): Promise<Category> => {
    const category = await prisma.category.findUnique({ where: { id: id } });
    if (!category) throw new Error('Categoria não encontrada!');
    return category;
  };

  createCategory = async (
    _data: Prisma.CategoryCreateInput,
  ): Promise<Category> => {
    const { success, data, error } = await CategorySchema.omit({
      id: true,
      createdAt: true,
      updatedAt: true,
      deletedAt: true,
    }).safeParseAsync(_data);
    if (!success) throw new Error(error.message);
    return prisma.category.create({ data: data });
  };

  updateCategory = async (
    id: string,
    _data: Partial<Category>,
  ): Promise<Category> => {
    const { success, data, error } = await CategorySchema.pick({
      name: true,
      description: true,
    }).safeParseAsync(_data);
    if (!success) throw new Error(error.message);
    return prisma.category.update({
      where: { id: id },
      data: { name: data.name, description: data.description },
    });
  };

  deleteCategory = (id: string): Promise<Category> =>
    prisma.category.update({
      where: { id: id },
      data: { deletedAt: new Date() },
    });
}
