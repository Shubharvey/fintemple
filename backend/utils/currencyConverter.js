const exchangeRates = {
  USD: 83.25, // 1 USD = 83.25 INR
  EUR: 89.5, // 1 EUR = 89.50 INR
  GBP: 105.2, // 1 GBP = 105.20 INR
  JPY: 0.55, // 1 JPY = 0.55 INR
};

class CurrencyConverter {
  static convert(amount, fromCurrency = "USD", toCurrency = "INR") {
    if (fromCurrency === toCurrency) return amount;

    // Convert to USD first if needed
    let amountInUSD =
      fromCurrency === "USD" ? amount : amount / exchangeRates[fromCurrency];

    // Convert to target currency
    return toCurrency === "USD"
      ? amountInUSD
      : amountInUSD * exchangeRates[toCurrency];
  }

  static format(amount, currency = "INR") {
    if (currency === "INR") {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
      }).format(amount);
    } else {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency,
      }).format(amount);
    }
  }
}

module.exports = CurrencyConverter;
