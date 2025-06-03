import { z } from "zod/v4";

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
  quantity: z.number().min(0).nullable(),
  categoryId: z.string().nullable(),
  Category: CategorySchema.optional(),
});

export type Product = z.infer<typeof ProductSchema>;

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
  role: z.enum(["ADMIN", "CUSTOMER"]),
  password: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
});

export type User = z.infer<typeof UserSchema>;

export const OrderItemSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  productId: z.string(),
  Product: ProductSchema.optional(),
  productPriceCents: z.bigint(),
  quantity: z.number().min(1),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
});

export type OrderItem = z.infer<typeof OrderItemSchema>;

export const paymentStatusSchema = z.enum([
  "PENDING",
  "COMPLETED",
  "FAILED",
  "REFUNDED",
]);

export type PaymentStatus = z.infer<typeof paymentStatusSchema>;

export const paymentMethodSchema = z.enum([
  "CREDIT_CARD",
  "DEBIT_CARD",
  "PAYPAL",
  "BANK_TRANSFER",
  "CASH_ON_DELIVERY",
  "PIX",
]);

export type PaymentMethod = z.infer<typeof paymentMethodSchema>;

export const OrderSchema = z.object({
  id: z.string(),
  totalPrice: z.bigint(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
  userId: z.string(),
  User: UserSchema.nullable().optional(),
  OrderItems: z.array(OrderItemSchema).optional(),
  paymentMethod: paymentMethodSchema.nullable(),
  paymentStatus: paymentStatusSchema.default("PENDING"),
  paymentAt: z.date().nullable(),
});

export type Order = z.infer<typeof OrderSchema>;

export const StockSchema = z.object({
  id: z.string(),
  productId: z.string(),
  Product: ProductSchema.optional(),
  quantity: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Stock = z.infer<typeof StockSchema>;

export const stockMovementTypeSchema = z.enum([
  "IN",
  "OUT",
  "OPEN",
  "CANCEL",
  "ADJUSTMENT",
]);

export type StockMovementType = z.infer<typeof stockMovementTypeSchema>;

export const StockMovementSchema = z.object({
  id: z.string(),
  productId: z.string(),
  Product: ProductSchema.optional(),
  quantity: z.number(),
  type: stockMovementTypeSchema,
  note: z.string().nullable(),
  createdAt: z.date(),
});

export type StockMovement = z.infer<typeof StockMovementSchema>;

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
        z.literal("asc"),
        z.literal("desc"),
        z.object({
          sort: z.union([z.literal("asc"), z.literal("desc")]),
          nulls: z.union([z.literal("first"), z.literal("last")]).optional(),
        }),
      ]),
    )
    .optional(),
  take: z.number().min(1).optional(),
  skip: z.number().min(1).optional(),
});

export type Filter = z.infer<typeof FilterSchema>;
