export const formatCurrency = (amount: number, currency: string = "INR") => {
  if (currency === "INR") {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

export const formatCompactCurrency = (
  amount: number,
  currency: string = "INR"
) => {
  if (Math.abs(amount) >= 100000) {
    const value = amount / 100000;
    return `${value >= 0 ? "+" : ""}₹${value.toFixed(1)}L`;
  } else if (Math.abs(amount) >= 1000) {
    const value = amount / 1000;
    return `${value >= 0 ? "+" : ""}₹${value.toFixed(1)}K`;
  }

  return formatCurrency(amount, currency);
};

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
