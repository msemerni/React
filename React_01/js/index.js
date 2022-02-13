//////////////////////////////////////////////////////////////////////

function reducer(state, { type, ШО, СКОКА }) { //объект action деструктуризируется на три переменных
    if (!state) { //начальная уборка в ларьке:
         // state = localStorage.setItem("myStore", JSON.stringify(productObj.value));
        return {
            пиво: { цена: 20, количество: 100, касса: 0 },
            чипсы: { цена: 10, количество: 100, касса: 0 },
            сиги: { цена: 50, количество: 100, касса: 0 }
        }
    }

    if (type === 'КУПИТЬ') { //если тип action - КУПИТЬ, то:
        if (state[ШО].количество >= СКОКА) {
            return {
                ...state, //берем все что было из ассортимента
                [ШО]: {
                    цена: state[ШО].цена,
                    количество: state[ШО].количество - СКОКА,
                    касса: state[ШО].касса + (СКОКА * state[ШО].цена)
                }
                
            }

        } else {
            alert(`Столько ${ШО} нет! Осталось ${state[ШО].количество} шт.`)
        }
    }
    return state //если мы не поняли, что от нас просят в `action` - оставляем все как есть
}

//////////////////////////////////////////////////////////////////////

function createStore(reducer) {
    let state = reducer(undefined, {}) //стартовая инициализация состояния, запуск редьюсера со state === undefined
    let cbs = []                     //массив подписчиков

    const getState = () => state            //функция, возвращающая переменную из замыкания
    const subscribe = cb => (cbs.push(cb),   //запоминаем подписчиков в массиве
        () => cbs = cbs.filter(c => c !== cb)) //возвращаем функцию unsubscribe, которая удаляет подписчика из списка

    const dispatch = action => {
        const newState = reducer(state, action) //пробуем запустить редьюсер
        if (newState !== state) { //проверяем, смог ли редьюсер обработать action
            state = newState //если смог, то обновляем state 
            for (let cb of cbs) cb() //и запускаем подписчиков
        }
    }

    return {
        getState, //добавление функции getState в результирующий объект
        dispatch,
        subscribe //добавление subscribe в объект
    }
}
//////////////////////////////////////////////////////////////////////
const store = createStore(reducer)

//запомнит функцию во внутреннем массиве cbs. 
//она будет запущена при любом успешном dispatch 
const unsubscribe = store.subscribe(() => console.log(store.getState()));

// setTimeout(unsubscribe, 10000) //отпишемся через 10 секунд, например

//происходит запуск редьюсера, который создает новый state. 
//dispatch запускает всех подписчиков из массива cbs
// store.dispatch({type: 'КУПИТЬ', ШО: 'пиво', СКОКА: 3}) 

function createSelectOptions() {
    let allItems = store.getState();

    for (item in allItems) {
        console.log(`item: ${item}`);
        let itemOption = document.createElement("option");
        itemOption.innerHTML = item;
        document.getElementById("items").append(itemOption);
    }
}

createSelectOptions();

let btn = document.getElementById("buybtn");
btn.addEventListener('click', () => {
    let itemName = document.getElementById("items").value;
    let itemQuantity = document.getElementById("quantityinput").value;
    store.dispatch({ type: 'КУПИТЬ', ШО: itemName, СКОКА: itemQuantity })

    printTable();
});

printTable();

function printTable() {
    let productObj = store.getState();
    localStorage.setItem("myStore", JSON.stringify(productObj));

    document.getElementById('typePtoduct').innerHTML = ''
    document.getElementById('costProduct').innerHTML = ''
    document.getElementById('amountProduct').innerHTML = ''

    let kassa = [];

    for (const productType in productObj) {
        let tdProduct = document.createElement('td')
        tdProduct.innerHTML = `${productType}`
        document.getElementById('typePtoduct').appendChild(tdProduct)

        let tdCost = document.createElement('td')
        document.getElementById('costProduct').appendChild(tdCost)
        tdCost.innerHTML = `Цена: ${productObj[productType].цена} грн.`

        let tdAmount = document.createElement('td')
        tdAmount.innerHTML = `Остаток: ${productObj[productType].количество}`
        document.getElementById('amountProduct').appendChild(tdAmount)

        kassa.push(productObj[productType].касса)
    }

    let sum = kassa.reduce((acc, value) => acc + value, 0)
    document.getElementById('spanCost').innerHTML = `Касса: ${sum}`
}

