import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useI18n } from "../../../i18n";
import api from "../../config/api";
import Navbar from "../../shared/components/Navbar";

const POLL_INTERVAL = 2000;
const MAX_POLLS = 8;

export default function WalletPaymentResultPage() {
  const [params] = useSearchParams();
  const orderId = params.get("purchaseId");
  const validOrderId = /^[1-9][0-9]{0,18}$/.test(orderId ?? "");
  const [paymentStatus, setPaymentStatus] = useState("PENDING");
  const [refreshVersion, setRefreshVersion] = useState(0);
  const { t } = useI18n();

  useEffect(() => {
    if (!validOrderId) return undefined;
    const controller = new AbortController();
    let timeout;
    let attempts = 0;

    async function readPayment() {
      try {
        const response = await api.get(`/payments/orders/${orderId}`, { signal: controller.signal });
        if (controller.signal.aborted) return;
        const payment = response.data.result;
        if (payment?.method !== "ZALOPAY") {
          setPaymentStatus("UNKNOWN");
          return;
        }
        setPaymentStatus(payment.status);
        attempts += 1;
        if (payment.status === "PENDING" && attempts < MAX_POLLS) {
          timeout = window.setTimeout(() => void readPayment(), POLL_INTERVAL);
        }
      } catch {
        if (!controller.signal.aborted) setPaymentStatus("UNKNOWN");
      }
    }

    void readPayment();
    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [orderId, validOrderId, refreshVersion]);

  const status = validOrderId ? paymentStatus : "UNKNOWN";
  const statusKey = status === "PAID" ? "paid" : status === "PENDING" ? "pending" : status === "FAILED" ? "failed" : "unknown";

  return (
    <div className="min-h-screen bg-base-200 text-base-content">
      <Navbar />
      <main className="mx-auto max-w-lg px-4 py-12">
        <section className="space-y-4 rounded-xl border border-base-300 bg-base-100 p-6">
          <h1 className="text-xl font-bold">{t("wallet.result.title")}</h1>
          {validOrderId && <p className="text-sm text-base-content/70">#{orderId}</p>}
          <p role="status">{t(`wallet.result.${statusKey}`)}</p>
          <div className="flex flex-wrap gap-2">
            <Link to="/orders" className="btn btn-sm btn-secondary">{t("wallet.result.orders")}</Link>
            {validOrderId && (status === "PENDING" || status === "UNKNOWN") && (
              <button type="button" className="btn btn-sm btn-outline" onClick={() => setRefreshVersion((version) => version + 1)}>
                {t("wallet.result.refresh")}
              </button>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
