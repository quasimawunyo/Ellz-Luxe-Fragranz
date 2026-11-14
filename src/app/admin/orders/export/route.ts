import { requireAdmin } from "@/lib/auth/require-admin";
import { filterOrders, ordersToCsv, type OrderListQuery } from "@/lib/orders/desk";
import { listOrders } from "@/lib/orders/store";

export async function GET(request: Request) {
  await requireAdmin();
  const url = new URL(request.url);
  const query: OrderListQuery = {
    q: url.searchParams.get("q") ?? undefined,
    payment: url.searchParams.get("payment") ?? undefined,
    fulfilment: url.searchParams.get("fulfilment") ?? undefined,
    method: url.searchParams.get("method") ?? undefined,
    from: url.searchParams.get("from") ?? undefined,
    to: url.searchParams.get("to") ?? undefined,
    tests: url.searchParams.get("tests") ?? undefined,
    view: url.searchParams.get("view") ?? undefined,
  };
  const csv = ordersToCsv(filterOrders(await listOrders(), query));
  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": "attachment; filename=\"ellz-orders.csv\"",
    },
  });
}
