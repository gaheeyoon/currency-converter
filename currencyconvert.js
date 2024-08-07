const apiUrl = "https://open.exchangerate-api.com/v6/latest";
const recommandList = [
    { country: '한국', currency: 'KRW' },
    { country: '미국', currency: 'USD' },
    { country: '유로존', currency: 'EUR' },
    { country: '일본', currency: 'JPY' },
    { country: '영국', currency: 'GBP' },
    { country: '캐나다', currency: 'CAD' },
    { country: '호주', currency: 'AUD' },
    { country: '중국', currency: 'CNY' }
];
const $currencyFromSelect = document.getElementById("currency-from");
const $currencyToSelect = document.getElementById("currency-to");
const $amountFromInput = document.getElementById("amount-from");
const $amountToInput = document.getElementById("amount-to");
const $swapBtn = document.getElementById("swapBtn");
const $recommandListFromUl = document.querySelector(".recommandList.from");
const $recommandListToUl = document.querySelector(".recommandList.to");
const $recommandListLis = document.querySelectorAll(".recommandList li");
const $rate = document.getElementById("rate");


const changeCurrency = (selectEle, currency) => {
    selectEle.value = currency;
    selectEle.dispatchEvent(new Event('change'));
}

const saveCurrencyToLocalStorage = () => {
    localStorage.setItem("currencyFrom", $currencyFromSelect.value);
    localStorage.setItem("currencyTo", $currencyToSelect.value);
};

const loadCurrencyFromLocalStorage = () => {
    const currencyFrom = localStorage.getItem("currencyFrom") || "KRW";
    const currencyTo = localStorage.getItem("currencyTo") || "USD";
    return { currencyFrom, currencyTo };
};

const swapCurrency = () => {
    [$currencyFromSelect.value, $currencyToSelect.value] = [$currencyToSelect.value, $currencyFromSelect.value];
    [$amountFromInput.value, $amountToInput.value] = [$amountToInput.value, $amountFromInput.value];
    saveCurrencyToLocalStorage();
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
        saveCurrencyToLocalStorage();
    } catch (error) {
        console.error(error);
        alert("환율 정보를 가져오는 데 실패했습니다.");
    }
}

const initializeCurrencySelect = (selectEle, rates, selectedCurrency) => {
    for (currency in rates) {
        const option = document.createElement("option");
        option.value = currency;
        if (currency === selectedCurrency) {
            option.selected = true;
        }
        option.textContent = currency;
        selectEle.appendChild(option);
    }
}

const initializeRecommandList = (ulEle, selectElm) => {
    const fragment = document.createDocumentFragment();
    
    recommandList.forEach(({ country, currency }) => {
        const li = document.createElement("li");
        li.setAttribute("data-currency", currency);
        li.onclick = () => changeCurrency(selectElm, currency);
        li.textContent = `${country} (${currency})`;
        fragment.appendChild(li);
    });

    ulEle.appendChild(fragment); 
};

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
        const { currencyFrom, currencyTo } = loadCurrencyFromLocalStorage();
        initializeCurrencySelect($currencyFromSelect, rates, currencyFrom);
        initializeCurrencySelect($currencyToSelect, rates, currencyTo);
    }

    initializeRecommandList($recommandListFromUl, $currencyFromSelect);
    initializeRecommandList($recommandListToUl, $currencyToSelect);

    $currencyFromSelect.addEventListener("change", updateCurrencyData);
    $currencyToSelect.addEventListener("change", updateCurrencyData);
    $amountFromInput.addEventListener("input", updateCurrencyData);
    $swapBtn.addEventListener("click", swapCurrency);
    updateCurrencyData();
}

initialize();