import React from 'react';

interface AvatarProps {
  name: string;
  color: string;
  size?: 'sm' | 'md';
}

export const Avatar: React.FC<AvatarProps> = ({ name, color, size = 'sm' }) => {
  // - Splits the name string by spaces into an array of words
  // - Maps through each word and grabs the very first letter character
  // - Joins those letters back together into a single continuous string
  // - Safeguards layout overflow by capping the final string length to 2 characters
  // - Converts to uppercase to enforce a clean, uniform design aesthetic
  const initials = name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  // - 'sm': Designed to fit compactly inside Kanban task cards and filter trays (20px width/height)
  // - 'md': Designed for details panels, profile fields, or team directory tracks (32px width/height)
  const dimensions = size === 'sm' ? 'h-5 w-5 text-[10px]' : 'h-8 w-8 text-xs';

  return (
    <div
      // - rounded-full: Forces a perfect geometric circle profile layout
      // - shrink-0: Stops parent flex row engines from compressing the avatar shape boundary
      // - select-none: Disables mouse drag highlighting over initials text for a native-app feel
      className={`${dimensions} rounded-full flex items-center justify-center font-bold text-white shrink-0 border border-zinc-950 shadow-sm`}

      // - Bypasses Tailwind compile walls to apply the exact custom palette color stored in the database
      style={{ backgroundColor: color }}
      
      title={name}
    >
      {/* Displays the calculated letters, or falls back to an error question mark if given an empty space */}
      {initials || '?'}
    </div>
  );
};
