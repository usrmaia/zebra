import { describe, it, expect, vi } from "vitest";
import prisma from "../__mock__/prisma";

vi.mock("../../infra/prisma", () => ({ default: prisma }));

import type { Order, OrderItem, Product } from "@/schemas";
import { OrderService } from "@/services";

const mockProduct: Product = {
  id: "1",
  name: "Product 1",
  description: "Description of Product 1",
  priceCents: 50n,
  imageUrl: null,
  quantity: 10,
  categoryId: "1",
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

const mockOrderItems: OrderItem[] = [
  {
    id: "1",
    orderId: "1",
    productId: "1",
    Product: mockProduct,
    quantity: 2,
    productPriceCents: 50n,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  },
  {
    id: "2",
    orderId: "1",
    productId: "2",
    quantity: 1,
    productPriceCents: 50n,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  },
];

const mockOrder: Order = {
  id: "1",
  totalPrice: 100n,
  paymentMethod: "CREDIT_CARD",
  paymentStatus: "PENDING",
  paymentAt: null,
  OrderItems: mockOrderItems,
  userId: "1",
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

describe("OrderService", () => {
  const orderService = new OrderService();

  describe("getOrders", () => {
    it("deve retornar uma lista de pedidos", async () => {
      prisma.order.findMany.mockResolvedValue([mockOrder]);
      const result = await orderService.getOrders();
      expect(result).toEqual([mockOrder]);
    });

    it("deve lançar um erro se a validação do filtro falhar", async () => {
      await expect(orderService.getOrders({ take: -1 })).rejects.toThrow();
    });
  });

  describe("getOrderById", () => {
    it("deve retornar um pedido pelo ID", async () => {
      prisma.order.findUnique.mockResolvedValue(mockOrder);
      const result = await orderService.getOrderById("1");
      expect(result).toEqual(mockOrder);
    });

    it("deve lançar um erro se o pedido não for encontrado", async () => {
      prisma.order.findUnique.mockResolvedValue(null);
      await expect(orderService.getOrderById("not-found")).rejects.toThrow(
        "Pedido não encontrado!",
      );
    });
  });

  describe("createOrder", () => {
    it("deve criar um novo pedido", async () => {
      const { OrderItems, ..._resultMockOrder } = mockOrder;
      const { id, createdAt, updatedAt, deletedAt, User, ..._mockOrder } =
        _resultMockOrder;
      prisma.order.create.mockResolvedValue(_resultMockOrder);
      const result = await orderService.createOrder(_mockOrder);
      expect(result).toEqual(_resultMockOrder);
      expect(prisma.order.create).toHaveBeenCalled();
    });

    it("deve lançar um erro se a validação dos dados falhar", async () => {
      await expect(
        orderService.createOrder({ invalid: true } as any),
      ).rejects.toThrow();
    });
  });

  describe("addOrderItem", () => {
    it("deve adicionar um item ao pedido", async () => {
      prisma.product.findUnique.mockResolvedValue(mockProduct);
      prisma.orderItem.create.mockResolvedValue(mockOrderItems[0]);

      prisma.orderItem.findMany.mockResolvedValue([mockOrderItems[0]]);
      const _mockOrder = mockOrder;
      _mockOrder.OrderItems = [mockOrderItems[0]];
      _mockOrder.totalPrice =
        mockOrderItems[0].productPriceCents *
        BigInt(mockOrderItems[0].quantity);
      prisma.order.update.mockResolvedValue(_mockOrder);

      const _mockProduct = mockProduct;
      _mockProduct.quantity =
        (_mockProduct.quantity ?? 0) - mockOrderItems[0].quantity;
      prisma.product.update.mockResolvedValue(_mockProduct);

      const result = await orderService.addOrderItem("1", mockOrderItems[0]);
      expect(result).toEqual(mockOrderItems[0]);
    });
  });

  describe("removeOrderItem", () => {
    it("deve remover um item do pedido", async () => {
      const _removedItem = mockOrderItems[0];
      prisma.orderItem.findUnique.mockResolvedValue(_removedItem);
      prisma.orderItem.delete.mockResolvedValue(_removedItem);

      const _mockOutherItem = mockOrderItems.slice(1);
      prisma.orderItem.findMany.mockResolvedValue(_mockOutherItem);

      const _mockOrder = { ...mockOrder, OrderItems: _mockOutherItem };
      _mockOrder.totalPrice = 50n;
      prisma.order.update.mockResolvedValue(_mockOrder);

      prisma.product.update.mockResolvedValue({
        ...mockProduct,
        quantity: (mockProduct.quantity ?? 0) + _removedItem.quantity,
      });

      const result = await orderService.removeOrderItem(
        mockOrder.id,
        _removedItem.id,
      );
      expect(result).toEqual(_removedItem);
    });

    it("deve lançar um erro se o item do pedido não for encontrado", async () => {
      prisma.orderItem.findUnique.mockResolvedValue(null);
      await expect(orderService.removeOrderItem("1", "1")).rejects.toThrow(
        "Item do pedido não encontrado!",
      );
    });
  });

  describe("updateOrderTotalPrice", () => {
    it("deve atualizar o preço total de um pedido", async () => {
      prisma.orderItem.findMany.mockResolvedValue(mockOrderItems);
      prisma.order.update.mockResolvedValue({
        ...mockOrder,
        totalPrice: 100n,
      });

      const _mockOrder = mockOrder;
      _mockOrder.totalPrice = 0n;
      const result = await orderService.updateOrderTotalPrice(mockOrder.id);
      expect(result.totalPrice).toBe(100n);
    });
  });

  describe("updateOrderPayment", () => {
    it("deve atualizar os detalhes de pagamento de um pedido", async () => {
      const _mockOrder = {
        ...mockOrder,
        paymentMethod: "CREDIT_CARD",
        paymentStatus: "COMPLETED",
      } as Order;
      prisma.order.update.mockResolvedValue(_mockOrder);

      const result = await orderService.updateOrderPayment(
        _mockOrder.id,
        _mockOrder.paymentMethod!,
        _mockOrder.paymentStatus,
      );
      expect(result).toEqual(_mockOrder);
    });

    it("deve lançar um erro se o método de pagamento for inválido", async () => {
      await expect(
        orderService.updateOrderPayment("1", "BANK_TRANSFER", "PENDING"),
      ).rejects.toThrow("Método de pagamento inválido!");
    });
  });

  describe("deleteOrder", () => {
    it("should delete an order", async () => {
      const _mockOrder = { ...mockOrder, deletedAt: new Date() };
      prisma.order.findUnique.mockResolvedValue(mockOrder);
      prisma.product.update.mockResolvedValue({ ...mockProduct, quantity: 10 });
      prisma.order.update.mockResolvedValue(_mockOrder);

      const result = await orderService.deleteOrder(mockOrder.id);
      expect(result).toEqual(_mockOrder);
    });
  });
});
