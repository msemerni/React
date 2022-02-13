//статус
//данные
//ошибка
function promiseReducer(state={}, action){
    const {type, status, payload, error, name} = action
    //{
    //name1: {status, payload, error}
    //name2: {status, payload, error}
    //name3: {status, payload, error}
    //}
    if (type === 'PROMISE'){
        return {
            //смочь скопировать старый state
            //смочь поменять ключ в объекте, который заранее не известен и лежит в переменной name
            //значение ключа всегда {status, payload, error}
            ...state,
            [name]: {status, payload, error}
            ///// тоже самое: 
            // [name]: {status: status, payload: payload, error: error}
            //[name]: {"status": status, "payload": payload, "error": error}
        }
    }
    return state
}

const store = createStore(promiseReducer)
store.subscribe(() => console.log(store.getState()))

const actionPending   = name => ({type: 'PROMISE', status: 'PENDING', name} )
const actionFulfilled = (name, payload) => ({type: 'PROMISE', status: 'FULFILLED', name, payload})
const actionRejected = (name, error) => ({type: 'PROMISE', status: 'REJECTED', name, error})

const delay = ms => new Promise(ok => setTimeout(() => ok(ms), ms))

store.dispatch(actionPending('delay1000'))//0 {delay1000: {status: 'PENDING'}}
delay(1000).then(result => store.dispatch(actionFulfilled('delay1000', result)),
// 2 {delay1000: {status: 'FULFILLED', payload: 1000}, delay2000: {status: 'PENDING'}}
                 error  => store.dispatch(actionRejected('delay1000', error)))

store.dispatch(actionPending('delay2000'))//1 {delay1000: {status: 'PENDING'}, delay2000: {status: 'PENDING'}}
delay(2000).then(result => store.dispatch(actionFulfilled('delay2000', result)),
// 3 {delay1000: {status: 'FULFILLED', payload: 1000}, delay2000: {status: 'FULLFILLED' ,payload: 2000}}
                 error  => store.dispatch(actionRejected('delay2000', error)))


///////
function createStore(reducer){
    let state       = reducer(undefined, {}) //стартовая инициализация состояния, запуск редьюсера со state === undefined
    let cbs         = []                     //массив подписчиков
    
    const getState  = () => state            //функция, возвращающая переменную из замыкания
    const subscribe = cb => (cbs.push(cb),   //запоминаем подписчиков в массиве
                             () => cbs = cbs.filter(c => c !== cb)) //возвращаем функцию unsubscribe, которая удаляет подписчика из списка
                             
    const dispatch  = action => { 
        const newState = reducer(state, action) //пробуем запустить редьюсер
        if (newState !== state){ //проверяем, смог ли редьюсер обработать action
            state = newState //если смог, то обновляем state 
            for (let cb of cbs)  cb() //и запускаем подписчиков
        }
    }
    
    return {
        getState, //добавление функции getState в результирующий объект
        dispatch,
        subscribe //добавление subscribe в объект
    }
}

