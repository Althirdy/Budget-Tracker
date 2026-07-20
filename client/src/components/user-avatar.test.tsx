import { render, screen } from "@testing-library/react"

import { UserAvatar, getInitials } from "@/components/user-avatar"

describe("UserAvatar", () => {
  it("creates the same avatar for the same user id", () => {
    const { rerender } = render(<UserAvatar userId={42} name="First Name" />)
    const firstSource = screen.getByRole("img", { name: "Avatar for First Name" }).getAttribute("src")

    rerender(<UserAvatar userId={42} name="Renamed User" />)

    expect(screen.getByRole("img", { name: "Avatar for Renamed User" })).toHaveAttribute(
      "src",
      firstSource
    )
  })

  it("creates different avatars for different user ids", () => {
    const { rerender } = render(<UserAvatar userId={1} name="Test User" />)
    const firstSource = screen.getByRole("img", { name: "Avatar for Test User" }).getAttribute("src")

    rerender(<UserAvatar userId={2} name="Test User" />)

    expect(screen.getByRole("img", { name: "Avatar for Test User" })).not.toHaveAttribute(
      "src",
      firstSource
    )
  })

  it("derives concise fallback initials", () => {
    expect(getInitials("Test User")).toBe("TU")
    expect(getInitials("  Tally  ")).toBe("T")
    expect(getInitials("   ")).toBe("?")
  })
})
