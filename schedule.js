// schedule.js

// --- Допоміжні функції ---

function formatDate(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date)) return "";

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
}

function isDateInRange(date, from, to) {
    if (!date) return false;

    const dateObj = typeof date === 'string' ? new Date(date.split(".").reverse().join("-")) : date;
    const fromObj = from ? new Date(from) : null;
    const toObj = to ? new Date(to) : null;
    if (isNaN(dateObj)) return false;

    if (fromObj && dateObj < fromObj) return false;
    if (toObj && dateObj > toObj) return false;
    return true;
}

// --- Функції для факультетів/груп ---

function initFaculties() {
    const facultiesDiv = document.getElementById('faculties');
    if (!facultiesDiv) return;

    const uniqueFaculties = new Set(); // Використовуємо Set для унікальності

    // Збираємо факультети з schedulesData
    for (const groupKey in schedulesData) {
        const groupData = schedulesData[groupKey];
        uniqueFaculties.add(groupData.faculty); // Додаємо факультет в Set
    }

    // Створюємо кнопки
    uniqueFaculties.forEach(faculty => { // Ітеруємо по Set
        const btn = document.createElement('button');
        btn.className = 'faculty-btn';
        btn.textContent = faculty;
        btn.onclick = () => showGroups(faculty);
        facultiesDiv.appendChild(btn);
    });
}


