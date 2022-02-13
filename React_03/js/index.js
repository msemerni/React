let at = atob ( 'eyJzdWIiOnsiaWQiOiI2MjA3OTc4ZGY5YmUxMDJmNDliMmNjYmIiLCJsb2dpbiI6Im1zZW1lcm5pIiwiYWNsIjpbIjYyMDc5NzhkZjliZTEwMmY0OWIyY2NiYiIsInVzZXIiXX0sImlhdCI6MTY0NDY2NTAxNH0');
console.log(at);
// let ff = JSON.parse(at);
// console.log(ff);

// const getGQL = url =>
//     (query, variables = {}) =>
//     fetch(url, {
//         method: "POST",
//         headers: {
//             //нужен тип контента
//             //+ 
//         },
//         body: // согласно тому, что шлет песочница

//     }).then(res => res.json())

//     const gql














// // запись ключа SHOW_NOTIFICATIONS со значением true
// localStorage.setItem('SHOW_NOTIFICATIONS', false);
// localStorage.SHOW_NOTIFICATIONS = true;
// // // проверка наличия ключа и чтение его значения
// if(localStorage.getItem('SHOW_NOTIFICATIONS'))
//   alert(`SHOW_NOTIFICATIONS value: ${localStorage.getItem('SHOW_NOTIFICATIONS')}`);
// // // удаление ключа и его значения
// localStorage.removeItem('SHOW_NOTIFICATIONS');
// // // удаление всех пар ключ/значение из хранилища
// localStorage.clear();

// let result = new Promise((resolve, reject) => {
//     let value = Math.round(Math.random());
     
//     setTimeout(() => {
//        if(value)
//          resolve(value);
//        else
//          reject(value);
//      }, 1000);
//     });
    
//     result
//       .then(result => console.log('Success: ', result))
//       .catch(error => console.log('Error: ', error))
//       .finally(() => console.log('JavaScript Promise finished'));
    


    //   let result = new Promise((resolve, reject) => {
    //     console.log('Promise executing');
        
    //     resolve('webdraftt');
    //   });
      
    //   result
    //   .then(result => console.log('Result: ', result + 123));
      

    //   setTimeout(() => 
    //   result
    //   .then(result => console.log('Again: ', result)), 1000);


// let promise1 = new Promise((resolve, reject) => setTimeout(() => resolve(1), 1000));
// let promise2 = new Promise((resolve, reject) => setTimeout(() => resolve(2), 1500));
// let promise3 = new Promise((resolve, reject) => setTimeout(() => resolve(3), 500));

// //выведет [1, 2, 3] через 1500 мс
// Promise.all([promise1, promise2, promise3]).then(result => console.log(result));