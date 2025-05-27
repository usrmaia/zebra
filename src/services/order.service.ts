import { Prisma } from '@/generated/prisma/index.js';
import prisma from '@/infra/prisma.js';
import type {
  Order,
  OrderItem,
  PaymentMethod,
  PaymentStatus,
  Filter,
} from '@/schemas.js';
import { OrderSchema, OrderItemSchema, FilterSchema } from '@/schemas.js';
import { ProductService } from './product.service.js';

export class OrderService {
  productService = new ProductService();

  getOrders = async (
    filter?: Filter,
    where?: Prisma.OrderWhereInput,
    include?: Prisma.OrderInclude,
  ): Promise<Order[]> => {
    const { success, data, error } = await FilterSchema.safeParseAsync({
      ...filter,
    });
    if (!success) throw new Error(error.message);
    return prisma.order.findMany({
      ...data,
      where: { deletedAt: null, ...where },
      include: { ...include },
    });
  };

  getOrderById = async (
    id: string,
    include?: Prisma.OrderInclude,
  ): Promise<Order> => {
    const order = await prisma.order.findUnique({
      where: { id: id },
      include: { ...include },
    });
    if (!order) throw new Error('Pedido não encontrado!');
    return order;
  };

  getOrderItemsByOrderId = async (
    orderId: string,
    include?: Prisma.OrderItemInclude,
  ): Promise<OrderItem[]> => {
    const orderItems = await prisma.orderItem.findMany({
      where: { orderId },
      include: { ...include },
    });
    if (!orderItems) throw new Error('Itens do pedido não encontrados!');
    return orderItems;
  };

  createOrder = async (_data: Prisma.OrderCreateInput): Promise<Order> => {
    const { success, data, error } = await OrderSchema.omit({
      id: true,
      createdAt: true,
      updatedAt: true,
      deletedAt: true,
      OrderItems: true,
      User: true,
    }).safeParseAsync(_data);
    if (!success) throw new Error(error.message);

    if (data.paymentMethod) {
      data.paymentStatus = 'COMPLETED';
      data.paymentAt = new Date();
    }

    return prisma.order.create({ data });
  };

  addOrderItem = async (
    orderId: string,
    _data: Prisma.OrderItemUncheckedCreateInput,
  ): Promise<OrderItem> => {
    const { success, data, error } = await OrderItemSchema.omit({
      id: true,
      createdAt: true,
      updatedAt: true,
      deletedAt: true,
      Product: true,
    }).safeParseAsync(_data);
    if (!success) throw new Error(error.message);

    this.productService.checkStock(data.productId, data.quantity);

    const productPriceCents = (
      await this.productService.getProductById(data.productId)
    ).priceCents;
    const orderItem = await prisma.orderItem.create({
      data: { ...data, orderId, productPriceCents },
    });

    this.updateOrderTotalPrice(orderId);
    this.productService.addStock(orderItem.productId, -orderItem.quantity);

    return orderItem;
  };

  removeOrderItem = async (
    orderId: string,
    orderItemId: string,
  ): Promise<OrderItem> => {
    const orderItem = await prisma.orderItem.findUnique({
      where: { id: orderItemId, orderId: orderId },
    });
    if (!orderItem) throw new Error('Item do pedido não encontrado!');
    const deletedOrderItem = await prisma.orderItem.delete({
      where: { id: orderItem.id, orderId: orderItem.orderId },
    });

    this.updateOrderTotalPrice(orderId);
    this.productService.addStock(orderItem.productId, orderItem.quantity);

    return deletedOrderItem;
  };

  updateOrderTotalPrice = async (orderId: string): Promise<Order> => {
    const orderItems = await this.getOrderItemsByOrderId(orderId);
    const totalPrice = orderItems.reduce(
      (acc, item) =>
        acc + BigInt(item.productPriceCents) * BigInt(item.quantity),
      0n,
    );
    return prisma.order.update({
      where: { id: orderId },
      data: { totalPrice },
    });
  };

  updateOrderPayment = async (
    orderId: string,
    paymentMethod: PaymentMethod,
    paymentStatus: PaymentStatus,
  ): Promise<Order> => {
    if (!paymentMethod || paymentStatus == 'PENDING')
      throw new Error('Método de pagamento inválido!');

    return prisma.order.update({
      where: { id: orderId },
      data: {
        paymentMethod,
        paymentStatus,
        paymentAt: new Date(),
      },
    });
  };

  deleteOrder = async (id: string): Promise<Order> => {
    const order = await this.getOrderById(id, { OrderItems: true });
    order.OrderItems?.forEach(async (item) => {
      this.productService.addStock(item.productId, item.quantity);
    });

    return prisma.order.update({
      where: { id: order.id },
      data: { deletedAt: new Date() },
    });
  };
}
