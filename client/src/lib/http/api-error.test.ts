import { ApiError, firstErrorMessage } from "@/lib/http/api-error"

describe("firstErrorMessage", () => {
  it("prefers a Laravel field message for actions without a visible form", () => {
    const error = new ApiError("The given data was invalid.", { name: ["An active account with this name already exists."] })
    expect(firstErrorMessage(error, "Fallback")).toBe("An active account with this name already exists.")
  })

  it("falls back for unknown thrown values", () => {
    expect(firstErrorMessage(null, "Unable to complete the request.")).toBe("Unable to complete the request.")
  })
})
