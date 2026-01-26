import React from 'react';
import type { Board } from '../types';

interface BoardIconProps {
  board: Board | null | undefined;
  className?: string;
}

const BoardIcon: React.FC<BoardIconProps> = ({ board, className = 'w-8 h-8' }) => {
  const [hasError, setHasError] = React.useState(false);
  const defaultIconUrl = `https://api.dicebear.com/8.x/bottts-neutral/svg?seed=${board?.name || 'default'}`;

  React.useEffect(() => {
    setHasError(false);
  }, [board?.iconUrl]);

  const src = board?.iconUrl && !hasError ? board.iconUrl : defaultIconUrl;

  return (
    <img
      src={src}
      alt={board?.name || 'Board Icon'}
      className={`rounded-full object-cover flex-shrink-0 bg-white ${className}`}
      onError={() => {
        if (!hasError) { // Prevent infinite loop if default also fails
          setHasError(true);
        }
      }}
    />
  );
};

export default BoardIcon;
