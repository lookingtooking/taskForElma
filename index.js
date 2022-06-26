
let startDate =  1655683200000; // 20 июня 2022
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
    addTask(tasks)
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
        card.setAttribute("id", tasksArr[i].id)
        card.innerText = `${tasksArr[i].subject}`
        tasksArr[i].element = card;
        if (!tasksArr[i].executor) {
            userCards.append(card)
        }
    }
    tasks = tasksArr;
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ add task in field ~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// let elem = document.elementFromPoint(x, y);


// let elem = document.querySelector(".executor-cell")
// x = elem.getBoundingClientRect().top + elem.getBoundingClientRect().height/2;
// y = elem.getBoundingClientRect().left + elem.getBoundingClientRect().width/2;

// let checkElem = document.elementFromPoint(x, y);

let bodyRect = document.body.getBoundingClientRect()

function addTask(tasksArr) {
    // const executorCell = document.querySelector(".executor-cell")
    // const taskCell = document.querySelector(".task-cell")
    // // const taskCell = document.querySelector(".task-cell")
    for (let i = 0; i < tasksArr.length; i++) {
        if (tasksArr[i].executor) { // указан ли исполнитель в таске
            if (document.getElementById(Date.parse(new Date(tasksArr[i].planStartDate)))) { // Date.parse(new Date(tasksArr[i].planStartDate))) - числовое значение даты у таска
                console.log(tasksArr[i].planStartDate);
                let column = document.getElementById(Date.parse(new Date(tasksArr[i].planStartDate)));
                x = column.getBoundingClientRect().left + column.getBoundingClientRect().width/2;
                let row = document.getElementById(tasksArr[i].executor);
                y = row.getBoundingClientRect().top + row.getBoundingClientRect().height/2;
                document.elementFromPoint(x,y).innerHTML = `<div class="task-cell-content">${tasksArr[i].subject}</div>`;
            } 
        }
    }
} 

// for (let i = 6; i > -1; i--) {
    //     const day = 86400000; 
    //     Date.parse(curDate)-day*i; // проходимся по датам
    // }
    
    
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
        addTask(tasks)
    })
    
    leftArrow.addEventListener('click', () => {
        deleteCurrentWeek();
        deleteCurrentTask();
        createDateTitle(lastDate-86400000*13);
        createMonthTitle(curDate)
        addTask(tasks)
    })