import { useEffect } from "react";
import toast from "react-hot-toast";
import api from "../../config/api";

export default function useDashboardAnalytics({
  endpoint, period, range, errorMessage, refreshVersion, analytics, setAnalytics, setLoading,
}) {
  useEffect(() => {
    const controller = new AbortController();

    async function fetchAnalytics() {
      try {
        const response = await api.get(endpoint, {
          params: { period, range },
          signal: controller.signal,
        });
        if (!controller.signal.aborted && response.data?.result) {
          setAnalytics(response.data.result);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Analytics error:", error);
          toast.error(errorMessage);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void fetchAnalytics();
    return () => controller.abort();
  }, [endpoint, period, range, refreshVersion, errorMessage, setAnalytics, setLoading]);

  return analytics.totalOrdersAll ? Math.round(analytics.totalOrders / analytics.totalOrdersAll * 100) : 0;
}
