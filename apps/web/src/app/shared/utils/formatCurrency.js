const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});

export default function formatCurrency(value) {
  return currencyFormatter.format(value || 0);
}
