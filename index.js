// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Date Block ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

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
    backlog(tasks)
});

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


const timeLine = document.querySelector('.row-wrapper');

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
        timeLine.append(DateTitle)
        DateTitle.style.borderBottom = "2px solid black"
        DateTitle.style.display = "flex"
        DateTitle.style.alignItems = "end"
    }
    lastDate = curDate.getTime()
}

// createDateTitle(lastDate+86400000)

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Task Block ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

function createTaskLine(executors) {
    for (let i = 0; i < executors.length; i++) {
        const mainBlock = document.querySelector('.main-block');
        const taskLine = document.createElement("div");
            taskLine.classList.add('row-executor-task')
            const executorBlock = document.createElement("div");
            executorBlock.classList.add('executor-col');
            executorBlock.innerHTML = `${executors[i].surname} ${executors[i].firstName}`
            mainBlock.append(taskLine)
            taskLine.append(executorBlock)
            for (let j = 0; j < 7; j++) {
                const taskBlock = document.createElement("div");
                taskBlock.classList.add('date-col');
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

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Arrow Block ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

const leftArrow = document.querySelector('.left-arrow');
const rightArrow = document.querySelector('.right-arrow');

function deleteCurrentWeek() {
    timeLine.innerHTML = '';
}

rightArrow.addEventListener('click', () => {
    deleteCurrentWeek();
    createDateTitle(lastDate+86400000);
    createMonthTitle(curDate)
})

leftArrow.addEventListener('click', () => {
    deleteCurrentWeek();
    createDateTitle(lastDate-86400000*13);
    createMonthTitle(curDate)
})
    
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

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

// ~~~~~~~~~~~~~~~~~~~~~~~~~ backlog ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

function backlog(value) {
    tasks = value.map(task => {
        const card = userCardTemplate.content.cloneNode(true).children[0]
        const taskName = card.querySelector(".task-name")
        taskName.textContent = task.subject
        userCardContainer.append(card)
        task.element = card;
        return task
        })
}
