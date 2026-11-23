import OrderStatusChart, { OrderStatusLegend } from "./OrderStatusChart";

export default function OrderStatusSummary({
  title,
  totalOrders,
  statusBreakdown,
  className,
  chartClassName,
}) {
  return (
    <div className={`border border-gray-100 flex flex-col justify-between ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-bold text-gray-800">{title}</span>
        <span className="text-xs text-gray-400">Tổng {totalOrders || 0} đơn</span>
      </div>
      <div className={`w-full relative flex items-center justify-center ${chartClassName}`}>
        <OrderStatusChart statusBreakdown={statusBreakdown} />
      </div>
      <OrderStatusLegend statusBreakdown={statusBreakdown} />
    </div>
  );
}
