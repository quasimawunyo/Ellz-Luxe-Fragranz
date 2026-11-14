import "server-only";

import { createServiceClient } from "@/lib/supabase/admin";
import { salesPreset, type SalesPreset } from "@/lib/admin/summary-format";

export type SalesTotals = {
  revenueMinor: number;
  goodsMinor: number;
  deliveryMinor: number;
  orders: number;
  averageMinor: number;
};

export type SalesSummary = {
  range: {
    preset: SalesPreset;
    from: string;
    to: string;
    previousFrom: string;
    previousTo: string;
  };
  current: SalesTotals;
  previous: SalesTotals;
  days: { day: string; revenueMinor: number }[];
  topUnits: { name: string; units: number; revenueMinor: number }[];
  topRevenue: { name: string; units: number; revenueMinor: number }[];
  payments: {
    mobileMoneyMinor: number;
    mtnMinor: number;
    telecelMinor: number;
    atMinor: number;
    cardMinor: number;
    cashMinor: number;
    unclassifiedMinor: number;
  };
  channel: {
    onlineMinor: number;
    onlineOrders: number;
    inStoreMinor: number;
    inStoreOrders: number;
  };
  profitMinor: number | null;
  newCustomers: { current: number; previous: number };
  action: {
    toPack: number;
    needsFee: number;
    outForDelivery: number;
    needsAttention: number;
    review: number;
  };
  stock: {
    sizes: number;
    inStock: number;
    lowStock: number;
    outOfStock: number;
    low: { variantId: string; productName: string; label: string; quantity: number }[];
    noPhotoCount: number;
    noPhoto: { id: string; name: string }[];
  };
};

function num(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : 0;
}

function totals(value: unknown): SalesTotals {
  const row = (value ?? {}) as Record<string, unknown>;
  return {
    revenueMinor: num(row.revenueMinor),
    goodsMinor: num(row.goodsMinor),
    deliveryMinor: num(row.deliveryMinor),
    orders: num(row.orders),
    averageMinor: num(row.averageMinor),
  };
}

export async function loadSalesSummary(preset: SalesPreset, from?: string, to?: string): Promise<SalesSummary> {
  const admin = createServiceClient();
  if (!admin) throw new Error("Database is not ready.");
  const { data, error } = await admin.rpc("admin_sales_summary", {
    p_preset: preset,
    p_from: preset === "custom" ? from || null : null,
    p_to: preset === "custom" ? to || null : null,
  });
  if (error) throw new Error(error.message);
  const row = (data ?? {}) as Record<string, unknown>;
  const rangeRow = (row.range ?? {}) as Record<string, unknown>;
  const currentFrom = String(rangeRow.from ?? "");
  const currentTo = String(rangeRow.to ?? "");
  const previousFrom = String(rangeRow.previousFrom ?? "");
  const previousTo = String(rangeRow.previousTo ?? "");
  const [{ data: currentCustomers, error: currentCustomerError }, { data: previousCustomers, error: previousCustomerError }] = await Promise.all([
    admin.rpc("admin_new_customer_count", { p_from: currentFrom, p_to: currentTo }),
    admin.rpc("admin_new_customer_count", { p_from: previousFrom, p_to: previousTo }),
  ]);
  if (currentCustomerError) throw new Error(currentCustomerError.message);
  if (previousCustomerError) throw new Error(previousCustomerError.message);
  const range = (row.range ?? {}) as Record<string, unknown>;
  const payments = (row.payments ?? {}) as Record<string, unknown>;
  const channel = (row.channel ?? {}) as Record<string, unknown>;
  const action = (row.action ?? {}) as Record<string, unknown>;
  const stock = (row.stock ?? {}) as Record<string, unknown>;
  return {
    range: {
      preset: salesPreset(String(range.preset ?? preset)),
      from: String(range.from ?? ""),
      to: String(range.to ?? ""),
      previousFrom: String(range.previousFrom ?? ""),
      previousTo: String(range.previousTo ?? ""),
    },
    current: totals(row.current),
    previous: totals(row.previous),
    days: Array.isArray(row.days)
      ? row.days.map((day) => {
          const item = day as Record<string, unknown>;
          return { day: String(item.day ?? ""), revenueMinor: num(item.revenueMinor) };
        })
      : [],
    topUnits: productRows(row.topUnits),
    topRevenue: productRows(row.topRevenue),
    payments: {
      mobileMoneyMinor: num(payments.mobileMoneyMinor),
      mtnMinor: num(payments.mtnMinor),
      telecelMinor: num(payments.telecelMinor),
      atMinor: num(payments.atMinor),
      cardMinor: num(payments.cardMinor),
      cashMinor: num(payments.cashMinor),
      unclassifiedMinor: num(payments.unclassifiedMinor),
    },
    channel: {
      onlineMinor: num(channel.onlineMinor),
      onlineOrders: num(channel.onlineOrders),
      inStoreMinor: num(channel.inStoreMinor),
      inStoreOrders: num(channel.inStoreOrders),
    },
    profitMinor: row.profitMinor == null ? null : num(row.profitMinor),
    newCustomers: { current: num(currentCustomers), previous: num(previousCustomers) },
    action: {
      toPack: num(action.toPack),
      needsFee: num(action.needsFee),
      outForDelivery: num(action.outForDelivery),
      needsAttention: num(action.needsAttention),
      review: num(action.review),
    },
    stock: {
      sizes: num(stock.sizes),
      inStock: num(stock.inStock),
      lowStock: num(stock.lowStock),
      outOfStock: num(stock.outOfStock),
      low: Array.isArray(stock.low)
        ? stock.low.map((item) => {
            const rowItem = item as Record<string, unknown>;
            return {
              variantId: String(rowItem.variantId ?? ""),
              productName: String(rowItem.productName ?? ""),
              label: String(rowItem.label ?? ""),
              quantity: num(rowItem.quantity),
            };
          })
        : [],
      noPhotoCount: num(stock.noPhotoCount),
      noPhoto: Array.isArray(stock.noPhoto)
        ? stock.noPhoto.map((item) => {
            const rowItem = item as Record<string, unknown>;
            return { id: String(rowItem.id ?? ""), name: String(rowItem.name ?? "") };
          })
        : [],
    },
  };
}

function productRows(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => {
    const row = item as Record<string, unknown>;
    return {
      name: String(row.name ?? ""),
      units: num(row.units),
      revenueMinor: num(row.revenueMinor),
    };
  });
}
