import { Prisma } from '@/generated/prisma/index.js';
import prisma from '@/infra/prisma.js';
import type { Product, Filter } from '@/schemas.js';
import { ProductSchema, FilterSchema } from '@/schemas.js';

export class ProductService {
  getProducts = async (
    filter?: Filter,
    where?: Prisma.ProductWhereInput,
    include?: Prisma.ProductInclude,
  ): Promise<Product[]> => {
    const { success, data, error } = await FilterSchema.safeParseAsync(filter);
    if (!success) throw new Error(error.message);
    return prisma.product.findMany({ ...data, where, include });
  };

  getProductById = async (id: string): Promise<Product> => {
    const product = await prisma.product.findUnique({ where: { id: id } });
    if (!product) throw new Error('Produto não encontrado!');
    return product;
  };

  createProduct = async (
    _data: Prisma.ProductCreateManyInput,
  ): Promise<Product> => {
    const { success, data, error } = await ProductSchema.omit({
      id: true,
      createdAt: true,
      updatedAt: true,
      deletedAt: true,
      Category: true,
    }).safeParseAsync(_data);
    if (!success) throw new Error(error.message);
    return prisma.product.create({ data });
  };

  updateProduct = async (
    id: string,
    _data: Prisma.ProductUncheckedUpdateManyInput,
  ): Promise<Product> => {
    const { success, data, error } = await ProductSchema.omit({
      id: true,
      createdAt: true,
      updatedAt: true,
      deletedAt: true,
      Category: true,
    }).safeParseAsync(_data);
    if (!success) throw new Error(error.message);
    return prisma.product.update({ where: { id }, data });
  };

  deleteProduct = (id: string): Promise<Product> =>
    prisma.product.update({
      where: { id: id },
      data: { deletedAt: new Date() },
    });
}
