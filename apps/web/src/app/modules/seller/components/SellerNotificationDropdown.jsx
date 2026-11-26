import NotificationDropdown from "../../../shared/components/NotificationDropdown";

export default function SellerNotificationDropdown({ user }) {
  return (
    <NotificationDropdown
      user={user}
      ordersHref="/seller/orders"
      ordersLabelKey="notif.view_all_seller_orders"
    />
  );
}
