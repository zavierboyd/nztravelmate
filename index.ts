const fromCurSelect = document.getElementById('fromCur') as HTMLSelectElement
const toCurSelect = document.getElementById('toCur') as HTMLSelectElement
const fromValInput = document.getElementById('fromVal') as HTMLInputElement
const toValInput = document.getElementById('toVal') as HTMLInputElement
const salesTaxInput = document.getElementById('salesTax') as HTMLInputElement

const saveUserButton = document.getElementById('saveUser') as HTMLButtonElement
const deleteUserButton = document.getElementById('deleteUser') as HTMLButtonElement
const setDefaultUserButton = document.getElementById('defaultUser') as HTMLButtonElement
const addNewUserButton = document.getElementById('addNewUser') as HTMLButtonElement
const userProfileSelect = document.getElementById('userProfile') as HTMLSelectElement

const savepoint = 'conversion-save-1605044723'
const defaultConvertData: ConvertDataI = {
    result: 'success',
    documentation: 'https://www.exchangerate-api.com/docs/free',
    terms_of_use: 'https://www.exchangerate-api.com/terms',
    time_last_update_unix: 1605139594,
    time_last_update_utc: 'Thu, 12 Nov 2020 00:06:34 +0000',
    time_next_update_unix: 1605226704,
    time_next_update_utc: 'Fri, 13 Nov 2020 00:18:24 +0000',
    time_eol_unix: 0,
    base_code: 'USD',
    rates: {
        USD: 1,
        AED: 3.67,
        ARS: 79.43,
        AUD: 1.37,
        BGN: 1.66,
        BRL: 5.4,
        BSD: 1,
        CAD: 1.3,
        CHF: 0.916,
        CLP: 759.14,
        CNY: 6.61,
        COP: 3623.33,
        CZK: 22.43,
        DKK: 6.32,
        DOP: 58.04,
        EGP: 15.62,
        EUR: 0.848,
        FJD: 2.1,
        GBP: 0.756,
        GTQ: 7.77,
        HKD: 7.75,
        HRK: 6.42,
        HUF: 302.5,
        IDR: 14297.88,
        ILS: 3.38,
        INR: 74.3,
        ISK: 137.95,
        JPY: 105.4,
        KRW: 1116.13,
        KZT: 427.47,
        MVR: 15.42,
        MXN: 20.4,
        MYR: 4.12,
        NOK: 9.05,
        NZD: 1.46,
        PAB: 1,
        PEN: 3.62,
        PHP: 48.4,
        PKR: 158.19,
        PLN: 3.81,
        PYG: 6917.27,
        RON: 4.13,
        RUB: 76.54,
        SAR: 3.75,
        SEK: 8.63,
        SGD: 1.35,
        THB: 30.34,
        TRY: 8,
        TWD: 28.58,
        UAH: 28.07,
        UYU: 42.56,
        ZAR: 15.62
    }
}

let savedata: SaveData;

function updateUserSettings(user: string, to: Currency, from: Currency, savedata: SaveData): void {
    savedata.users[user] = { to, from }
}

function getUserSettings(user: string, savedata: SaveData): { to: Currency, from: Currency } {
    return savedata.users[user]
}

function saveUser(): void {
    const to = toCurSelect.value as Currency
    const from = fromCurSelect.value as Currency
    let user = userProfileSelect.value
    updateUserSettings(user, to, from, savedata)
    updateUserSelectOptions(userProfileSelect, savedata)
    saveData()
}

function saveData(): void {
    window.localStorage.setItem(savepoint, JSON.stringify(savedata))
}

function updateUserSelectOptions(userProfileSelect: HTMLSelectElement, savedata: SaveData): void {
    const usersShown = getShownUsers(userProfileSelect)
    const users: string[] = Object.keys(savedata.users)
    const usersToShow = users.filter((user) => { return !usersShown.includes(user) })
    const usersToHide = usersShown.filter((user) => { return !users.includes(user) })
    // Show users not shown
    for (let userProfile of usersToShow) {
        const user = document.createElement('option')
        user.value = userProfile
        user.text = userProfile
        userProfileSelect.appendChild(user)
    }
    // Hide non existant users
    for (let userProfile of usersToHide) {
        const idx = usersShown.indexOf(userProfile)
        userProfileSelect.options.remove(idx)
    }
}

function getShownUsers(userProfileSelect: HTMLSelectElement): string[] {
    return Object.values(userProfileSelect.options).map((option: HTMLOptionElement) => { return option.value })
}

