export default class CurrencyService {
  private base = "IDR";
  private rates: Record<string, number> = {
    IDR_IDR: 1,
    USD_USD: 1,
    EUR_EUR: 1,
    JPY_JPY: 1,
    GBP_GBP: 1
  };

  async loadRates(base: string): Promise<void> {
    this.base = base;

    const targets = ["IDR", "USD", "EUR", "JPY", "GBP"];
    for (const t of targets) {
      const rate = await this.fetchRate(base, t);
      this.rates[`${base}_${t}`] = rate;
    }
  }

  async fetchRate(base: string, target: string): Promise<number> {
    const key = `${base}_${target}`;
    if (this.rates[key]) return this.rates[key];

    const url = `https://api.exchangerate.host/convert?from=${base}&to=${target}`;
    const res = await fetch(url);
    const json = await res.json();

    const rate = json?.info?.rate ?? 1;
    this.rates[key] = rate;

    return rate;
  }

  convert(amount: number, from: string, to: string): number {
    const key = `${from}_${to}`;
    const r = this.rates[key] ?? 1;
    return amount * r;
  }

  formatDisplay(amount: number, currency: string): string {
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency
      }).format(amount);
    } catch {
      return amount.toString();
    }
  }

  formatInput(v: string, currency: string): string {
    const numeric = v.replace(/[^0-9]/g, "");
    const num = Number(numeric) || 0;
    return this.formatDisplay(num, currency);
  }

  parseAmount(v: string): number {
    return Number(v.replace(/[^0-9]/g, "")) || 0;
  }
}
