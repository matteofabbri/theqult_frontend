
import React from 'react';
import type { User } from '../types';
import { getAvatarUrl } from '../hooks/useStore';

interface UserAvatarProps {
  user: User | null | undefined;
  className?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ user, className = 'w-8 h-8' }) => {
  const [hasError, setHasError] = React.useState(false);
  const avatarUrl = getAvatarUrl(user);

  React.useEffect(() => {
    setHasError(false);
  }, [avatarUrl]);

  if (avatarUrl && !hasError) {
    return (
      <img
        src={avatarUrl}
        alt={user?.username || 'User'}
        className={`rounded-full object-cover flex-shrink-0 ${className}`}
        onError={() => setHasError(true)}
      />
    );
  }

  const initial = user?.username ? user.username.charAt(0).toUpperCase() : '?';

  return (
    <div className={`rounded-full bg-gray-300 flex items-center justify-center text-white font-bold flex-shrink-0 ${className}`}>
      <span>{initial}</span>
    </div>
  );
};

export default UserAvatar;
