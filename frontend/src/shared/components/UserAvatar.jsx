import { getAvatarSrc, getFallbackAvatar } from "../utils/avatar";

export default function UserAvatar({ user, src, className = "w-10 h-10" }) {
  return (
    <img
      src={src || getAvatarSrc(user)}
      alt={user?.fullName || "avatar"}
      className={`rounded-full object-cover ${className}`}
      onError={(e) => {
        e.currentTarget.onerror = null;
        e.currentTarget.src = getFallbackAvatar(user?.fullName || user?.email);
      }}
    />
  );
}