import { z } from 'zod/v4';

export const CategorySchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(256),
  description: z.string().max(1024).nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
});

export type Category = z.infer<typeof CategorySchema>;

export const ProductSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(256),
  description: z.string().max(1024).nullable(),
  priceCents: z.bigint().nonnegative(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
  imageUrl: z.string().nullable(),
  categoryId: z.string().nullable(),
  Category: CategorySchema.optional(),
});

export type Product = z.infer<typeof ProductSchema>;

export const OrderItemSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  productId: z.string(),
  productPriceCents: z.bigint(),
  quantity: z.number().min(1),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
});

export type OrderItem = z.infer<typeof OrderItemSchema>;

export const OrderSchema = z.object({
  id: z.string(),
  totalPrice: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
  userId: z.string().nullable(),
  OrderItems: z.array(OrderItemSchema).nullable(),
});

export type Order = z.infer<typeof OrderSchema>;

export const StockSchema = z.object({
  id: z.string(),
  productId: z.string(),
  Product: ProductSchema,
  quantity: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Stock = z.infer<typeof StockSchema>;

export const StockMovementSchema = z.object({
  id: z.string(),
  productId: z.string(),
  Product: ProductSchema,
  quantity: z.number(),
  type: z.enum(['IN', 'OUT']),
  note: z.string().nullable(),
  createdAt: z.date(),
});

export type StockMovement = z.infer<typeof StockMovementSchema>;

export const PaymentSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  method: z.enum([
    'CREDIT_CARD',
    'DEBIT_CARD',
    'PAYPAL',
    'BANK_TRANSFER',
    'CASH_ON_DELIVERY',
    'PIX',
  ]),
  amountCents: z.bigint(),
  status: z.enum(['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED']),
  paidAt: z.date().nullable(),
  createdAt: z.date(),
});

export type Payment = z.infer<typeof PaymentSchema>;

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
  role: z.enum(['ADMIN', 'CUSTOMER']),
  password: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
  Orders: z.array(OrderSchema).nullable(),
});

export type User = z.infer<typeof UserSchema>;

export const OmitSchema = z
  .record(z.string(), z.union([z.string(), z.boolean(), z.undefined()]))
  .nullable()
  .optional();

export const FilterSchema = z.object({
  omit: OmitSchema,
  orderBy: z
    .record(
      z.string(),
      z.union([
        z.literal('asc'),
        z.literal('desc'),
        z.object({
          sort: z.union([z.literal('asc'), z.literal('desc')]),
          nulls: z.union([z.literal('first'), z.literal('last')]).optional(),
        }),
      ]),
    )
    .optional(),
  take: z.number().min(1).optional(),
  skip: z.number().min(1).optional(),
});

export type Filter = z.infer<typeof FilterSchema>;
