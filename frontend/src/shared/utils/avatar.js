export const getFallbackAvatar = (name) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "U")}&background=random`;

export const getAvatarSrc = (user) =>
  user?.avatarUrl || getFallbackAvatar(user?.fullName || user?.email);