// Available currencies
const currencyCodes = Intl.supportedValuesOf("currency");
const currencyNames = new Intl.DisplayNames(["en"], { type: "currency" });
export const currencyList = currencyCodes.map((code) => ({
	code: code,
	name: currencyNames.of(code),
}));
