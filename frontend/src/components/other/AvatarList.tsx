"use client";

import { CSSProperties } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

interface AvatarListProps<T> {
  /** The list of items to display. */
  items: T[];
  /** How many avatars to display before summarizing the rest. Default is 3. */
  displayCount?: number;
  /** The size (in pixels) for each avatar. */
  size: number;
  /** Optional text to display after the avatars. */
  text?: string;

  background?: string;
  /**
   * A function to extract a unique identifier from an item.
   * For example: `(item) => item.id`
   */
  getId: (item: T) => string | number;
  /**
   * A function to extract the image URL from an item.
   * For example: `(item) => item.avatarUrl`
   */
  getImageUrl?: (item: T) => string | undefined;
  /**
   * A function to extract fallback text (e.g. initials) from an item.
   * For example: `(item) => item.username.slice(0, 2)`
   */
  getFallbackText?: (item: T) => string;

  containerStyle?: CSSProperties;
}

const AvatarList = <T,>({
  items,
  displayCount = 3,
  size,
  text,
  getId,
  getImageUrl,
  getFallbackText,
  background,
}: AvatarListProps<T>) => {
  return (
    <div className="flex items-center">
      {items.slice(0, displayCount).map((item, i, arr) => (
        <Avatar
          key={getId(item)}
          className={`relative z-[${arr.length - i}]`}
          style={{
            transform: `translateX(-${(size / 2.5) * i}px)`,
            height: `${size}px`,
            width: `${size}px`,
          }}
        >
          <>
            {getImageUrl && (
              <AvatarImage
                src={getImageUrl(item)}
                className="object-cover"
                alt={getFallbackText?.(item) || "avatar"}
              />
            )}
            {getFallbackText && (
              <AvatarFallback
                style={{ backgroundColor: background || "white" }}
              >
                {getFallbackText(item)}
              </AvatarFallback>
            )}
          </>
        </Avatar>
      ))}

      {items.length > displayCount && (
        <Avatar
          className="relative z-10"
          style={{
            transform: `translateX(-${(size / 2.5) * displayCount}px)`,
            height: `${size}px`,
            width: `${size}px`,
          }}
        >
          <AvatarFallback
            style={{ backgroundColor: background || "white" }}
            className="text-secondary font-semibold"
          >
            +{items.length - displayCount}
          </AvatarFallback>
        </Avatar>
      )}

      {text && (
        <p
          className="font-semibold text-lg px-2"
          style={{
            transform: `translateX(-${
              (size / 2.5) *
              (items.length > displayCount ? displayCount : items.length - 1)
            }px)`,
          }}
        >
          {text}
        </p>
      )}
    </div>
  );
};

export default AvatarList;
