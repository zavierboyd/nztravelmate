"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const fromCurSelect = document.querySelector('select#fromCur');
const toCurSelect = document.querySelector('select#toCur');
const fromValInput = document.querySelector('input#fromVal');
const toValInput = document.querySelector('input#toVal');
const salesTaxInput = document.querySelector('input#salesTax');
const savepoint = 'conversion-save-1605044723';
let savedata;
function getCurrentEpoch() {
    return Math.round(new Date().getTime() / 1000);
}
function getRates() {
    return __awaiter(this, void 0, void 0, function* () {
        return yield (yield fetch('https://open.exchangerate-api.com/v6/latest')).json();
    });
}
function setup() {
    return __awaiter(this, void 0, void 0, function* () {
        const savejson = window.localStorage.getItem(savepoint);
        if (savejson) {
            savedata = JSON.parse(savejson);
            if (savedata.rates.time_next_update_unix <= getCurrentEpoch()) {
                savedata.rates = yield getRates();
            }
        }
        else {
            savedata = {
                from: 'USD',
                to: 'NZD',
                rates: yield getRates()
            };
        }
        window.localStorage[savepoint] = JSON.stringify(savedata);
        for (let currency of Object.keys(savedata.rates.rates)) {
            const option1 = document.createElement('option');
            option1.value = currency;
            option1.text = currency;
            const option2 = document.createElement('option');
            option2.value = currency;
            option2.text = currency;
            fromCurSelect.appendChild(option1);
            toCurSelect.appendChild(option2);
        }
        fromCurSelect.value = savedata.from;
        toCurSelect.value = savedata.to;
        fromCurSelect.addEventListener("change", convertAmount);
        fromValInput.addEventListener("input", convertAmount);
        toCurSelect.addEventListener("change", convertAmount);
        salesTaxInput.addEventListener("input", convertAmount);
    });
}
function convertAmount() {
    const fromCur = fromCurSelect.value;
    const toCur = toCurSelect.value;
    const tax = Number.parseFloat(salesTaxInput.value) / 100 || 0; // convert percentage to decimal
    const value = Number.parseFloat(fromValInput.value);
    const nonConvertedTotalAmount = addSalesTax(value, tax);
    toValInput.value = convert(fromCur, toCur, nonConvertedTotalAmount).toString();
}
function addSalesTax(amount, tax) {
    return amount + amount * tax;
}
function convert(from, to, value) {
    return roundTo(value * savedata.rates.rates[to] / savedata.rates.rates[from], 2);
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
function roundTo(value, decimalPlaces) {
    const offset = Math.pow(10, decimalPlaces);
    // Moves the decimal point back <decimalPlaces> 
    // rounds the value 
    // then Moves the decimal point to where it was originally
    // Number.EPSILON is added so that values like 1.005 are correctly rounded to 1.01 instead of 1
    return Math.round((value + Number.EPSILON) * offset) / offset;
}
setup();
