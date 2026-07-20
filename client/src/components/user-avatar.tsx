import { Avatar as DiceBearAvatar, Style } from "@dicebear/core"
import openPeepsDefinition from "@dicebear/styles/open-peeps.json" with { type: "json" }
import * as React from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

const openPeepsStyle = new Style(openPeepsDefinition)

type AvatarSize = "sm" | "default" | "lg"

interface UserAvatarProps {
  userId: number | string
  name: string
  size?: AvatarSize
  className?: string
  decorative?: boolean
}

function getInitials(name: string): string {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase()

  return initials || "?"
}

function UserAvatar({
  userId,
  name,
  size = "default",
  className,
  decorative = false,
}: UserAvatarProps) {
  const avatarUri = React.useMemo(
    () =>
      new DiceBearAvatar(openPeepsStyle, {
        seed: `user-${userId}`,
        size: 128,
        borderRadius: 50,
        scale: 0.92,
        backgroundColor: ["ffd5c2"],
        expressionVariant: {
          calm: 1,
          cute: 1,
          lovingGrin1: 1,
          lovingGrin2: 1,
          smile: 2,
          smileBig: 1,
        },
        maskProbability: 0,
      }).toDataUri(),
    [userId]
  )

  return (
    <Avatar
      size={size}
      className={cn("ring-2 ring-amber-500 ring-offset-1 ring-offset-background", className)}
    >
      <AvatarImage
        src={avatarUri}
        alt={decorative ? "" : `Avatar for ${name}`}
      />
      <AvatarFallback aria-label={decorative ? undefined : `Avatar for ${name}`}>
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  )
}

export { UserAvatar, getInitials }
export type { UserAvatarProps }
