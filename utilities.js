"use strict";
// User Profile Utility Functions
function updateUserSettings(user, to, from, savedata) {
    savedata.users[user] = { to, from };
}
function getUserSettings(user, savedata) {
    return savedata.users[user];
}
function updateUserSelectOptions(userProfileSelect, savedata) {
    const usersShown = getShownUsers(userProfileSelect);
    const users = Object.keys(savedata.users);
    const usersToShow = users.filter((user) => {
        return !usersShown.includes(user);
    }); // List of users that are not yet shown but do exist 
    const usersToHide = usersShown.filter((user) => {
        return !users.includes(user);
    }); // List of users that were shown but are now non existant
    // Add options for users not currently shown
    for (let userProfile of usersToShow) {
        const user = document.createElement('option');
        user.value = userProfile;
        user.text = userProfile;
        userProfileSelect.appendChild(user);
    }
    // Remove options for users that no longer exist
    for (let userProfile of usersToHide) {
        for (let i = userProfileSelect.options.length - 1; i >= 0; i--) {
            if (userProfileSelect.options[i].value == userProfile) {
                userProfileSelect.options.remove(i);
            }
        }
    }
}
function getShownUsers(userProfileSelect) {
    return Object.values(userProfileSelect.options).map((option) => { return option.value; });
}
// Conversion and Tax Utility Functions
function addSalesTax(amount, tax) {
    return amount + amount * tax;
}
function convert(from, to, value, conversionData) {
    return roundTo(value * conversionData.rates[to] / conversionData.rates[from], 2);
}
function populateCurrencyOptions(selectElement, savedata) {
    for (let currency of Object.keys(savedata.rates.rates)) {
        const option = document.createElement('option');
        option.value = currency;
        option.text = currency;
        selectElement.appendChild(option);
    }
}
// Time Utility Functions
function getCurrentEpoch() {
    return Math.round(new Date().getTime() / 1000);
}
// API Request Funtions
async function getRates() {
    try { // If the request fails return null
        return await (await fetch('https://open.exchangerate-api.com/v6/latest')).json();
    }
    catch (err) {
        return null;
    }
}
async function updateRates(dataPointer, errorHandler) {
    const results = await getRates();
    if (results !== null) { // Update results if possible
        dataPointer.rates = results;
    }
    else {
        errorHandler();
    }
}
// Math Utility Functions
function roundTo(value, decimalPlaces) {
    const offset = 10 ** decimalPlaces;
    // Moves the decimal point back <decimalPlaces> 
    // rounds the value 
    // then moves the decimal point to where it was originally
    // Number.EPSILON is added so that values like 1.005 are correctly rounded to 1.01 instead of 1
    return Math.round((value + Number.EPSILON) * offset) / offset;
}
