import { useState, useEffect } from 'react';
import { User } from 'lucide-react';

export default function UserAvatar({
  user,
  className = 'h-8 w-8 text-xs',
  fallbackClass = 'bg-white/20 text-white',
}) {
  const [imgError, setImgError] = useState(false);
  const avatarUrl = user?.avatarUrl;
  const initial = (user?.displayName || user?.username || '').charAt(0).toUpperCase();

  // Reset img error if avatarUrl changes
  useEffect(() => {
    setImgError(false);
  }, [avatarUrl]);

  if (avatarUrl && !imgError) {
    return (
      <img
        src={avatarUrl}
        alt={user?.displayName || user?.username || 'User avatar'}
        onError={() => setImgError(true)}
        className={`${className} shrink-0 rounded-full object-cover ring-1 ring-black/10 dark:ring-white/10`}
      />
    );
  }

  return (
    <span
      className={`${className} ${fallbackClass} shrink-0 flex items-center justify-center rounded-full font-bold select-none`}
    >
      {initial || <User size={15} />}
    </span>
  );
}
