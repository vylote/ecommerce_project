import api from "../../config/api";

export default async function openZalopayPayment(orderId) {
  const { data } = await api.post(`/payments/zalopay/orders/${orderId}`);
  window.location.assign(data.result.payUrl);
}
