// Types

// https://open.exchangerate-api.com/v6/latest
interface ConvertDataI {
    "result": string,
    "documentation": "https://www.exchangerate-api.com/docs/free",
    "terms_of_use": "https://www.exchangerate-api.com/terms",
    "time_last_update_unix": number,
    "time_last_update_utc": string,
    "time_next_update_unix": number,
    "time_next_update_utc": string,
    "time_eol_unix": number,
    "base_code": string,
    "rates": {
        "USD": number,
        "AED": number,
        "ARS": number,
        "AUD": number,
        "BGN": number,
        "BRL": number,
        "BSD": number,
        "CAD": number,
        "CHF": number,
        "CLP": number,
        "CNY": number,
        "COP": number,
        "CZK": number,
        "DKK": number,
        "DOP": number,
        "EGP": number,
        "EUR": number,
        "FJD": number,
        "GBP": number,
        "GTQ": number,
        "HKD": number,
        "HRK": number,
        "HUF": number,
        "IDR": number,
        "ILS": number,
        "INR": number,
        "ISK": number,
        "JPY": number,
        "KRW": number,
        "KZT": number,
        "MVR": number,
        "MXN": number,
        "MYR": number,
        "NOK": number,
        "NZD": number,
        "PAB": number,
        "PEN": number,
        "PHP": number,
        "PKR": number,
        "PLN": number,
        "PYG": number,
        "RON": number,
        "RUB": number,
        "SAR": number,
        "SEK": number,
        "SGD": number,
        "THB": number,
        "TRY": number,
        "TWD": number,
        "UAH": number,
        "UYU": number,
        "ZAR": number
    }
}

type Currency = keyof ConvertDataI['rates']

interface UserProfileI {
    to: Currency
    from: Currency
}

type UserDict = { [idx: string]: UserProfileI };

interface SaveData {
    rates: ConvertDataI
    users: UserDict
    defaultUser: string
}

