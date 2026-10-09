import type { FulfillmentStatus, PaymentStatus } from "@/lib/orders/transitions";

export type OrderItemSnapshot = {
  productName: string;
  sku: string;
  variantLabel: string;
  quantity: number;
  unitPriceMinor: number;
  productId: string | null;
  variantId: string | null;
};

export type StoreOrder = {
  id: string;
  orderNumber: string;
  userId: string | null;
  email: string;
  fullName: string;
  phone: string;
  region: string;
  locality: string;
  addressLine: string;
  deliveryMethod: string;
  notes: string | null;
  currencyCode: string;
  subtotalMinor: number;
  shippingMinor: number;
  totalMinor: number;
  orderStatus: "open" | "completed" | "cancelled";
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  trackingNumber: string | null;
  createdAt: string;
  items: OrderItemSnapshot[];
  paystackReference: string | null;
};
