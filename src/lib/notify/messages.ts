import { bottleSizeLabel } from "@/lib/catalog/helpers";
import { formatMoney } from "@/lib/money";
import { formatGhanaPhone, type AnnexOrderNotice } from "@/lib/whatsapp";

function itemLine(item: AnnexOrderNotice["items"][number]) {
  const size = bottleSizeLabel({ label: item.variantLabel });
  return size
    ? `- ${item.productName}, ${size} x ${item.quantity}`
    : `- ${item.productName} x ${item.quantity}`;
}

export function customerOrderEmailText(
  order: AnnexOrderNotice,
  opts: { siteUrl: string; contactPhone: string },
) {
  const quoted = (order.shippingMinor ?? 0) === 0 && !/pickup/i.test(order.deliveryMethod);
  const phone = formatGhanaPhone(opts.contactPhone);
  const lines = [
    `EllzLuxe Fragranz received your order ${order.orderNumber}.`,
    "",
    `Payment: ${order.paymentStatus}. This order is not marked paid until payment is confirmed.`,
    quoted
      ? `Goods total: ${formatMoney(order.totalMinor, order.currencyCode)}`
      : `Total: ${formatMoney(order.totalMinor, order.currencyCode)}`,
    `Deliver: ${order.deliveryMethod}`,
    `${order.addressLine}, ${order.locality}, ${order.region}`,
    "",
    ...order.items.map(itemLine),
  ];
  if (order.couponCode && order.discountMinor) {
    lines.splice(4, 0, `Coupon ${order.couponCode}: -${formatMoney(order.discountMinor, order.currencyCode)}`);
  }
  if (quoted) {
    lines.push("", `Delivery fee: quoted for ${order.locality}, ${order.region}.`);
  }
  lines.push("", `Track this order: ${opts.siteUrl.replace(/\/$/, "")}/track`);
  if (phone) {
    lines.push(`WhatsApp ${phone} if you need help.`);
  }
  return lines.join("\n");
}
