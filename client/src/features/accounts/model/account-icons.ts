import { ChartNoAxesCombined, CreditCard, Landmark, PiggyBank, Smartphone, Wallet } from "lucide-react"

import type { AccountIconName, AccountType } from "@/features/accounts/model/account-types"

export const accountIconMap = {
  wallet: Wallet,
  landmark: Landmark,
  "piggy-bank": PiggyBank,
  smartphone: Smartphone,
  "credit-card": CreditCard,
  "chart-no-axes-combined": ChartNoAxesCombined,
} satisfies Record<AccountIconName, typeof Wallet>

export const accountIconLabels: Record<AccountIconName, string> = {
  wallet: "Wallet",
  landmark: "Bank",
  "piggy-bank": "Piggy bank",
  smartphone: "Mobile wallet",
  "credit-card": "Credit card",
  "chart-no-axes-combined": "Investment chart",
}

export const accountTypeLabels: Record<AccountType, string> = {
  cash: "Cash",
  checking: "Checking",
  savings: "Savings",
  "e-wallet": "E-wallet",
  "credit-card": "Credit card",
  investment: "Investment",
}
