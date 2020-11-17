"use strict";
mocha.setup({
    ui: 'bdd',
    reporter: "html"
});
mocha.checkLeaks();
const baseData = {
    defaultUser: "default",
    users: {
        default: {
            to: "USD",
            from: "NZD"
        }
    },
    rates: {
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
            USD: 0,
            AED: 0,
            ARS: 0,
            AUD: 0,
            BGN: 0,
            BRL: 0,
            BSD: 0,
            CAD: 0,
            CHF: 0,
            CLP: 0,
            CNY: 0,
            COP: 0,
            CZK: 0,
            DKK: 0,
            DOP: 0,
            EGP: 0,
            EUR: 0,
            FJD: 0,
            GBP: 0,
            GTQ: 0,
            HKD: 0,
            HRK: 0,
            HUF: 0,
            IDR: 0,
            ILS: 0,
            INR: 0,
            ISK: 0,
            JPY: 0,
            KRW: 0,
            KZT: 0,
            MVR: 0,
            MXN: 0,
            MYR: 0,
            NOK: 0,
            NZD: 0,
            PAB: 0,
            PEN: 0,
            PHP: 0,
            PKR: 0,
            PLN: 0,
            PYG: 0,
            RON: 0,
            RUB: 0,
            SAR: 0,
            SEK: 0,
            SGD: 0,
            THB: 0,
            TRY: 0,
            TWD: 0,
            UAH: 0,
            UYU: 0,
            ZAR: 0
        }
    }
};
function deepCopySimple(o) {
    return JSON.parse(JSON.stringify(o));
}
const assert = chai.assert;
describe('Conversion and Tax', function () {
    describe('Convert', function () {
        it('should convert 1 USD to 2 AED with an exchange rate of USD -> AED of 2', function () {
            const data = deepCopySimple(baseData);
            data.rates.rates.USD = 1;
            data.rates.rates.AED = 2;
            assert.equal(convert("USD", "AED", 1, data.rates), 2);
        });
        it('should convert 2 AED to 1 USD with an exchange rate of USD -> AED of 2', function () {
            const data = deepCopySimple(baseData);
            data.rates.rates.USD = 1;
            data.rates.rates.AED = 2;
            assert.equal(convert("AED", "USD", 2, data.rates), 1);
        });
        it('should convert 1 ARS to 4 AED with an exchange rate of USD -> ARS of 0.5 and USD -> AED of 2', function () {
            const data = deepCopySimple(baseData);
            data.rates.rates.USD = 1;
            data.rates.rates.AED = 2;
            data.rates.rates.ARS = 0.5;
            assert.equal(convert("ARS", "AED", 1, data.rates), 4);
        });
    });
    describe('Sales Tax', function () {
        it('should add on 15% sales tax', function () {
            assert.equal(addSalesTax(1, 0.15), 1.15);
        });
        it('should add on 0% sales tax', function () {
            assert.equal(addSalesTax(1, 0), 1);
        });
        it('should add on 100% sales tax', function () {
            assert.equal(addSalesTax(1, 1), 2);
        });
    });
    describe('Populate Currency Selects', function () {
        it('should add in all listed currencies', function () {
            const data = deepCopySimple(baseData);
            const tester = document.createElement("select");
            populateCurrencyOptions(tester, data);
            assert.exists(tester.options[5]);
            const testerListOfCurrencies = Object.values(tester.options).map((option) => { return option.value; });
            const baseListOfCurrencies = Object.keys(data.rates.rates);
            assert.deepEqual(testerListOfCurrencies, baseListOfCurrencies);
        });
    });
});
describe('User Profiles', function () {
    describe('Update User Settings', function () {
        it('should update the to and from currencies of the user', function () {
            const data = deepCopySimple(baseData);
            const testData = deepCopySimple(baseData);
            updateUserSettings('default', 'NZD', 'USD', testData);
            data.users['default'] = {
                to: 'NZD',
                from: 'USD'
            };
            assert.deepEqual(data, testData);
        });
    });
    describe('Get User Settings', function () {
        it(`should get the user's currency settings`, function () {
            const data = deepCopySimple(baseData);
            data.users['default'] = { to: 'NZD', from: 'USD' };
            assert.deepEqual(getUserSettings('default', data), { to: 'NZD', from: 'USD' });
        });
    });
    describe('Get Shown Users', function () {
        it('should get the users shown on the select element', function () {
            const selectElement = document.createElement('select');
            let option = document.createElement('option');
            option.value = 'user1';
            selectElement.options.add(option);
            option = document.createElement('option');
            option.value = 'user2';
            selectElement.options.add(option);
            option = document.createElement('option');
            option.value = 'user3';
            selectElement.options.add(option);
            assert.deepEqual(getShownUsers(selectElement), ['user1', 'user2', 'user3']);
        });
    });
    describe('Update User Select Options', function () {
        it('should add all users not in the select to the bottom of the options', function () {
            const data = deepCopySimple(baseData);
            data.users = {
                user1: { to: 'USD', from: 'NZD' },
                user2: { to: 'USD', from: 'NZD' },
                user3: { to: 'USD', from: 'NZD' }
            };
            const selectElement = document.createElement('select');
            updateUserSelectOptions(selectElement, data);
            assert.deepEqual(getShownUsers(selectElement), ['user1', 'user2', 'user3']);
        });
        it('should remove all users that no longer exist', function () {
            const data = deepCopySimple(baseData);
            data.users = {
                user1: { to: 'USD', from: 'NZD' }
            };
            const selectElement = document.createElement('select');
            // Add "Users"
            let option = document.createElement('option');
            option.value = 'user1';
            selectElement.options.add(option);
            option = document.createElement('option');
            option.value = 'user2';
            selectElement.options.add(option);
            option = document.createElement('option');
            option.value = 'user3';
            selectElement.options.add(option);
            assert.deepEqual(getShownUsers(selectElement), ['user1', 'user2', 'user3']);
            updateUserSelectOptions(selectElement, data);
            assert.deepEqual(getShownUsers(selectElement), ['user1']);
        });
        it('should add and remove users at the same time', function () {
            const data = deepCopySimple(baseData);
            data.users = {
                user1: { to: 'USD', from: 'NZD' },
                user3: { to: 'USD', from: 'NZD' }
            };
            const selectElement = document.createElement('select');
            // Add "Users"
            let option = document.createElement('option');
            option.value = 'user1';
            selectElement.options.add(option);
            option = document.createElement('option');
            option.value = 'user2';
            selectElement.options.add(option);
            assert.deepEqual(getShownUsers(selectElement), ['user1', 'user2']);
            updateUserSelectOptions(selectElement, data);
            assert.deepEqual(getShownUsers(selectElement), ['user1', 'user3']);
        });
    });
});
describe('Math', function () {
    describe('Rounding', function () {
        it('should round 0.005 to 0.01', function () {
            assert.equal(roundTo(0.005, 2), 0.01);
        });
        it('should round 0.006 to 0.01', function () {
            assert.equal(roundTo(0.006, 2), 0.01);
        });
        it('should round 0.004999999 to 0.00', function () {
            assert.equal(roundTo(0.004999999, 2), 0.00);
        });
    });
});
describe('Exchange Rate API', function () {
    describe('Get Exchange Rates', function () {
        it('should get the exchange rates when internet is on OR null when the internet if off', async function () {
            const data = deepCopySimple(baseData);
            const result = await getRates();
            if (window.navigator.onLine) {
                assert.notEqual(result, null);
                assert.containsAllKeys(result, data.rates);
            }
            else {
                assert.notEqual(result, null);
            }
        });
        it('should contain exchange rates for NZD, AUD, USD, GBP, EUR, and CAD', async function () {
            const result = await getRates();
            if (window.navigator.onLine && result) {
                assert.exists(result.rates.NZD);
                assert.exists(result.rates.AUD);
                assert.exists(result.rates.USD);
                assert.exists(result.rates.GBP);
                assert.exists(result.rates.EUR);
                assert.exists(result.rates.CAD);
            }
        });
    });
    describe('Async Update Conversion Data', function () {
        it('should update the data asyncronosly when internet is on OR leave the data alone if off', async function () {
            const data = deepCopySimple(baseData);
            data.rates.time_last_update_unix = -1;
            await updateRates(data, () => { data.rates.time_last_update_unix = -1; });
            if (window.navigator.onLine) {
                assert.containsAllKeys(data.rates, baseData.rates);
                assert.notDeepEqual(data.rates, baseData.rates);
                assert.notEqual(data.rates.time_last_update_unix, -1);
            }
            else {
                assert.equal(data.rates.time_last_update_unix, -1);
            }
        });
        it('should run the error function when the internet is off', async function () {
            const data = deepCopySimple(baseData);
            data.rates.time_last_update_unix = 1;
            await updateRates(data, () => { data.rates.time_last_update_unix = -1; });
            if (window.navigator.onLine) {
                assert.notEqual(data.rates.time_last_update_unix, -1);
            }
            else {
                assert.equal(data.rates.time_last_update_unix, -1);
            }
        });
    });
});
mocha.run();