function showGroups(faculty) {
    const groupsDiv = document.getElementById('groups');
    if (!groupsDiv) return;
    groupsDiv.innerHTML = '';

    // Фільтруємо групи за факультетом
    for (const groupKey in schedulesData) {
        const groupData = schedulesData[groupKey];
        if (groupData.faculty === faculty) { // Перевіряємо факультет
            const btn = document.createElement('button');
            btn.className = 'group-btn';
            btn.textContent = groupKey;  // Назва групи - це ключ
            btn.onclick = () => {
                document.querySelectorAll('.group-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                showSchedule(groupKey); // Передаємо *ключ* групи
            };
            btn.dataset.group = groupKey;  // Зберігаємо *ключ* групи
            groupsDiv.appendChild(btn);
        }
    }

    const groupSelection = document.querySelector('.group-selection');
    if(groupSelection) {
        groupSelection.style.display = 'block';
    }

}

// --- Функції для автодоповнення викладача ---
let allTeachers = []; // Масив для зберігання ВСІХ викладачів

function collectAllTeachers() {
    allTeachers = []; // Очищаємо
    for (const groupKey in schedulesData) {
        const groupData = schedulesData[groupKey];
        const schedule = groupData.schedule;

        schedule.forEach(day => {
            day.lessons.forEach(lesson => {
                if (lesson.teacher && !allTeachers.includes(lesson.teacher)) {
                    allTeachers.push(lesson.teacher);
                }
            });
        });
    }
}
function showTeacherSuggestions(input) {
    const suggestionsDiv = document.getElementById('teacher-suggestions');
      if(!suggestionsDiv) return;

    suggestionsDiv.innerHTML = '';
    const inputValue = input.toLowerCase();

    if (inputValue.length === 0) {
        suggestionsDiv.style.display = 'none';
        return;
    }

    const matchingTeachers = allTeachers.filter(teacher =>
        teacher.toLowerCase().startsWith(inputValue)
    );

    if (matchingTeachers.length > 0) {
        const ul = document.createElement('ul');
        ul.className = 'suggestions-list';

        matchingTeachers.forEach(teacher => {
            const li = document.createElement('li');
            li.textContent = teacher;
            li.onclick = () => {
                document.getElementById('teacher-search').value = teacher;
                suggestionsDiv.style.display = 'none';
                applyFilters(); // Застосовуємо фільтр одразу
            };
            ul.appendChild(li);
        });
        suggestionsDiv.appendChild(ul);
        suggestionsDiv.style.display = 'block';
    } else {
        suggestionsDiv.style.display = 'none';
    }
}
// --- Основна функція відображення розкладу ---

function showSchedule(groupKey) {
    const groupData = schedulesData[groupKey];
    if (!groupData) {
        console.error("Group not found:", groupKey);
        return;
    }
    const schedule = groupData.schedule;
    const tbody = document.querySelector('#scheduleTable tbody');
    if(!tbody) return;
    tbody.innerHTML = '';

    const dateFrom = document.getElementById('date-from').value;
    const dateTo = document.getElementById('date-to').value;
    const teacherSearch = document.getElementById('teacher-search').value.toLowerCase();

    schedule.forEach(day => {
        const formattedDate = day.date;

        if (!isDateInRange(formattedDate, dateFrom, dateTo)) {
            return;
        }

        const dayHeaderRow = tbody.insertRow();
        dayHeaderRow.classList.add("day-header");
        const dayHeaderCell = dayHeaderRow.insertCell();
        dayHeaderCell.colSpan = 4;
        dayHeaderCell.textContent = `${formattedDate} (${day.day})`;
        dayHeaderRow.classList.add('day-separator');

        let lessonCounter = 1;

        day.lessons.forEach(lesson => {
            if (teacherSearch && lesson.teacher && !lesson.teacher.toLowerCase().includes(teacherSearch)) {
                return;
            }

            if (lesson.subject) {
                const row = tbody.insertRow();

                const timeCell = row.insertCell();
                timeCell.innerHTML = `<span class="time-slot">${lessonCounter} пара<br>${lesson.time}</span>`;

                const subjectCell = row.insertCell();
                subjectCell.textContent = lesson.subject;
                if (lesson.details) {
                    subjectCell.innerHTML += `<br><small>${lesson.details}</small>`;
                }

                row.insertCell().textContent = lesson.teacher;
                row.insertCell().textContent = lesson.group || groupKey;

                lessonCounter++;
            }else {
                const row = tbody.insertRow();
                row.insertCell().textContent = day.date;
                row.insertCell().textContent = "";
                row.insertCell().textContent = "";
                row.insertCell().textContent = "";
            }
        });
    });

    const scheduleView = document.querySelector('.schedule-view');
    if(scheduleView){
         scheduleView.style.display = 'block';
    }
}

// --- Функція застосування фільтрів ---
function applyFilters() {
    const activeGroupBtn = document.querySelector('.group-btn.active');
    if (activeGroupBtn) {
        const group = activeGroupBtn.dataset.group;
        showSchedule(group);
    }
}

// --- Функція збереження ---
function saveSchedule() {
    const groupBtn = document.querySelector('.group-btn.active');
    if (!groupBtn) {
        alert("Оберіть групу!"); // Якщо група не вибрана - виходимо
        return;
    }

    const groupKey = groupBtn.dataset.group;
    const groupData = schedulesData[groupKey];

    if (!groupData) {
        alert("Помилка: дані для цієї групи не знайдені.");
        return;
    }

    let scheduleName = prompt("Введіть назву для збереженого розкладу:", groupKey);
    if (scheduleName === null) {
        return; // Користувач натиснув "Скасувати"
    }
    scheduleName = scheduleName.trim();
    if (scheduleName === "") {
        scheduleName = groupKey;
    }

    // === Створюємо НОВИЙ об'єкт для збереження ===
    const filteredSchedule = [];

    // Отримуємо всі рядки таблиці (включаючи заголовки днів!)
    const rows = document.querySelectorAll('#scheduleTable tbody tr');

    let currentDay = null; // Поточний день (об'єкт)

    rows.forEach(row => {
        if (row.classList.contains('day-header')) {
            // Це рядок-заголовок дня
            const dateCell = row.querySelector('td'); // Перша (і єдина) комірка
            const dateText = dateCell.textContent; // "24.02.2025 (Понеділок)"

            // Розбиваємо текст, щоб отримати дату і день тижня
            const match = dateText.match(/(.+)\s+\((.+)\)/); //  (.+)\s+\((.+)\) - це регулярний вираз
            if (match) {
                const date = match[1]; // "24.02.2025"
                const day = match[2];   // "Понеділок"

                // Створюємо новий об'єкт дня і додаємо його в filteredSchedule
                currentDay = { date: date, day: day, lessons: [] };
                filteredSchedule.push(currentDay);
            }
        } else {
            // Це рядок з даними про заняття
            const cells = row.querySelectorAll('td'); // Отримуємо всі комірки рядка

            // Перевіряємо чи є взагалі комірки (на випадок порожнього рядка)
            if (cells.length > 0 && cells[1].textContent.trim() !== "") {
              const time = cells[0].querySelector('.time-slot').textContent.replace(/^\d+\s*пара\s*/, ''); //Видаляємо номер пари
              const subject = cells[1].textContent;
              //Отримуємо small, якщо він там є, якщо нема, то ''
              const details = cells[1].querySelector('small') ? cells[1].querySelector('small').textContent : '';
              const teacher = cells[2].textContent;
              const group = cells[3].textContent;


                // Додаємо заняття до поточного дня
                //  currentDay *точно* буде визначено, тому що ми спочатку обробляємо day-header
                currentDay.lessons.push({
                    time: time,
                    subject: subject,
                    teacher: teacher,
                    group: group,
                    details: details // Додаємо details
                });
            }
        }
    });

    // === Зберігаємо ВЖЕ ВІДФІЛЬТРОВАНИЙ розклад ===
    const savedSchedules = JSON.parse(localStorage.getItem('savedSchedules')) || {};
    savedSchedules[groupKey + "_" + scheduleName] = {
        group: groupKey,
        name: scheduleName,
        schedule: filteredSchedule // Зберігаємо *відфільтрований* розклад!
    };
    localStorage.setItem('savedSchedules', JSON.stringify(savedSchedules));
    alert('Розклад збережено!');
}



// --- Ініціалізація ---
document.addEventListener('DOMContentLoaded', () => {
     // === ЗБЕРІГАЄМО schedulesData в localStorage ===
    localStorage.setItem('schedulesData', JSON.stringify(schedulesData));
     //ВАЖЛИВО!!!! ПЕРЕНІС СЮДИ
    // ============================================
    initFaculties();
    collectAllTeachers();



    const teacherSearchInput = document.getElementById('teacher-search');
    if (teacherSearchInput) {
        teacherSearchInput.addEventListener('input', () => {
            showTeacherSuggestions(teacherSearchInput.value);
        });
    }

    document.addEventListener('click', (event) => {
        const suggestionsDiv = document.getElementById('teacher-suggestions');
         if (suggestionsDiv && !event.target.closest('.autocomplete-wrapper')) {
            suggestionsDiv.style.display = 'none';
        }
    });
});