const apiUrl = "https://open.exchangerate-api.com/v6/latest";
const $currencyFromSelect = document.getElementById("currency-from");
const $currencyToSelect = document.getElementById("currency-to");
const $amountFromInput = document.getElementById("amount-from");
const $amountToInput = document.getElementById("amount-to");
const $swapBtn = document.getElementById("swapBtn");
const $rate = document.getElementById("rate");


const swapCurrency = () => {
    [$currencyFromSelect.value, $currencyToSelect.value] = [$currencyToSelect.value, $currencyFromSelect.value];
    [$amountFromInput.value, $amountToInput.value] = [$amountToInput.value, $amountFromInput.value];
    updateCurrencyData();
}

const calcurateCurrency = (amountFrom, currencyFrom, currencyTo, rates) => {
    const rateFrom = rates[currencyFrom];
    const rateTo = rates[currencyTo];
    return amountFrom * (rateTo / rateFrom);
}

const updateCurrencyData = async () => {
    const amountFrom = parseFloat($amountFromInput.value);
    const currencyFrom = $currencyFromSelect.value;
    const currencyTo = $currencyToSelect.value;

    if (isNaN(amountFrom) || !currencyFrom || !currencyTo) {
        alert("값을 입력하고, 통화를 선택해주세요.");
        return;
    }

    try {
        const rates = await fetchExchangeRates();
        const amountTo = calcurateCurrency(amountFrom, currencyFrom, currencyTo, rates);
        const exchangeRate = rates[currencyTo] / rates[currencyFrom];
        $amountToInput.value = amountTo;
        $rate.textContent = `1 ${currencyFrom} = ${exchangeRate.toFixed(2)} ${currencyTo}`;
    } catch (error) {
        console.error(error);
        alert("환율 정보를 가져오는 데 실패했습니다.");
    }
}

const initializeCurrencySelect = (selectEle, rates) => {
    for (currency in rates) {
        const option = document.createElement("option");
        option.value = currency;
        option.textContent = currency;
        selectEle.appendChild(option);
    }
}

const fetchExchangeRates = async () => {
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error("환율 정보를 가져오는 데 실패했습니다.");
        }
        const data = await response.json();
        console.log(data.rates);
        return data.rates;
    } catch (error) {
        console.error(error);
        alert("환율 정보를 가져오는 데 실패했습니다.");
    }
}

const initialize = async () => {
    const rates = await fetchExchangeRates();
    if (rates) {
        initializeCurrencySelect($currencyFromSelect, rates);
        initializeCurrencySelect($currencyToSelect, rates);
    }

    $currencyFromSelect.addEventListener("change", updateCurrencyData);
    $currencyToSelect.addEventListener("change", updateCurrencyData);
    $amountFromInput.addEventListener("input", updateCurrencyData);
    $swapBtn.addEventListener("click", swapCurrency);
    updateCurrencyData();
}

initialize();