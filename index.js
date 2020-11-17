"use strict";
// Setup Constants for the program
const fromCurSelect = document.getElementById('fromCur');
const toCurSelect = document.getElementById('toCur');
const fromValInput = document.getElementById('fromVal');
const toValInput = document.getElementById('toVal');
const salesTaxInput = document.getElementById('salesTax');
const saveUserButton = document.getElementById('saveUser');
const deleteUserButton = document.getElementById('deleteUser');
const setDefaultUserButton = document.getElementById('defaultUser');
const addNewUserButton = document.getElementById('addNewUser');
const userProfileSelect = document.getElementById('userProfile');
const errorMsgDiv = document.getElementById("errorMsg");
const durationExpiredSpan = document.getElementById("duration");
const savepoint = 'conversion-save-1605044723';
const defaultConvertData = {
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
};
// Initialise Global Variables
let savedata;
// HTML Listeners
function saveData() {
    window.localStorage.setItem(savepoint, JSON.stringify(savedata));
}
function saveUser() {
    const to = toCurSelect.value;
    const from = fromCurSelect.value;
    let user = userProfileSelect.value;
    updateUserSettings(user, to, from, savedata);
    updateUserSelectOptions(userProfileSelect, savedata);
    saveData();
}
function loadUser() {
    const user = userProfileSelect.value;
    const { to, from } = getUserSettings(user, savedata);
    toCurSelect.value = to;
    fromCurSelect.value = from;
}
function deleteUser() {
    const user = userProfileSelect.value;
    // Stop delete if there is only one user left
    if (Object.keys(savedata.users).length > 1) {
        delete savedata.users[user];
        if (savedata.defaultUser == user) {
            savedata.defaultUser = Object.keys(savedata.users)[0];
        }
        updateUserSelectOptions(userProfileSelect, savedata);
        saveData();
        userProfileSelect.value = savedata.defaultUser;
        loadUser();
    }
    else {
        alert("You can not delete the last user");
    }
}
function addNewUser() {
    const to = toCurSelect.value;
    const from = fromCurSelect.value;
    let newUser = "";
    const currentUsers = Object.keys(savedata.users);
    // Enter a new username that is not already used
    while (newUser == "" || currentUsers.includes(newUser)) {
        newUser = window.prompt('Enter new user name: ');
        if (!newUser) {
            // End function, No new user created
            return;
        }
    }
    updateUserSettings(newUser, to, from, savedata);
    updateUserSelectOptions(userProfileSelect, savedata);
    saveData();
    userProfileSelect.value = newUser;
}
function setDefaultUser() {
    const user = userProfileSelect.value;
    savedata.defaultUser = user;
    saveData();
}
function convertAmount() {
    const fromCur = fromCurSelect.value;
    const toCur = toCurSelect.value;
    const tax = Number.parseFloat(salesTaxInput.value) / 100 || 0; // convert percentage to decimal. If there is no value, tax = 0
    const amount = Number.parseFloat(fromValInput.value) || 0; // If there is no value, amount = 0
    const nonConvertedTotalAmount = addSalesTax(amount, tax);
    toValInput.value = convert(fromCur, toCur, nonConvertedTotalAmount, savedata.rates).toString(); // write total to output
}
function canNotUpdateWarning() {
    const durationNotUpdatedSeconds = getCurrentEpoch() - savedata.rates.time_next_update_unix;
    const durationNotUpdatedDays = Math.floor(durationNotUpdatedSeconds / 60 / 60 / 24); // convert to days
    if (durationNotUpdatedDays > 0) {
        durationExpiredSpan.innerHTML = `${durationNotUpdatedDays} day${durationNotUpdatedDays > 1 ? 's' : ''}`;
        errorMsgDiv.classList.remove("is-hidden");
    }
}
// Startup Program
async function setupApp() {
    try {
        // Loads data from localStorage
        const savejson = window.localStorage.getItem(savepoint);
        if (savejson) {
            savedata = JSON.parse(savejson);
            // Update rates if update is available
            if (savedata.rates.time_next_update_unix <= getCurrentEpoch()) {
                updateRates(savedata, canNotUpdateWarning).then(() => { console.log("gets to then"); saveData(); });
                // After try update save current data state
            }
        }
        else {
            savedata = {
                users: {
                    'Default User': {
                        from: 'USD',
                        to: 'NZD',
                    }
                },
                defaultUser: 'Default User',
                rates: defaultConvertData
            };
            // Try to update rates if possible
            updateRates(savedata, canNotUpdateWarning).then(() => { console.log("gets to then"); saveData(); });
            // After try update save current data state
        }
        // Populate and initialise HTML Elements
        fromCurSelect.innerHTML = "";
        toCurSelect.innerHTML = "";
        userProfileSelect.innerHTML = "";
        populateCurrencyOptions(fromCurSelect, savedata);
        populateCurrencyOptions(toCurSelect, savedata);
        updateUserSelectOptions(userProfileSelect, savedata);
        userProfileSelect.value = savedata.defaultUser;
        fromCurSelect.value = savedata.users[savedata.defaultUser].from;
        toCurSelect.value = savedata.users[savedata.defaultUser].to;
        // Setup HTML interactivity
        fromCurSelect.addEventListener("change", convertAmount);
        fromValInput.addEventListener("input", convertAmount);
        toCurSelect.addEventListener("change", convertAmount);
        salesTaxInput.addEventListener("input", convertAmount);
        userProfileSelect.addEventListener("change", loadUser);
        userProfileSelect.addEventListener("change", convertAmount);
        saveUserButton.addEventListener("click", saveUser);
        deleteUserButton.addEventListener("click", deleteUser);
        setDefaultUserButton.addEventListener("click", setDefaultUser);
        addNewUserButton.addEventListener("click", addNewUser);
    }
    catch {
        window.localStorage.removeItem(savepoint);
        setupApp();
    }
}
setupApp();
