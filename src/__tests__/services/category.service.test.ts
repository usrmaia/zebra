import { describe, it, expect, vi } from "vitest";
import prisma from "../__mock__/prisma";

vi.mock("../../infra/prisma", () => ({ default: prisma }));

import { CategoryService } from "@/services/category.service";
import type { Category } from "@/schemas";

const mockCategory: Category = {
  id: "1",
  name: "Test Category",
  description: "A test category",
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

describe("CategoryService", () => {
  const categoryService = new CategoryService();

  describe("getCategories", () => {
    it("deve retornar categorias quando filtro é válido", async () => {
      prisma.category.findMany.mockResolvedValue([mockCategory]);
      const result = await categoryService.getCategories({ take: 1 });
      expect(result).toEqual([mockCategory]);
    });

    it("deve lançar erro se filtro for inválido", async () => {
      await expect(
        categoryService.getCategories({ take: -1 }),
      ).rejects.toThrow();
    });
  });

  describe("getCategoryById", () => {
    it("deve retornar categoria se encontrada", async () => {
      prisma.category.findUnique.mockResolvedValue(mockCategory);
      const result = await categoryService.getCategoryById(mockCategory.id);
      expect(result).toEqual(mockCategory);
    });

    it("deve lançar erro se categoria não encontrada", async () => {
      prisma.category.findUnique.mockResolvedValue(null);
      await expect(
        categoryService.getCategoryById("not-found"),
      ).rejects.toThrow("Categoria não encontrada!");
    });
  });

  describe("createCategory", () => {
    it("deve criar e retornar categoria quando dados são válidos", async () => {
      prisma.category.create.mockResolvedValue(mockCategory);
      const { id, createdAt, updatedAt, deletedAt, ...data } = mockCategory;
      const result = await categoryService.createCategory({ ...data });
      expect(result).toEqual(mockCategory);
    });

    it("deve lançar erro se dados forem inválidos", async () => {
      // @ts-expect-error: invalid data
      await expect(categoryService.createCategory({})).rejects.toThrow();
    });
  });

  describe("updateCategory", () => {
    it("deve atualizar e retornar categoria quando dados são válidos", async () => {
      const _mockCategory: Category = {
        ...mockCategory,
        name: "Updated",
        description: "Updated desc",
      };
      prisma.category.update.mockResolvedValue(_mockCategory);
      const result = await categoryService.updateCategory(
        _mockCategory.id,
        _mockCategory,
      );
      expect(result).toEqual(_mockCategory);
    });

    it("deve lançar erro se dados forem inválidos", async () => {
      await expect(
        categoryService.updateCategory(mockCategory.id, { name: "" }),
      ).rejects.toThrow();
    });
  });

  describe("deleteCategory", () => {
    it("deve deletar e retornar categoria", async () => {
      const deletedAt = new Date();
      prisma.category.update.mockResolvedValue({ ...mockCategory, deletedAt });
      const result = await categoryService.deleteCategory(mockCategory.id);
      expect(result).toEqual({ ...mockCategory, deletedAt });
    });
  });
});
