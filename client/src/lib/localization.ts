export const formatCurrency = (value: number | string | undefined, locale = "en-IN", currency = "INR") => {
  const amount = Number(value)
  if (!Number.isFinite(amount)) return "Unavailable"
  return new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: 0 }).format(amount)
}