function loadUser(): void {
    const user = userProfileSelect.value
    const { to, from } = getUserSettings(user, savedata)
    toCurSelect.value = to
    fromCurSelect.value = from
}

function deleteUser(): void {
    const user = userProfileSelect.value
    if (Object.keys(savedata.users).length > 1) {
        delete savedata.users[user]
        if (savedata.defaultUser == user) {
            savedata.defaultUser = Object.keys(savedata.users)[0]
        }
        updateUserSelectOptions(userProfileSelect, savedata)

        saveData()
        userProfileSelect.value = savedata.defaultUser
        loadUser()
    } else {
        alert("You can not delete the last user")
    }
}

function addNewUser(): void {
    const to = toCurSelect.value as Currency
    const from = fromCurSelect.value as Currency
    let newUser: string | null = "";
    const currentUsers = Object.keys(savedata.users)
    while (newUser == "" || currentUsers.includes(newUser)) {
        newUser = window.prompt('Enter new user name: ')
        if (!newUser) {
            // End function, No new user created
            return
        }
    }
    updateUserSettings(newUser, to, from, savedata)
    updateUserSelectOptions(userProfileSelect, savedata)
    saveData()
    userProfileSelect.value = newUser
}

function setDefaultUser(): void {
    const user = userProfileSelect.value
    savedata.defaultUser = user
    saveData()
}

async function setup(): Promise<void> {
    try {
        const savejson = window.localStorage.getItem(savepoint)
        if (savejson) {
            savedata = JSON.parse(savejson)
            if (savedata.rates.time_next_update_unix <= getCurrentEpoch()) {
                updateRates(savedata.rates)
            }
        } else {
            savedata = {
                users: {
                    'Default User': {
                        from: 'USD',
                        to: 'NZD',
                    }
                },
                defaultUser: 'Default User',
                rates: defaultConvertData
            }
            updateRates(savedata.rates)
        }

        window.localStorage[savepoint] = JSON.stringify(savedata)

        fromCurSelect.innerHTML = ""
        toCurSelect.innerHTML = ""

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

        for (let userProfile of Object.keys(savedata.users)) {
            const user = document.createElement('option')
            user.value = userProfile
            user.text = userProfile
            userProfileSelect.appendChild(user)
        }

        userProfileSelect.value = savedata.defaultUser
        fromCurSelect.value = savedata.users[savedata.defaultUser].from
        toCurSelect.value = savedata.users[savedata.defaultUser].to

        fromCurSelect.addEventListener("change", convertAmount)
        fromValInput.addEventListener("input", convertAmount)
        toCurSelect.addEventListener("change", convertAmount)
        salesTaxInput.addEventListener("input", convertAmount)
        userProfileSelect.addEventListener("change", loadUser)
        userProfileSelect.addEventListener("change", convertAmount)
        saveUserButton.addEventListener("click", saveUser)
        deleteUserButton.addEventListener("click", deleteUser)
        setDefaultUserButton.addEventListener("click", setDefaultUser)
        addNewUserButton.addEventListener("click", addNewUser)
    } catch {
        window.localStorage.removeItem(savepoint)
        setup()
    }
}

function convertAmount(): void {
    const fromCur = fromCurSelect.value as Currency
    const toCur = toCurSelect.value as Currency
    const tax = Number.parseFloat(salesTaxInput.value) / 100 || 0 // convert percentage to decimal
    const value = Number.parseFloat(fromValInput.value) || 0
    const nonConvertedTotalAmount = addSalesTax(value, tax)
    toValInput.value = convert(fromCur, toCur, nonConvertedTotalAmount).toString()
}

function addSalesTax(amount: number, tax: number): number {
    return amount + amount * tax
}

function convert(from: Currency, to: Currency, value: number): number {
    return roundTo(value * savedata.rates.rates[to] / savedata.rates.rates[from], 2)
}

function getCurrentEpoch(): number {
    return Math.round(new Date().getTime() / 1000)
}

async function getRates(): Promise<ConvertDataI | null> {
    try {
        return await (await fetch('https://open.exchangerate-api.com/v6/latest')).json()
    } catch (err) {
        return null
    }
}

async function updateRates(data: ConvertDataI): Promise<void> {
    const results = await getRates()
    if (results !== null) {
        data = results
    } else {
        // Notify user that conversion rates have not been updated since ...
    }
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