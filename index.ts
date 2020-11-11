const fromCurSelect = document.querySelector('select#fromCur') as HTMLSelectElement
const toCurSelect = document.querySelector('select#toCur') as HTMLSelectElement
const fromValInput = document.querySelector('input#fromVal') as HTMLInputElement
const toValInput = document.querySelector('input#toVal') as HTMLInputElement
const salesTaxInput = document.querySelector('input#salesTax') as HTMLInputElement


const savepoint = 'conversion-save-1605044723'
let savedata: SaveData;

function getCurrentEpoch() {
    return Math.round(new Date().getTime() / 1000)
}

async function getRates(): Promise<ConvertDataI> {
    return await (await fetch('https://open.exchangerate-api.com/v6/latest')).json()
}

async function setup() {

    const savejson = window.localStorage.getItem(savepoint)
    if (savejson) {
        savedata = JSON.parse(savejson)
        if (savedata.rates.time_next_update_unix <= getCurrentEpoch()) {
            savedata.rates = await getRates()
        }
    } else {
        savedata = {
            from: 'USD',
            to: 'NZD',
            rates: await getRates()
        }
    }

    window.localStorage[savepoint] = JSON.stringify(savedata)

    for (let currency of Object.keys(savedata.rates.rates)) {
        const option1 = document.createElement('option')
        option1.value = currency
        option1.text = currency
        const option2 = document.createElement('option')
        option2.value = currency
        option2.text = currency
        fromCurSelect.appendChild(option1)
        toCurSelect.appendChild(option2)
    }

    fromCurSelect.value = savedata.from
    toCurSelect.value = savedata.to

    fromCurSelect.addEventListener("change", convertAmount)
    fromValInput.addEventListener("input", convertAmount)
    toCurSelect.addEventListener("change", convertAmount)
    salesTaxInput.addEventListener("input", convertAmount)

}

function convertAmount() {
    const fromCur = fromCurSelect.value as Currency
    const toCur = toCurSelect.value as Currency
    const tax = Number.parseFloat(salesTaxInput.value) / 100 || 0 // convert percentage to decimal
    const value: number = Number.parseFloat(fromValInput.value) || 0
    const nonConvertedTotalAmount = addSalesTax(value, tax)
    toValInput.value = convert(fromCur, toCur, nonConvertedTotalAmount).toString()
}

function addSalesTax(amount: number, tax: number): number {
    return amount + amount * tax
}

function convert(from: Currency, to: Currency, value: number): number {
    return roundTo(value * savedata.rates.rates[to] / savedata.rates.rates[from], 2)
}

/**
 * 
 * @param value is any number
 * @param decimalPlaces should be a positive integer i.e 0, 1, 2, ...
 * 
 * 
 * rounds the value passed to the number of decimal places. 
 * Examples:
 * roundTo(1.001, 2) -> 1, roundTo(1.006, 2) -> 1.01, roundTo(1.005, 2) -> 1.01
 */
function roundTo(value: number, decimalPlaces: number) {
    const offset = 10 ** decimalPlaces
    // Moves the decimal point back <decimalPlaces> 
    // rounds the value 
    // then Moves the decimal point to where it was originally

    // Number.EPSILON is added so that values like 1.005 are correctly rounded to 1.01 instead of 1
    return Math.round((value + Number.EPSILON) * offset) / offset
}




setup()




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

interface SaveData {
    from: Currency
    to: Currency
    rates: ConvertDataI
}