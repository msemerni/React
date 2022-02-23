// let at = atob ( 'eyJzdWIiOnsiaWQiOiI2MjA3OTc4ZGY5YmUxMDJmNDliMmNjYmIiLCJsb2dpbiI6Im1zZW1lcm5pIiwiYWNsIjpbIjYyMDc5NzhkZjliZTEwMmY0OWIyY2NiYiIsInVzZXIiXX0sImlhdCI6MTY0NDY2NTAxNH0');
// console.log(at);
// let ff = JSON.parse(at);
// console.log(ff);
  
function createStore(reducer){
    let state       = reducer(undefined, {}) //стартовая инициализация состояния, запуск редьюсера со state === undefined
    let cbs         = []                     //массив подписчиков
    
    const getState  = () => state            //функция, возвращающая переменную из замыкания
    const subscribe = cb => (cbs.push(cb),   //запоминаем подписчиков в массиве
                             () => cbs = cbs.filter(c => c !== cb)) //возвращаем функцию unsubscribe, которая удаляет подписчика из списка
                             
    const dispatch  = action => { 
        if (typeof action === 'function'){ //если action - не объект, а функция
            return action(dispatch, getState) //запускаем эту функцию и даем ей dispatch и getState для работы
        }
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
  
  function promiseReducer(state={}, {type, name, status, payload, error}){
    if (type === 'PROMISE'){
        return {
            ...state,
            [name]:{status, payload, error}
        }
    }
    return state
  }
  
  const store = createStore(cartReducer) //не забудьте combineReducers если он у вас уже есть
//   const store = createStore(promiseReducer) //не забудьте combineReducers если он у вас уже есть
  //const store = createStore(combineReducers({promise: promiseReducer, auth: authReducer, cart: cartReducer}))
  store.subscribe(() => console.log(store.getState()));
  
  
  const actionPending             = name => ({type:'PROMISE',name, status: 'PENDING'})
  const actionFulfilled = (name,payload) => ({type:'PROMISE',name, status: 'FULFILLED', payload})
  const actionRejected  = (name,error)   => ({type:'PROMISE',name, status: 'REJECTED', error})
  const actionPromise = (name, promise) =>
    async dispatch => {
        dispatch(actionPending(name))
        try {
            let payload = await promise
            dispatch(actionFulfilled(name, payload))
            return payload
        }
        catch(error){
            dispatch(actionRejected(name, error))
        }
    }
  
  const getGQL = url =>
    (query, variables) => fetch(url, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            ...(localStorage.authToken ? {"Authorization": "Bearer " + localStorage.authToken} : {})
        },
        body: JSON.stringify({query, variables})
    }).then(res => res.json())
        .then(data => {
            if (data.data){
                return Object.values(data.data)[0] 
            } 
            else throw new Error(JSON.stringify(data.errors))
        })
  
  const backendURL = 'http://shop-roles.asmer.fs.a-level.com.ua'
  
  const gql = getGQL(backendURL + '/graphql')
  
  const actionRootCats = () => 
    actionPromise('rootCats', gql(`query {
        CategoryFind(query: "[{\\"parent\\":null}]"){
            _id name
        }
    }`))
  
  const actionCatById = (_id) =>  //добавить подкатегории
    actionPromise('catById', gql(`query catById($q: String){
        CategoryFindOne(query: $q){
            _id name goods {
                _id name price images {
                    url
                }
            }
        }
    }`, {q: JSON.stringify([{_id}])}))
  
  store.dispatch(actionRootCats())
  
  
  
  const actionGoodById = (_id) =>  //добавить подкатегории
    actionPromise('goodById', gql(`query goodById($q1:String){
      GoodFindOne(query: $q1){
        _id name images{
          url
        }
                  
        
      }
    }   `, {q1: JSON.stringify([{_id}])}))
  
  
  const actionOrders = () =>
  actionPromise('orders', gql(`query orders {
      OrderFind(query: "[{}]"){
        total
        orderGoods{
          count good{
            name _id
          }
        }
      }
    }   `))
  
  
  
  
  
  
  
  store.subscribe(() => {
    const {rootCats} = store.getState()
    if (rootCats?.payload){
        aside.innerHTML = ''
        for (const {_id, name} of rootCats.payload){
            const link      = document.createElement('a')
            link.href       = `#/category/${_id}`
            link.innerText  = name
            aside.append(link)
        }
    }
  })
  
  window.onhashchange = () => {
    const [, route, _id] = location.hash.split('/')
  
    const routes = {
        category(){
            store.dispatch(actionCatById(_id))
        },
        good(){ //задиспатчить actionGoodById
          store.dispatch(actionGoodById(_id))
        },
        login(){
            //отрисовка тут
            //по кнопке - store.dispatch(actionFullLogin(login, password))
        },
        register(){
            //отрисовка тут
            //по кнопке - store.dispatch(actionFullRegister(login, password))
        },
        dashboard(){ //#/dashboard
          store.dispatch(actionOrders())
        },
        cart(){ //#/cart
            //отрисовка корзины
            //по типу http://shop.asmer.fe.a-level.com.ua/cart
            //по тем или иным событиям диспатчить:
            //actionCartChange
            //actionCartDelete
            //actionCartClear ?
            //проследите что бы кошик тоже походу менялся
            //кому скучно - сделать оформление заказа:
            //  по кнопке сделать actionOrder
            //  который thunk,
            //  который забирает текущую корзину
            //  формирует правильные данные для OrderUpsert
            //  диспатчит actionPromise
            //  диспатчит actionCartClear
        }
    }
    if (route in routes)
        routes[route]()
  }
  
  
  window.onhashchange()
  
  
  store.subscribe(() => {
    const {catById} = store.getState()
    const [,route, _id] = location.hash.split('/')
    if (catById?.payload && route === 'category'){
        const {name} = catById.payload 
        main.innerHTML = `<h1>${name}</h1> ТУТ ДОЛЖНЫ БЫТЬ ПОДКАТЕГОРИИ`
        for (const {_id, name, price, images} of catById.payload.goods){
            const card      = document.createElement('div')
            card.innerHTML = `<h2>${name}</h2>
                              <img src="${backendURL}/${images[0].url}" />
                              <strong>${price}</strong>
                             
                              А ТАК ЖЕ КНОПКА Купить, которая диспатчит actionCartAdd
                              <a href = "#/good/${_id}">${name}</a>
                                `
            main.append(card)
        }
    }
  })
  
  store.subscribe(() => {
    const {goodById} = store.getState()
    const [,route, _id] = location.hash.split('/')
    if (goodById?.payload && route === 'good'){
      const {name, images} = goodById.payload
      main.innerHTML = `<h1>${name}</h1>
                       <img src="${backendURL}/${images[0].url}" />
      `
    }
   
  })
  
  store.subscribe(() => {
    //достаем всю корзину
    //считаем общее количество всех позиций (3 айфона + 7 пицц = 10)
    //выводим число в кошик на странице через его HTML id
  })
  
  
  //store.dispatch(actionPromise('delay1000', delay(1000)))
  //store.dispatch(actionPromise('delay2000', delay(2000)))
  //store.dispatch(actionPromise('failedfetch', fetch('https://swapi.dev/api/people/1/')
  //.then(res => res.json())))
  
  function cartReducer(state={}, {type, good, count=1}){
    //{
    //  _id1: {good, count}
    //  _id2: {good, count}
    //}
    const types = {
        CART_ADD(){
           return{   
             ...state,
          
          //как CHANGE, только если ключ раньше был, то достать из count и добавить
                    //к count из action. Если не было, достать 0 и добавить к count из action
           }
        },
        CART_REMOVE(){ //смочь скопировать объект и выкинуть ключ. как вариант через
                        //деструктуризацию
        },
        CART_CHANGE(){
            return {
                ...state,
                [good.id]: {good, count: count}  //по аналогии с promiseReducer дописать
            }
        },
        CART_CLEAR(){
            return {}
        },
    }
  
    if (type in types)
        return types[type]()
  
  
    return state
  }
  
  // const actionCartAdd = (good, count = 1) => ({type: CART_ADD, good, count});
  const actionCartChange = (good, count) => ({type: 'CART_CHANGE', good, count});
  // const actionCartDelete = (good) => ({type: CART_CLEAR, good});
  // const actionCartClear = () => ({});
  
//   const combineReducers = () => (state={}, action={}) => {
//       const newState = {};
//       for (const [reducerName, reducer] of Object.entries(reducers)){
//         let substate = reducer(state[reducerName], action)
//         if(substate !== state) {
//             return
//         } else {
//             return state;
//         }
//       }
//   }
  
  
  const cardStore = createStore(cartReducer);
  
  store.dispatch(actionCartChange({_id: 'пиво'}, 75));
  
  
  
  
  
  
  
  
  // // cardStore.subscribe(() =>console.log.getState())
  // // store.subscribe(() => console.log(store.getState()));

