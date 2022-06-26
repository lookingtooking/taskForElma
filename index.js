
let startDate =  1656288000000; // 20 июня 2022
let lastDate;
let executors;
let tasks;

// ~~~~~~~~~~~~~~~~~~~~~~~~~ fetch ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

let urls = [
    'https://varankin_dev.elma365.ru/api/extensions/2a38760e-083a-4dd0-aebc-78b570bfd3c7/script/tasks',
    'https://varankin_dev.elma365.ru/api/extensions/2a38760e-083a-4dd0-aebc-78b570bfd3c7/script/users'
];
let array = urls.map((item) => {
  return fetch(item).then(function(response) {
    return response.json();
  })
});

Promise.all(array).then(([tasks, executors]) => {
    createTaskLine(executors);
    createBacklog(tasks)
    addNotDistributedTask(tasks)
    addDistributedTask(tasks)
});

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ timeLine ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


const timeLine = document.querySelector('.row-wrapper'); // 

createDateTitle(startDate)

function createDateTitle(date) {
    const day = 86400000;                                             
    const executorBlock = document.createElement("div");                  
    executorBlock.classList.add('executor-col');
    executorBlock.innerHTML = "Executor / <span style='color: black'>&nbspDate</span>";
    timeLine.append(executorBlock);
    for (let i = 0; i < 7; i++) {
        curDate = new Date(date+day*i);
        const DateTitle = document.createElement("div");
        if (curDate.getMonth() <= 8) {
            DateTitle.innerHTML = `${curDate.getDate()}.0${curDate.getMonth()+1}`;
        }
        if (curDate.getMonth() > 8) {
            DateTitle.innerHTML = `${curDate.getDate()}.${curDate.getMonth()+1}`;
        }
        DateTitle.classList.add('date-col');
        DateTitle.setAttribute("id", Date.parse(curDate))
        timeLine.append(DateTitle)
        DateTitle.style.borderBottom = "2px solid black"
        DateTitle.style.display = "flex"
        DateTitle.style.alignItems = "end"
    }
    lastDate = curDate.getTime()
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Executors and Task fields ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

function createTaskLine(executors) {
    for (let i = 0; i < executors.length; i++) {
        const mainBlock = document.querySelector('.main-block');
        const taskLine = document.createElement("div");
            taskLine.classList.add('row-executor-task')
            const executorBlock = document.createElement("div");
            executorBlock.classList.add('executor-cell');
            executorBlock.setAttribute("id", executors[i].id)
            executorBlock.innerText = `${executors[i].surname} ${executors[i].firstName}`
            mainBlock.append(taskLine)
            taskLine.append(executorBlock)
            for (let j = 0; j < 7; j++) {
                const taskBlock = document.createElement("div");
                taskBlock.classList.add('task-cell');
                taskLine.append(taskBlock)
            }
        }
        executors = executors; // переносим в глобальную область видимости
    }

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Month Title ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

function createMonthTitle(date) {
    document.querySelector('.date-title').innerHTML = `${date.toLocaleString('ru', {year: 'numeric', month: 'long'})}`
}
createMonthTitle(curDate)


// ~~~~~~~~~~~~~~~~~~~~~~~~~ backlog ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

const userCardTemplate = document.querySelector(".user-cards-template")
const userCardContainer = document.querySelector(".user-cards")
const searchInput = document.querySelector(".search")

searchInput.addEventListener("input", e => {
    const value = e.target.value.toLowerCase()
    tasks.forEach(task => {
        const isVisible = task.subject.toLowerCase().includes(value)
        task.element.classList.toggle("hide", !isVisible)
    })
})

function createBacklog(tasksArr) {
    for (let i = 0; i < tasksArr.length; i++) {
        const userCards = document.querySelector(".user-cards")
        const card = document.createElement("div");
        card.classList.add('card');
        card.setAttribute("id", tasksArr[i].id);
        card.setAttribute("draggable", true);
        card.innerText = `${tasksArr[i].subject}`
        tasksArr[i].element = card;
        if (!tasksArr[i].executor) {
            userCards.append(card)
        }
    }
    tasks = tasksArr;
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ add task in field ~~~~~~~~~~~~~~~~~~~~~~~~~~~~

let bodyRect = document.body.getBoundingClientRect()

function addDistributedTask(tasksArr) {
    // const executorCell = document.querySelector(".executor-cell")
    // const taskCell = document.querySelector(".task-cell")
    // // const taskCell = document.querySelector(".task-cell")
    for (let i = 0; i < tasksArr.length; i++) {
        if (tasksArr[i].executor) { // указан ли исполнитель в таске
            if (document.getElementById(Date.parse(new Date(tasksArr[i].planStartDate)))) { // // проверка существования элемента на странице под данным id (ранее id присвоено значение даты)
                 // получаем координаты столбца (стартовой даты)
                let column = document.getElementById(Date.parse(new Date(tasksArr[i].planStartDate)));
                let x = column.getBoundingClientRect().left + column.getBoundingClientRect().width/2;
                // получаем координаты строки по executor
                let row = document.getElementById(tasksArr[i].executor);
                let y = row.getBoundingClientRect().top + row.getBoundingClientRect().height/2;
                // в найденный элемент добавляем таск
                document.elementFromPoint(x,y).innerHTML += `<div class="task-cell-content">${tasksArr[i].subject}</div>`;
            } 
        }
    }
} 
    

    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Arrow Block ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    
    const leftArrow = document.querySelector('.left-arrow');
    const rightArrow = document.querySelector('.right-arrow');
    
    function deleteCurrentWeek() {
        timeLine.innerHTML = '';
    }
    function deleteCurrentTask() {
        document.querySelectorAll(".task-cell-content").forEach(element => element.remove());
    }
    
    rightArrow.addEventListener('click', () => {
        deleteCurrentWeek();
        deleteCurrentTask();
        createDateTitle(lastDate+86400000);
        createMonthTitle(curDate);
        addDistributedTask(tasks)
        addNotDistributedTask(tasks)
    })
    
    leftArrow.addEventListener('click', () => {
        deleteCurrentWeek();
        deleteCurrentTask();
        createDateTitle(lastDate-86400000*13);
        createMonthTitle(curDate)
        addDistributedTask(tasks)
        addNotDistributedTask(tasks)
    })

    
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ drag and drop ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    function addNotDistributedTask(tasksArr) {
        const executorCell = document.querySelector(".executor-cell")
        const executorCol = document.querySelector(".executor-col")
        const cardCells = document.querySelectorAll(".card")
        cardCells.forEach(card => card.addEventListener('dragend', (e) => {
        // Если задачу закинуть на самого пользователя (в первый столбец), то задача ставится на те даты, которые указаны в ее свойствах.
            if (document.elementFromPoint(e.pageX, e.pageY).className === "executor-cell"){  // отрабатывает только на нужной ячейке
                // получаем id исполнители, на строчку которого был перенос таска
                let x = executorCell.getBoundingClientRect().left + executorCell.getBoundingClientRect().width/2;
                let y = document.elementFromPoint(e.pageX, e.pageY).getBoundingClientRect().top;
                let executorId = document.elementFromPoint(x,y).id; // получаем id исполнителя 
                let findObj = tasksArr.find(task => task.id === e.target.id); // ищем данный таск в массиве объектов
                findObj.executor = Number(executorId); // добавляем в ранее нераспределенную задачу id исполнителя в параметр executor
                console.log(findObj.planStartDate);
                if (document.getElementById(Date.parse(new Date(findObj.planStartDate)))) { // проверка существования элемента с датой на странице под данным id (id ранее привоено значение Date.parse(дата))
                    // получаем координаты столбца (стартовой даты)
                    let column = document.getElementById(Date.parse(new Date(findObj.planStartDate)));
                    let x = column.getBoundingClientRect().left + column.getBoundingClientRect().width/2;
                    // получаем координаты строки (по исполниелю на котором произошло событие)
                    let row = document.getElementById(findObj.executor);
                    let y = row.getBoundingClientRect().top + row.getBoundingClientRect().height/2;
                    // в найденный элемент добавляем таск
                    document.elementFromPoint(x,y).innerHTML += `<div class="task-cell-content">${findObj.subject}</div>`;
                    // удаляем из backlog
                    e.target.remove()
                }
            }
            // Если задачу закинуть на поле таск
            if (document.elementFromPoint(e.pageX, e.pageY).className === "task-cell"){  // отрабатывает только на нужной ячейке
                // получаем id исполнители, на строчку которого был перенос таска
                let x = executorCell.getBoundingClientRect().left + executorCell.getBoundingClientRect().width/2;
                let y = document.elementFromPoint(e.pageX, e.pageY).getBoundingClientRect().top;
                let executorId = document.elementFromPoint(x,y).id; // получаем id исполнителя 
                let findObj = tasksArr.find(task => task.id === e.target.id); // ищем данный таск в массиве объектов
                findObj.executor = Number(executorId); // добавляем в ранее нераспределенную задачу id исполнителя в параметр executor
                console.log(findObj.planStartDate);
                if (document.getElementById(Date.parse(new Date(findObj.planStartDate)))) { // проверка существования элемента с датой на странице под данным id (id ранее привоено значение Date.parse(дата))
                    // получаем координаты столбца (стартовой даты)
                    let column = document.elementFromPoint(e.pageX, e.pageY);
                    let x = column.getBoundingClientRect().left;
                    // получаем координаты строки (по исполниелю на котором произошло событие)
                    let row = document.getElementById(findObj.executor);
                    let y = row.getBoundingClientRect().top + row.getBoundingClientRect().height/2;
                    // в найденный элемент добавляем таск
                    document.elementFromPoint(x,y).innerHTML += `<div class="task-cell-content">${findObj.subject}</div>`;
                    // удаляем из backlog
                    e.target.remove()
                    // перезаписываем свойство planStartDate для таска:
                    // 1. получаем координату столбца date-col в который перенесли таск
                    let x1 = document.elementFromPoint(e.pageX, e.pageY).getBoundingClientRect().left + executorCell.getBoundingClientRect().width/2;
                    let y1 = executorCol.getBoundingClientRect().top+executorCol.getBoundingClientRect().height/2;
                    dateCol = document.elementFromPoint(x1,y1);
                    // console.log(dateCol.id);
                    // 2. dateCol.id - это дата в милисекундах, ниже код для перевода мс в формат yyyy-mm-dd
                    console.log(dateCol.id);
                    let date = new Date(+dateCol.id);
                    let year = date.getFullYear();
                    let month = ("0" + (date.getMonth() + 1)).slice(-2);
                    let day = ("0" + date.getDate()).slice(-2); // получен формат yyyy-mm-dd
                    // присваиваем значение date таску
                    findObj.planStartDate = `${year}-${month}-${day}`;
                }
            }
        // 
        // if (document.elementFromPoint(e.pageX, e.pageY).className === "task-cell"){  
        //     // получаем date-col на который произошёл перенос таска
        //     let x1 = document.elementFromPoint(e.pageX, e.pageY).getBoundingClientRect().left + executorCell.getBoundingClientRect().width/2;
        //     let y1 = executorCol.getBoundingClientRect().top+executorCol.getBoundingClientRect().height/2;
        //     dateCol = document.elementFromPoint(x1,y1);
        //     console.log(dateCol);
        //     let x2 = executorCell.getBoundingClientRect().left + executorCell.getBoundingClientRect().width/2;
        //     let y2 = document.elementFromPoint(e.pageX, e.pageY).getBoundingClientRect().top;
        //     executorId = document.elementFromPoint(x2,y2).id
        //     let findObj = tasks.find(task => task.id === e.target.id); // ищем данный таск в массиве объектов
        //     findObj.executor = Number(executorId); // назначаем задачу выбранному исполнителю
        //     e.target.remove()
        //     addTask(tasks)
        //     // console.log(e.target.id);
        //     // findObj = tasks.find(task => task.id === e.target.id); // ищем данный таск в массиве объектов
        //     // findObj.executor = Number(executorId); // назначаем задачу выбранному исполнителю
        //     // console.log(tasks);
        //     //  e.target.remove()
        //     //  addTask(tasks)
        }))
        console.log(tasksArr);
    }
