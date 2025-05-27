import { describe, it, expect, vi } from 'vitest';
import prisma from '../__mock__/prisma.js';

vi.mock('../../infra/prisma.js', () => ({ default: prisma }));

import { ProductService } from '../../services/product.service.js';
import type { Product } from '@/schemas.js';

const mockProduct: Product = {
  id: '1',
  name: 'Test Product',
  description: 'A test product',
  priceCents: 1000n,
  imageUrl: 'http://example.com/image.jpg',
  quantity: 10,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  categoryId: '1',
  Category: {
    id: '1',
    name: 'Test Category',
    description: 'A test category',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  },
};

const mockCategory = {
  id: '2',
  name: 'Another test category',
  description: 'Another test category',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

describe('ProductService', () => {
  let service = new ProductService();

  describe('getProducts', () => {
    it('deve retornar produtos quando filtro é válido', async () => {
      prisma.product.findMany.mockResolvedValue([mockProduct]);
      const result = await service.getProducts({ take: 1 });
      expect(result).toEqual([mockProduct]);
    });

    it('deve lançar erro se filtro for inválido', async () => {
      await expect(service.getProducts({ take: -1 })).rejects.toThrow();
    });
  });

  describe('getProductById', () => {
    it('deve retornar produto quando encontrado', async () => {
      prisma.product.findUnique.mockResolvedValue(mockProduct);
      const result = await service.getProductById(mockProduct.id);
      expect(result).toEqual(mockProduct);
    });

    it('deve lançar erro quando produto não encontrado', async () => {
      prisma.product.findUnique.mockResolvedValue(null);
      await expect(service.getProductById('not-found')).rejects.toThrow(
        'Produto não encontrado!',
      );
    });
  });

  describe('createProduct', () => {
    it('deve criar e retornar produto quando dados são válidos', async () => {
      prisma.product.create.mockResolvedValue(mockProduct);
      const { id, createdAt, updatedAt, deletedAt, Category, ...data } =
        mockProduct;
      const result = await service.createProduct({ ...data });
      expect(result).toEqual(mockProduct);
    });

    it('deve lançar erro quando dados são inválidos', async () => {
      // @ts-expect-error: invalid data
      await expect(service.createProduct({})).rejects.toThrow();
    });
  });

  describe('updateProduct', () => {
    it('deve atualizar e retornar produto quando dados são válidos', async () => {
      const _mockProduct: Product = {
        ...mockProduct,
        name: 'Updated',
        description: 'Updated desc',
        priceCents: 2000n,
      };
      prisma.product.update.mockResolvedValue(_mockProduct);
      const { id, createdAt, updatedAt, deletedAt, Category, ...data } =
        _mockProduct;
      const result = await service.updateProduct('1', { ...data });
      expect(result).toEqual(_mockProduct);
    });

    it('deve atualizar e retornar produto quando dados de categoria são válidos', async () => {
      const _mockProduct: Product = {
        ...mockProduct,
        categoryId: '2',
        Category: mockCategory,
      };
      prisma.product.update.mockResolvedValue(_mockProduct);
      const { id, createdAt, updatedAt, deletedAt, ...data } = _mockProduct;
      const result = await service.updateProduct('1', { ...data });
      expect(result).toEqual(_mockProduct);
    });

    it('deve lançar erro quando dados são inválidos', async () => {
      await expect(service.updateProduct('1', { name: '' })).rejects.toThrow();
    });
  });

  describe('deleteProduct', () => {
    it('deve atualizar deletedAt e retornar produto', async () => {
      const deletedAt = new Date();
      prisma.product.update.mockResolvedValue({ ...mockProduct, deletedAt });
      const result = await service.deleteProduct(mockProduct.id);
      expect(result).toEqual({ ...mockProduct, deletedAt });
    });
  });
});
