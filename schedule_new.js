// shedule.js
window.currentState = {
    faculty: null,
    group: null,
    semester: null,
    selectedSubjects: {},
    dateFrom: '',
    dateTo: '',
    teacherSearch: ''
};

// Ініціалізація мобільного меню
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navList = document.querySelector('.nav-list');
if (mobileMenuBtn && navList) {
    mobileMenuBtn.addEventListener('click', () => {
        console.log('[SCHEDULE] Клік по кнопці мобільного меню');
        navList.classList.toggle('show');
    });
}

// --- Допоміжні функції ---
function formatDate(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date)) return "";
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`; // corrected typo `${day}.${month}.${year}`
}

function getDayOfWeek(dateString) {
    const date = new Date(dateString.split('.').reverse().join('-'));
    const daysOfWeek = ['Неділя', 'Понеділок', 'Вівторок', 'Середа', 'Четвер', 'П\'ятниця', 'Субота'];
    return daysOfWeek[date.getDay()];
}

// Функція для встановлення дат залежно від поточного дня тижня
function setDatesBasedOnCurrentDay() {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 - неділя, 6 - субота
    let dateFrom = new Date(today);

    console.log(`[SCHEDULE] Встановлення дат. Сьогодні: ${dayOfWeek} день тижня (${today.toLocaleDateString()})`);

    // Встановлюємо початкову дату залежно від дня тижня
    if (dayOfWeek === 0) { // Якщо сьогодні неділя
        // Встановлюємо дату "з" на завтра (понеділок)
        dateFrom.setDate(today.getDate() + 1);
    } else if (dayOfWeek === 6) { // Якщо сьогодні субота
        // Встановлюємо дату "з" на вчора (п'ятницю)
        dateFrom.setDate(today.getDate() - 1);
    }
    // Для будніх днів (1-5) залишаємо поточну дату як початкову

    // Використовуємо глобальну функцію для форматування дати (DD.MM.YYYY)
    const formattedDateFrom = formatDate(dateFrom);

    // Встановлюємо початкову дату в стан та в інтерфейсі
    // Кінцеву дату не встановлюємо (залишаємо порожньою)
    window.currentState.dateFrom = formattedDateFrom;
    window.currentState.dateTo = '';
    
    // Оновлюємо інтерфейс з датами у форматі YYYY-MM-DD
    document.getElementById('date-from').value = formatDateForInput(dateFrom);
    document.getElementById('date-to').value = '';

    console.log(`[SCHEDULE] Встановлено початкову дату: ${formattedDateFrom}`);
    console.log('[SCHEDULE] Кінцеву дату не встановлюємо для показу всього розкладу');

    // Зберігаємо оновлений стан
    localStorage.setItem('appState', JSON.stringify(window.currentState));
}

function isDateInRange(date, from, to) {
    if (!date) return false;

    if ((!from || from === '') && (!to || to === '')) {
        return true;
    }

    const dateObj = typeof date === 'string' ? new Date(date.split(".").reverse().join("-")) : date;

    let fromObj = null;
    if (from && from !== '') {
        if (from.includes('.')) {
            fromObj = new Date(from.split(".").reverse().join("-"));
        } else {
            fromObj = new Date(from);
        }
    }

    let toObj = null;
    if (to && to !== '') {
        if (to.includes('.')) {
            toObj = new Date(to.split(".").reverse().join("-"));
        } else {
            toObj = new Date(to);
        }
    }

    if (isNaN(dateObj)) return false;
    if (fromObj && !isNaN(fromObj) && dateObj < fromObj) return false;
    if (toObj && !isNaN(toObj) && dateObj > toObj) return false;
    return true;
}

function normalizeSubgroup(subgroup) {
    if (!subgroup) return '';

    // Нормалізуємо до нижнього регістру і видаляємо зайві пробіли
    let normalized = subgroup
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim();

    // Якщо це збірна група, зберігаємо оригінальний тип заняття
    if (normalized.includes('кн(зб)')) {
        const match = subgroup.match(/КН\(зб\)(\d+\.\d+)\s*\(([^)]+)\)/i);
        if (match) {
            const [, number, type] = match;
            const normalizedType = normalizeType(type);
            return `КН(зб)${number}(${normalizedType})`;
        }
    }

    // Нормалізуємо типи занять
    return normalizeType(normalized);
}

function normalizeType(type) {
    if (!type) return '';

    console.log('\n[TYPE] ========= Початок нормалізації типу =========');
    console.log('[TYPE] Оригінальний тип:', type);

    // Видаляємо всі зайві символи та пробіли
    type = type
        .toLowerCase()
        .replace(/[\(\)\[\]\{\}]/g, '')  // видаляємо всі види дужок
        .replace(/\s+/g, '')             // видаляємо всі пробіли
        .replace(/[-_]/g, '')            // видаляємо дефіси та підкреслення
        .trim();

    console.log('[TYPE] Після очищення:', type);

    // Розширений список всіх можливих варіантів
    const typeMap = {
        'л': 'Лекція',
        'лек': 'Лекція',
        'лекція': 'Лекція',
        'лекция': 'Лекція',
        'лаб': 'Лабораторна',
        'лабораторна': 'Лабораторна',
        'прс': 'Семінар',
        'практика': 'Семінар',
        'сем': 'Семінар',
        'семінар': 'Семінар',
        'семинар': 'Семінар',
        'кек': 'Консультація',
        'екз': 'Екзамен',
        'консультація': 'Консультація',
        'екзамен': 'Екзамен'
    };

    // Перевіряємо точні співпадіння
    if (typeMap[type]) {
        console.log('[TYPE] Знайдено точне співпадіння:', type, '->', typeMap[type]);
        return typeMap[type];
    }

    // Перевіряємо часткові співпадіння
    for (const [key, value] of Object.entries(typeMap)) {
        if (type.includes(key)) {
            console.log('[TYPE] Знайдено часткове співпадіння:', type, 'містить', key, '->', value);
            return value;
        }
    }

    // Додаткова перевірка для семінарів
    if (type.includes('с') || type.includes('прс')) {
        console.log('[TYPE] Розпізнано як семінар через додаткову перевірку');
        return 'Семінар';
    }

    console.log('[TYPE] Не вдалося нормалізувати тип:', type);
    console.log('[TYPE] ========= Кінець нормалізації типу =========\n');
    return type.charAt(0).toUpperCase() + type.slice(1);
}

// --- Функції для витягнення підгрупи та основної назви предмета ---
function extractCoreSubject(subject) {
    if (!subject) return '';

    console.log('\n[EXTRACT] ========= Початок витягнення предмету =========');
    console.log('[EXTRACT] Оригінальний предмет:', subject);

    // Видаляємо префікси та суфікси з урахуванням всіх можливих варіантів
    let core = subject
        .replace(/^Збірна група\s+КН\(зб\)\s*/, '')
        .replace(/^Потік\s+[^\\n]+/, '')
        .replace(/КН\(зб\)\d+\.\d+\s*/, '')
        .replace(/^\(підгр\.\s*\d+\)\s*/, '')
        .replace(/[\s]*\([\s]*(Л|Лек|Лаб|ПрС|прс|Прс|Сем|ПРАКТИКА|Практика|Семінар)[\s]*\)[\s]*$/, '')
        .replace(/\n/g, ' ')
        .trim();

    console.log('[EXTRACT] Результат витягнення:', core);
    console.log('[EXTRACT] ========= Кінець витягнення предмету =========\n');

    return core;
}

function normalizeSubject(subject) {
    if (!subject) return '';

    let normalized = subject
        .toLowerCase()
        .replace(/[''`']/g, '')
        .replace(/[іi]/g, 'i')
        .replace(/[её]/g, 'е')
        .replace(/[-–—]/g, ' ')
        .replace(/[^a-zа-яіїєґ0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    console.log('[NORMALIZE] Оригінальний предмет:', subject);
    console.log('[NORMALIZE] Нормалізований предмет:', normalized);

    return normalized;
}

function extractSubgroup(subject) {
    if (!subject) return '';

    console.log('\n[SUBGROUP] ========= Початок аналізу підгрупи =========');
    console.log('[SUBGROUP] Оригінальний текст:', subject);

    // Шукаємо тип в кінці рядка з урахуванням всіх можливих варіантів
    const typePattern = /[\s]*\([\s]*(Л|Лек|Лаб|ПрС|прс|Прс|Сем|ПРАКТИКА|Практика|Семінар|КЕк|Екз|Консультація)[\s]*\)[\s]*$/i;
    const typeMatch = subject.match(typePattern);

    console.log('[SUBGROUP] Пошук типу заняття за патерном:', typePattern);
    console.log('[SUBGROUP] Знайдений тип (сирий):', typeMatch ? typeMatch[0] : 'не знайдено');
    console.log('[SUBGROUP] Знайдений тип (група 1):', typeMatch ? typeMatch[1] : 'не знайдено');

    // Перевіряємо на наявність збірної групи
    if (subject.includes('Збірна група')) {
        const zbMatch = subject.match(/Збірна група\s+КН\(зб\)(\d+\.\d+)/);
        console.log('[SUBGROUP] Знайдено збірну групу:', zbMatch ? zbMatch[1] : 'ні');

        if (zbMatch && typeMatch) {
            const groupNum = zbMatch[1];
            const type = typeMatch[1];
            const normalizedType = normalizeType(type);
            const result = `КН(зб)${groupNum}(${normalizedType})`;
            console.log('[SUBGROUP] Результат для збірної групи:', result);
            return result;
        }
    }

    // Перевіряємо на наявність потоку
    if (subject.includes('Потік')) {
        if (typeMatch) {
            const normalizedType = normalizeType(typeMatch[1]);
            console.log('[SUBGROUP] Результат для потоку:', normalizedType);
            return normalizedType;
        }
    }

    // Для всіх інших випадків
    if (typeMatch) {
        const normalizedType = normalizeType(typeMatch[1]);
        console.log('[SUBGROUP] Результат для звичайного заняття:', normalizedType);
        return normalizedType;
    }

    console.log('[SUBGROUP] Тип заняття не знайдено');
    console.log('[SUBGROUP] ========= Кінець аналізу підгрупи =========\n');
    return '';
}

// --- Функції для факультетів/груп ---
function initFaculties() {
    const facultiesDiv = document.getElementById('faculties');
    if (!facultiesDiv) return;
    const uniqueFaculties = new Set();
    for (const groupKey in schedulesData) {
        uniqueFaculties.add(schedulesData[groupKey].faculty);
    }
    uniqueFaculties.forEach(faculty => {
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
    window.currentState.faculty = faculty;
    saveState();

    console.log('[GROUPS] Показую групи для факультету:', faculty);
    console.log('[GROUPS] Доступні дані:', schedulesData);

    for (const groupKey in schedulesData) {
        const groupData = schedulesData[groupKey];
        console.log('[GROUPS] Перевіряю групу:', groupKey, 'факультет:', groupData.faculty);
        if (groupData.faculty === faculty) {
            const btn = document.createElement('button');
            btn.className = 'group-btn';
            btn.textContent = groupKey;
            btn.onclick = () => {
                document.querySelectorAll('.group-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                window.currentState.group = groupKey;
                saveState();
                showSchedule(groupKey);
            };
            btn.dataset.group = groupKey;
            if (groupKey === window.currentState.group) {
                btn.classList.add('active');
            }
            groupsDiv.appendChild(btn);
            console.log('[GROUPS] Додано кнопку для групи:', groupKey);
        }
    }
    const groupSelection = document.querySelector('.group-selection');
    if (groupSelection) groupSelection.style.display = 'block';
}

// --- Функції для автодоповнення викладача ---
let allTeachers = [];
function collectAllTeachers() {
    allTeachers = [];
    for (const groupKey in schedulesData) {
        const groupData = schedulesData[groupKey];
        groupData.schedule.forEach(day => {
            day.lessons.forEach(lesson => {
                if (lesson.teacher && !allTeachers.includes(lesson.teacher)) {
                    allTeachers.push(lesson.teacher);
                }
            });
        });
    }
}

function showTeacherSuggestions(query) {
    const suggestionsDiv = document.getElementById('teacher-suggestions');
    if (!suggestionsDiv) return;

    if (!query) {
        suggestionsDiv.style.display = 'none';
        return;
    }

    const filteredTeachers = allTeachers.filter(teacher =>
        teacher.toLowerCase().includes(query.toLowerCase())
    );

    if (filteredTeachers.length === 0) {
        suggestionsDiv.style.display = 'none';
        return;
    }

    suggestionsDiv.innerHTML = '';
    filteredTeachers.forEach(teacher => {
        const suggestion = document.createElement('div');
        suggestion.className = 'suggestion-item';
        suggestion.textContent = teacher;
        suggestion.onclick = () => {
            document.getElementById('teacher-search').value = teacher;
            suggestionsDiv.style.display = 'none';
            applyFilters();
        };
        suggestionsDiv.appendChild(suggestion);
    });
    suggestionsDiv.style.display = 'block';
}

// --- Функція відображення розкладу ---
function showSchedule(groupKey) {
    console.log('[SCHEDULE] === Початок обробки розкладу для групи:', groupKey, '===');
    console.log('[SCHEDULE] Поточний стан:', window.currentState);

    // Оновлюємо групу в стані
    window.currentState.group = groupKey;
    saveState();

    // Перевіряємо, чи є дані для групи
    const groupData = schedulesData[groupKey];
    if (!groupData) {
        console.error('[SCHEDULE] Помилка: група', groupKey, 'не знайдена');
        return;
    }
    const schedule = groupData.schedule;
    const tbody = document.querySelector('#scheduleTable tbody');
    if (!tbody) {
        console.error('[SCHEDULE] Помилка: таблиця розкладу не знайдена');
        return;
    }
    tbody.innerHTML = ''; // Очищаємо попередній вміст таблиці

    const fragment = document.createDocumentFragment();

    // Отримуємо значення фільтрів із window.currentState
    let dateFrom = window.currentState.dateFrom || '';
    let dateTo = window.currentState.dateTo || '';
    const teacherSearch = window.currentState.teacherSearch || '';

    // Синхронізуємо поля вводу з поточним станом
    document.getElementById('date-from').value = dateFrom;
    document.getElementById('date-to').value = dateTo;
    document.getElementById('teacher-search').value = teacherSearch;

    // Логуємо параметри фільтрації
    console.log('[SCHEDULE] Параметри фільтрації:');
    console.log('[SCHEDULE] - dateFrom:', dateFrom);
    console.log('[SCHEDULE] - dateTo:', dateTo);
    console.log('[SCHEDULE] - teacherSearch:', teacherSearch);

    // Перевіряємо, чи показуємо повний розклад
    const isShowingFullSchedule = (!dateFrom || dateFrom === '') && (!dateTo || dateTo === '');
    console.log('[SCHEDULE] Показуємо повний розклад?', isShowingFullSchedule);

    // Визначаємо часові слоти
    const timeSlots = {
        1: "09:00-10:20", 2: "10:35-11:55", 3: "12:20-13:40", 4: "13:50-15:10",
        5: "15:20-16:40", 6: "16:50-18:10", 7: "18:15-19:35", 8: "19:40-21:00"
    };

    // Визначаємо, чи це мобільний вигляд
    const isMobileView = window.innerWidth <= 768;

    // Проходимо по кожному дню розкладу
    schedule.forEach(day => {
        // Фільтруємо дні за діапазоном дат
        if (!isDateInRange(day.date, dateFrom, dateTo)) {
            console.log(`[SCHEDULE] День ${day.date} виключено через фільтр дат`);
            return;
        }

        // Створюємо заголовок дня
        const dayHeaderRow = document.createElement('tr');
        dayHeaderRow.classList.add("day-header");
        const dayHeaderCell = document.createElement('td');
        dayHeaderCell.colSpan = 4;
        dayHeaderCell.style.cursor = 'pointer';
        dayHeaderCell.innerHTML = `${day.date.trim()} (${day.day.trim()}) <span class="toggle-arrow">▼</span>`;
        dayHeaderRow.appendChild(dayHeaderCell);
        fragment.appendChild(dayHeaderRow);

        let lessonRows = [];
        let isDayExpanded = true;

        // Додаємо можливість згортання/розгортання дня
        dayHeaderRow.addEventListener('click', () => {
            isDayExpanded = !isDayExpanded;
            lessonRows.forEach(row => {
                row.style.display = isDayExpanded ? '' : 'none';
            });
            const arrowSpan = dayHeaderCell.querySelector('.toggle-arrow');
            arrowSpan.textContent = isDayExpanded ? '▼' : '▶';
        });

        // Проходимо по всіх парах (1-8)
        for (let lessonNumber = 1; lessonNumber <= 8; lessonNumber++) {
            // Змінюємо find на filter, щоб отримати всі пари в цьому часовому слоті
            const lessons = (day.lessons || []).filter(l =>
                l.time && l.time.replace(/\s/g, "") === timeSlots[lessonNumber].replace(/\s/g, "")
            );

            // Якщо немає пар в цьому часовому слоті, створюємо порожній рядок
            if (lessons.length === 0) {
                const row = document.createElement('tr');
                row.classList.add('empty-slot');
                
                // Колонка часу
                const timeCell = document.createElement('td');
                timeCell.setAttribute('data-label', 'Час');
                timeCell.innerHTML = `<span class="time-slot">${lessonNumber} пара ${timeSlots[lessonNumber]}</span>`;
                
                // Порожні колонки для предмету, викладача та групи
                const subjectCell = document.createElement('td');
                subjectCell.setAttribute('data-label', 'Предмет');
                const teacherCell = document.createElement('td');
                teacherCell.setAttribute('data-label', 'Викладач');
                const groupCell = document.createElement('td');
                groupCell.setAttribute('data-label', 'Група');
                
                // Додаємо колонки до рядка
                row.appendChild(timeCell);
                row.appendChild(subjectCell);
                row.appendChild(teacherCell);
                row.appendChild(groupCell);
                fragment.appendChild(row);
                lessonRows.push(row);
            } else {
                // Для кожної пари в цьому часовому слоті створюємо окремий рядок
                lessons.forEach(lesson => {
                    // Визначаємо, чи відображати урок
                    const shouldDisplay = isShowingFullSchedule ? !!lesson.subject : shouldDisplayLesson(lesson);
                    
                    // Створюємо рядок для уроку
                    const row = document.createElement('tr');
                    row.classList.toggle('empty-slot', !lesson.subject || !shouldDisplay);
                    lessonRows.push(row);
                    
                    // Колонка часу
                    const timeCell = document.createElement('td');
                    timeCell.setAttribute('data-label', 'Час');
                    timeCell.innerHTML = `<span class="time-slot">${lessonNumber} пара ${timeSlots[lessonNumber]}</span>`;
                    
                    // Колонки предмету, викладача та групи
                    const subjectCell = document.createElement('td');
                    subjectCell.setAttribute('data-label', 'Предмет');
                    const teacherCell = document.createElement('td');
                    teacherCell.setAttribute('data-label', 'Викладач');
                    const groupCell = document.createElement('td');
                    groupCell.setAttribute('data-label', 'Група');
                    
                    // Якщо є предмет і він має відображатися
                    if (lesson.subject && shouldDisplay) {
                        // Перевіряємо фільтр за викладачем
                        if (teacherSearch && (!lesson.teacher || !lesson.teacher.toLowerCase().includes(teacherSearch.toLowerCase()))) {
                            console.log(`[SCHEDULE] Урок ${lesson.subject} пропущено через фільтр викладача`);
                            row.classList.add('empty-slot');
                        } else {
                            // Оформлення для мобільного та десктопного вигляду
                            if (isMobileView) {
                                subjectCell.innerHTML = `<span class="mobile-label">Предмет: </span>${lesson.subject}`;
                                if (lesson.details) subjectCell.innerHTML += `<br><small>${lesson.details}</small>`;
                                if (lesson.link && lesson.link.trim() !== '') {
                                    subjectCell.innerHTML += `<br><small><a href="${lesson.link}" target="_blank" class="lesson-link">Посилання на відеоконференцію <i class="fas fa-external-link-alt"></i></a></small>`;
                                }
                                teacherCell.innerHTML = `<span class="mobile-label">Викладач: </span>${lesson.teacher || ''}`;
                                groupCell.innerHTML = `<span class="mobile-label">Група: </span>${lesson.group || groupKey}`;
                            } else {
                                subjectCell.textContent = lesson.subject;
                                if (lesson.details) subjectCell.innerHTML += `<br><small>${lesson.details}</small>`;
                                if (lesson.link && lesson.link.trim() !== '') {
                                    subjectCell.innerHTML += `<br><small><a href="${lesson.link}" target="_blank" class="lesson-link">Посилання на відеоконференцію <i class="fas fa-external-link-alt"></i></a></small>`;
                                }
                                teacherCell.textContent = lesson.teacher || '';
                                groupCell.textContent = lesson.group || groupKey;
                            }
                            
                            // Додаємо класи для стилізації
                            teacherCell.classList.add('lesson-cell', 'group-color');
                            groupCell.classList.add('lesson-cell', 'group-color');
                        }
                    }
                    
                    // Додаємо колонки до рядка
                    row.appendChild(timeCell);
                    row.appendChild(subjectCell);
                    row.appendChild(teacherCell);
                    row.appendChild(groupCell);
                    fragment.appendChild(row);
                });
            }
        }
    });

    // Додаємо сформований фрагмент у таблицю
    tbody.appendChild(fragment);
    document.querySelector('.schedule-view').style.display = 'block';

    console.log('[SCHEDULE] === Завершення обробки розкладу для групи:', groupKey, '===');
}

// --- Функція збереження розкладу ---
function saveSchedule() {
    console.log('[SCHEDULE] Початок збереження розкладу');
    
    const activeGroupBtn = document.querySelector('.group-btn.active');
    if (!activeGroupBtn) {
        alert('Будь ласка, оберіть групу перед збереженням.');
        return;
    }

    const groupKey = activeGroupBtn.dataset.group;
    console.log('[SCHEDULE] Обрана група:', groupKey);
    
    // Отримуємо всю секцію з розкладом, включно з таблицею
    const scheduleSection = document.querySelector('.schedule-view');
    if (!scheduleSection) {
        console.warn('[SCHEDULE] Не знайдено секцію з розкладом');
        alert('Не вдалося знайти розклад на сторінці.');
        return;
    }
    
    // Отримуємо таблицю розкладу
    const scheduleTable = document.querySelector('#scheduleTable');
    if (!scheduleTable) {
        console.warn('[SCHEDULE] Не знайдено таблицю з розкладом');
        alert('Не вдалося знайти таблицю з розкладом на сторінці.');
        return;
    }
    
    // Створюємо копію всієї секції з розкладом без модифікацій
    const scheduleHTML = scheduleSection.outerHTML;
    const tableHTML = scheduleTable.outerHTML;
    
    console.log('[SCHEDULE] Отримано HTML розкладу');
    
    const name = prompt('Введіть назву для збереженого розкладу:');
    if (!name) {
        alert('Назву не введено. Збереження скасовано.');
        return;
    }

    // Отримуємо збережені розклади як масив
    let savedSchedules = JSON.parse(localStorage.getItem('savedSchedules') || '[]');
    
    // Якщо savedSchedules не є масивом, перетворюємо його на масив
    if (!Array.isArray(savedSchedules)) {
        if (typeof savedSchedules === 'object' && savedSchedules !== null) {
            savedSchedules = Object.values(savedSchedules);
        } else {
            savedSchedules = [];
        }
    }

    // Перевіряємо, чи існує розклад з такою назвою
    const existingScheduleIndex = savedSchedules.findIndex(item => item.name === name);

    if (existingScheduleIndex !== -1) {
        const confirmOverwrite = confirm(`Розклад з назвою "${name}" вже існує. Бажаєте перезаписати його?`);
        if (!confirmOverwrite) {
            return; // Якщо користувач відмовився, виходимо з функції
        }
        // Якщо користувач погодився, видаляємо старий розклад
        savedSchedules.splice(existingScheduleIndex, 1);
    }

    // Зберігаємо поточні фільтри
    const currentFilters = {
        dateFrom: document.getElementById('date-from').value,
        dateTo: document.getElementById('date-to').value,
        teacherSearch: document.getElementById('teacher-search').value
    };

    // Створюємо новий об'єкт розкладу з HTML-вмістом
    const newSchedule = {
        name: name,
        faculty: document.querySelector('.faculty-btn.active')?.textContent.trim() || '',
        group: groupKey,
        createdAt: Date.now(),
        date: new Date().toLocaleDateString('uk-UA'),
        dateFrom: currentFilters.dateFrom,
        dateTo: currentFilters.dateTo,
        teacherSearch: currentFilters.teacherSearch,
        scheduleHTML: tableHTML, // Зберігаємо HTML таблиці
        sectionHTML: scheduleHTML // Зберігаємо також HTML всієї секції для контексту
    };

    console.log('[SCHEDULE] Створено об\'єкт для збереження з HTML');

    // Додаємо новий розклад до масиву та зберігаємо
    savedSchedules.push(newSchedule);
    localStorage.setItem('savedSchedules', JSON.stringify(savedSchedules));
    console.log('[SCHEDULE] Розклад успішно збережено в localStorage');
    alert('Розклад успішно збережено!');
}

// Збереження стану
function saveState() {
    // Беремо існуючі значення з window.currentState та оновлюємо значення, які могли змінитися
    const state = {
        faculty: window.currentState?.faculty,
        group: window.currentState?.group,
        semester: window.currentState?.semester,
        selectedSubjects: window.currentState?.selectedSubjects || {},
        // Використовуємо значення з window.currentState, а не з полів вводу
        dateFrom: window.currentState?.dateFrom || '',
        dateTo: window.currentState?.dateTo || '',
        teacherSearch: window.currentState?.teacherSearch || ''
    };

    // Зберігаємо оновлений стан
    localStorage.setItem('appState', JSON.stringify(state));
    console.log('[SCHEDULE] Збережено стан:', state);
}

// Відновлення стану
function restoreState() {
    const savedState = localStorage.getItem('appState');

    // Створюємо стандартний порожній стан
    let initialState = {
        faculty: null,
        group: null,
        semester: null,
        selectedSubjects: {},
        dateFrom: '',
        dateTo: '',
        teacherSearch: ''
    };

    if (savedState) {
        // Якщо є збережений стан, використовуємо його
        window.currentState = JSON.parse(savedState);
    } else {
        // Якщо немає збереженого стану, використовуємо стандартний порожній стан
        window.currentState = initialState;
    }

    // Завжди встановлюємо початкову дату на основі поточного дня тижня при ініціалізації
    // Це забезпечить, що користувач завжди бачить актуальний розклад
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 - неділя, 6 - субота
    let dateFrom = new Date(today);

    console.log(`[SCHEDULE] Ініціалізація. Сьогодні: ${dayOfWeek} день тижня (${today.toLocaleDateString()})`);

    // Встановлюємо початкову дату залежно від дня тижня
    if (dayOfWeek === 0) { // Якщо сьогодні неділя
        // Встановлюємо дату "з" на завтра (понеділок)
        dateFrom.setDate(today.getDate() + 1);
    } else if (dayOfWeek === 6) { // Якщо сьогодні субота
        // Встановлюємо дату "з" на вчора (п'ятницю)
        dateFrom.setDate(today.getDate() - 1);
    }
    // Для будніх днів (1-5) залишаємо поточну дату як початкову

    // Форматуємо дату для відображення у форматі DD.MM.YYYY
    function formatDate(dateString) {
        if (!dateString) return "";
        const date = new Date(dateString);
        if (isNaN(date)) return "";
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // +1, бо місяці з 0
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
    }

    const formattedDateFrom = formatDate(dateFrom);

    // Встановлюємо початкову дату в стан та в інтерфейсі
    // Кінцеву дату залишаємо порожньою для показу всього розкладу
    window.currentState.dateFrom = formattedDateFrom;
    window.currentState.dateTo = '';
    document.getElementById('date-from').value = formattedDateFrom;
    document.getElementById('date-to').value = '';

    console.log(`[SCHEDULE] Ініціалізація. Встановлено початкову дату: ${formattedDateFrom}`);
    console.log('[SCHEDULE] Кінцеву дату не встановлюємо для показу всього розкладу');

    // Встановлюємо значення поля пошуку вчителя з поточного стану
    document.getElementById('teacher-search').value = window.currentState.teacherSearch || '';

    // Відображаємо розклад для групи, якщо вона вибрана
    if (window.currentState.group) {
        showSchedule(window.currentState.group);
    }
}


function showScheduleForDays(days) {
    console.log(`[SCHEDULE] Показ розкладу на ${days} днів`);
    const today = new Date();
    const dateFrom = formatDate(today);
    const dateTo = new Date(today);
    dateTo.setDate(today.getDate() + days - 1); // Включаємо весь період (наприклад, 7 днів)
    const formattedDateTo = formatDate(dateTo);

    console.log(`[SCHEDULE] Дати для фільтрації: з ${dateFrom} по ${formattedDateTo}`);

    // Оновлюємо стан
    window.currentState.dateFrom = dateFrom;
    window.currentState.dateTo = formattedDateTo;

    // Оновлюємо інтерфейс (формат для input type="date" - YYYY-MM-DD)
    document.getElementById('date-from').value = formatDateForInput(today);
    document.getElementById('date-to').value = formatDateForInput(dateTo);

    console.log(`[SCHEDULE] Встановлено дати для ${days} днів: з ${dateFrom} по ${formattedDateTo}`);
    saveState();
    applyFilters(); // Застосовуємо фільтри для відображення розкладу
}




function showScheduleForMonth() {
    console.log('[SCHEDULE] Показ розкладу на 1 місяць');
    const today = new Date();
    const dateFrom = formatDate(today);
    const dateTo = new Date(today);
    dateTo.setMonth(today.getMonth() + 1); // Додаємо 1 місяць
    const formattedDateTo = formatDate(dateTo);

    console.log(`[SCHEDULE] Дати для фільтрації: з ${dateFrom} по ${formattedDateTo}`);

    // Оновлюємо стан
    window.currentState.dateFrom = dateFrom;
    window.currentState.dateTo = formattedDateTo;

    // Оновлюємо інтерфейс (формат для input type="date" - YYYY-MM-DD)
    document.getElementById('date-from').value = formatDateForInput(today);
    document.getElementById('date-to').value = formatDateForInput(dateTo);

    console.log(`[SCHEDULE] Встановлено дати для 1 місяця: з ${dateFrom} по ${formattedDateTo}`);
    saveState();
    applyFilters(); // Застосовуємо фільтри для відображення розкладу
}

// Функція для форматування дати у формат для input type="date" (YYYY-MM-DD)
function formatDateForInput(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}







// --- Функція відображення повного розкладу ---
function showFullSchedule() {
    // Перевіряємо, чи вибрана група
    const activeGroupBtn = document.querySelector('.group-btn.active');
    if (!activeGroupBtn) {
        alert('Будь ласка, оберіть групу перед переглядом розкладу.');
        return;
    }

    console.log('[SCHEDULE] === Початок відображення повного розкладу ===');
    console.log('[SCHEDULE] Поточний стан перед скиданням:', { ...window.currentState });

    // Очищаємо поля фільтрації
    document.getElementById('date-from').value = '';
    document.getElementById('date-to').value = '';
    document.getElementById('teacher-search').value = '';

    // Оновлюємо стан
    window.currentState.dateFrom = '';
    window.currentState.dateTo = '';
    window.currentState.teacherSearch = '';

    // Зберігаємо стан без дат фільтрації
    saveState();

    console.log('[SCHEDULE] Повний розклад: фільтри очищені');
    console.log('[SCHEDULE] Оновлений стан:', { ...window.currentState });

    // Показуємо розклад з очищеними фільтрами
    showSchedule(activeGroupBtn.dataset.group);

    // Повідомляємо користувача про режим перегляду
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = 'Показано повний розклад без фільтрації за датами';
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.left = '50%';
    notification.style.transform = 'translateX(-50%)';
    notification.style.backgroundColor = 'var(--primary-color)';
    notification.style.color = 'white';
    notification.style.padding = '10px 20px';
    notification.style.borderRadius = '5px';
    notification.style.zIndex = '1000';
    notification.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';

    document.body.appendChild(notification);

    // Видаляємо повідомлення через 3 секунди
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.5s';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 500);
    }, 3000);
}

// Додана допоміжна функція для витягнення базової назви предмета
function extractBaseSubjectName(subject) {
    if (!subject) return '';

    // Видаляємо номер підгрупи та інші технічні деталі
    return subject
        .replace(/^\d+\.\d+\s+/, '')  // Видаляємо номер на початку (2.26 і т.д.)
        .replace(/^КН\(зб\)\d+\.\d+\s*/, '')  // Видаляємо формат КН(зб)2.26
        .replace(/^Збірна група\s+КН\(зб\)\d+\.\d+\s*/, '')  // Видаляємо "Збірна група КН(зб)2.26"
        .toLowerCase()
        .trim();
}

// Функція для перевірки, чи потрібно відображати урок
function shouldDisplayLesson(lesson) {
    if (!lesson.subject) return false;

    const selectedSubjects = Object.keys(window.currentState.selectedSubjects);
    const searchTeacher = document.getElementById('teacher-search').value.toLowerCase();

    // Отримуємо базову назву предмета
    const coreSubject = extractCoreSubject(lesson.subject);
    console.log('[SCHEDULE] Перевірка заняття:', lesson.subject);
    console.log('[SCHEDULE] Базова назва предмета:', coreSubject);

    // Перевіряємо чи обрано предмет
    const isSubjectSelected = selectedSubjects.some(subject => {
        let normalizedSelected = normalizeSubject(subject);
        let normalizedCore = normalizeSubject(coreSubject);

        // Для збірних груп та потокових лекцій витягуємо назву з другого рядка
        let lessonToCompare = normalizedCore;
        if (lesson.subject.includes('Збірна група') || lesson.subject.includes('Потік')) {
            const lines = lesson.subject.split('\n');
            if (lines.length > 1) {
                lessonToCompare = normalizeSubject(extractCoreSubject(lines[1]));
            }
        }

        // Спеціальна обробка для Unity
        if (subject.toLowerCase().includes('unity') || lessonToCompare.toLowerCase().includes('unity')) {
            normalizedSelected = normalizedSelected.replace(/\s+/g, ' ').trim();
            lessonToCompare = lessonToCompare.replace(/\s+/g, ' ').trim();

            // Перевіряємо, чи обидва предмети містять "unity" та "технології проектування"
            const isUnityMatch =
                normalizedSelected.includes('unity') && lessonToCompare.includes('unity') &&
                (normalizedSelected.includes('технологiї') || lessonToCompare.includes('технологiї'));

            if (isUnityMatch) {
                console.log('[SCHEDULE] Знайдено співпадіння Unity');
                return true;
            }
        }

        const match = lessonToCompare.includes(normalizedSelected) ||
            normalizedSelected.includes(lessonToCompare);

        console.log('[SCHEDULE] Порівняння предметів:', {
            урок: lessonToCompare,
            обраний: normalizedSelected,
            співпадіння: match
        });

        return match;
    });

    if (!isSubjectSelected) {
        console.log('[SCHEDULE] Предмет не обрано, пропускаємо');
        return false;
    }

    // Перевіряємо чи це ПрС або Сем
    const isPrSOrSem = lesson.subject.match(/\((ПрС|Сем)\)$/i);
    if (isPrSOrSem) {
        console.log('[SCHEDULE] Знайдено ПрС/Сем, показуємо автоматично');
        return true;
    }

    // Перевіряємо пошук по викладачу
    if (searchTeacher) {
        const teacherName = lesson.teacher ? lesson.teacher.toLowerCase() : '';
        if (!teacherName.includes(searchTeacher)) {
            console.log('[SCHEDULE] Викладач не співпадає з пошуком');
            return false;
        }
    }

    // Отримуємо обрані підгрупи для цього предмета
    const selectedSubjectKey = selectedSubjects.find(subject => {
        let normalizedSelected = normalizeSubject(subject);
        let normalizedCore = normalizeSubject(coreSubject);

        // Для збірних груп та потокових лекцій
        let lessonToCompare = normalizedCore;
        if (lesson.subject.includes('Збірна група') || lesson.subject.includes('Потік')) {
            const lines = lesson.subject.split('\n');
            if (lines.length > 1) {
                lessonToCompare = normalizeSubject(extractCoreSubject(lines[1]));
            }
        }

        // Спеціальна обробка для Unity
        if (subject.toLowerCase().includes('unity') || lessonToCompare.toLowerCase().includes('unity')) {
            normalizedSelected = normalizedSelected.replace(/\s+/g, ' ').trim();
            lessonToCompare = lessonToCompare.replace(/\s+/g, ' ').trim();

            return normalizedSelected.includes('unity') && lessonToCompare.includes('unity') &&
                (normalizedSelected.includes('технологiї') || lessonToCompare.includes('технологiї'));
        }

        return lessonToCompare.includes(normalizedSelected) ||
            normalizedSelected.includes(lessonToCompare);
    });

    const selectedSubgroups = window.currentState.selectedSubjects[selectedSubjectKey] || [];

    // Для потокових лекцій
    if (lesson.subject.includes('Потік') || lesson.subject.includes('КН-21, КН-22, КН-23')) {
        return selectedSubgroups.includes('Лекція');
    }

    // Для збірних груп
    if (lesson.subject.includes('Збірна група')) {
        const zbMatch = lesson.subject.match(/КН\(зб\)(\d+\.\d+)/);
        const typeMatch = lesson.subject.match(/\((Л|Лек|Лаб)\)$/i);
        if (zbMatch && typeMatch) {
            const groupNum = zbMatch[1];
            const type = normalizeType(typeMatch[1]);
            const subgroupToCheck = `КН(зб)${groupNum}(${type})`;
            console.log('[SCHEDULE] Перевірка збірної групи:', {
                знайдена: subgroupToCheck,
                обрані: selectedSubgroups,
                співпадіння: selectedSubgroups.includes(subgroupToCheck)
            });
            return selectedSubgroups.includes(subgroupToCheck);
        }
    }

    // Для підгруп
    const subgroupMatch = lesson.subject.match(/^\(підгр\. (\d+)\)/);
    if (subgroupMatch) {
        const subgroupToCheck = `Підгрупа ${subgroupMatch[1]}`;
        console.log('[SCHEDULE] Перевірка підгрупи:', {
            знайдена: subgroupToCheck,
            обрані: selectedSubgroups,
            співпадіння: selectedSubgroups.includes(subgroupToCheck)
        });
        return selectedSubgroups.includes(subgroupToCheck);
    }

    // Для звичайних занять перевіряємо тип
    const typeMatch = lesson.subject.match(/\((Л|Лек|Лаб)\)$/i);
    if (typeMatch) {
        const type = normalizeType(typeMatch[1]);
        console.log('[SCHEDULE] Перевірка типу заняття:', {
            знайдений: type,
            обрані: selectedSubgroups,
            співпадіння: selectedSubgroups.includes(type)
        });
        return selectedSubgroups.includes(type);
    }

    // Якщо немає явного типу, показуємо заняття
    console.log('[SCHEDULE] Немає явного типу заняття, показуємо');
    return true;
}

// --- Функція застосування фільтрів ---
function applyFilters() {
    // Отримуємо значення з полів вводу
    const dateFromInput = document.getElementById('date-from').value;
    const dateToInput = document.getElementById('date-to').value;
    const teacherSearch = document.getElementById('teacher-search').value;
    
    // Конвертуємо дати з формату input (YYYY-MM-DD) у формат для фільтрації (DD.MM.YYYY)
    const dateFrom = dateFromInput ? convertInputDateToFilterFormat(dateFromInput) : '';
    const dateTo = dateToInput ? convertInputDateToFilterFormat(dateToInput) : '';
    
    // Оновлюємо стан
    window.currentState.dateFrom = dateFrom;
    window.currentState.dateTo = dateTo;
    window.currentState.teacherSearch = teacherSearch;

    console.log('[SCHEDULE] Застосування фільтрів:');
    console.log('[SCHEDULE] - dateFrom:', window.currentState.dateFrom);
    console.log('[SCHEDULE] - dateTo:', window.currentState.dateTo);
    console.log('[SCHEDULE] - teacherSearch:', window.currentState.teacherSearch);

    // Зберігаємо оновлений стан
    saveState();

    // Показуємо розклад з новими фільтрами
    const activeGroupBtn = document.querySelector('.group-btn.active');
    if (activeGroupBtn) showSchedule(activeGroupBtn.dataset.group);
}

// Функція для конвертації дати з формату input (YYYY-MM-DD) у формат для фільтрації (DD.MM.YYYY)
function convertInputDateToFilterFormat(inputDate) {
    if (!inputDate) return '';
    const parts = inputDate.split('-');
    if (parts.length !== 3) return '';
    return `${parts[2]}.${parts[1]}.${parts[0]}`;
}

// --- Функція скидання фільтрів ---
// Скидає пошук викладача і встановлює початкову дату на основі поточного дня тижня
function resetFilters() {
    console.log('[SCHEDULE] === Початок скидання фільтрів ===');
    console.log('[SCHEDULE] Поточний стан перед скиданням:', { ...window.currentState });

    // Очищаємо поля пошуку вчителя
    document.getElementById('teacher-search').value = '';
    window.currentState.teacherSearch = '';

    // Примусово встановлюємо початкову дату на основі поточного дня тижня
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 - неділя, 6 - субота
    let dateFrom = new Date(today);

    console.log(`[SCHEDULE] Скидання фільтрів. Сьогодні: ${dayOfWeek} день тижня (${today.toLocaleDateString()})`);

    // Встановлюємо початкову дату залежно від дня тижня
    if (dayOfWeek === 0) { // Якщо сьогодні неділя
        // Встановлюємо дату "з" на завтра (понеділок)
        dateFrom.setDate(today.getDate() + 1);
    } else if (dayOfWeek === 6) { // Якщо сьогодні субота
        // Встановлюємо дату "з" на вчора (п'ятницю)
        dateFrom.setDate(today.getDate() - 1);
    }

    // Форматуємо дату для стану у форматі DD.MM.YYYY
    const formattedDateFrom = formatDate(dateFrom);

    // Встановлюємо початкову дату в стан
    window.currentState.dateFrom = formattedDateFrom;
    window.currentState.dateTo = '';

    // Встановлюємо початкову дату в інтерфейсі у форматі YYYY-MM-DD
    document.getElementById('date-from').value = formatDateForInput(dateFrom);
    document.getElementById('date-to').value = '';

    console.log('[SCHEDULE] Скидання фільтрів. Нові значення:');
    console.log('[SCHEDULE] - dateFrom:', window.currentState.dateFrom);
    console.log('[SCHEDULE] - dateTo:', window.currentState.dateTo);
    console.log('[SCHEDULE] - teacherSearch:', window.currentState.teacherSearch);

    // Зберігаємо оновлений стан
    saveState();

    // Показуємо розклад з новими фільтрами
    const activeGroupBtn = document.querySelector('.group-btn.active');
    if (activeGroupBtn) showSchedule(activeGroupBtn.dataset.group);

    console.log('[SCHEDULE] === Кінець скидання фільтрів ===');
}

// --- Функція експорту розкладу у PDF ---
async function exportScheduleToPDF() {
    const activeGroupBtn = document.querySelector('.group-btn.active');
    if (!activeGroupBtn) {
        alert('Будь ласка, оберіть групу перед збереженням у PDF.');
        return;
    }

    await new Promise(resolve => setTimeout(resolve, 500));

    const scheduleTable = document.getElementById('scheduleTable');
    if (!scheduleTable || scheduleTable.querySelector('tbody').children.length === 0) {
        alert('Немає розкладу для збереження у PDF.');
        return;
    }

    try {
        // Виявлення, чи це iOS (включаючи iPhone)
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

        // Встановлюємо масштаб: 1 для iOS (iPhone), 2 для ПК та Android
        const scale = isIOS ? 1 : 2;

        const canvas = await html2canvas(scheduleTable, {
            scale: scale,
            useCORS: true,
            logging: true,
        });

        const imgData = canvas.toDataURL("image/png");
        if (!imgData || imgData === 'data:,') {
            throw new Error('Зображення не створено або порожнє');
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', `mm`, 'a4');

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const imgWidth = pageWidth - 20;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        let heightLeft = imgHeight;
        let position = 10;

        doc.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= (pageHeight - 20);

        while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            doc.addPage();
            doc.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
            heightLeft -= (pageHeight - 20);
        }

        const groupKey = document.querySelector('.group-btn.active')?.dataset.group || 'Розклад';
        const dateFrom = document.getElementById('date-from').value;
        const dateTo = document.getElementById('date-to').value;

        let fileName = groupKey;
        if (dateFrom && dateTo) {
            fileName += `_Фільтрація_${formatDate(dateFrom)}-${formatDate(dateTo)}`;
        } else if (dateFrom) {
            fileName += `_Фільтрація_з_${formatDate(dateFrom)}`;
        } else if (dateTo) {
            fileName += `_Фільтрація_до_${formatDate(dateTo)}`;
        } else {
            fileName += '_розклад';
        }

        doc.save(`${fileName}.pdf`);
    } catch (error) {
        console.error('Помилка при створенні PDF:', error);
        alert('Не вдалося завантажити PDF. Розклад можна завантажити тільки з фільтром до 2 місяців');
    }
}

// --- Ініціалізація ---
document.addEventListener('DOMContentLoaded', () => {
    localStorage.setItem('schedulesData', JSON.stringify(schedulesData));
    
    // Перевіряємо, чи є дані розкладу в localStorage і завантажуємо їх
    const currentSchedule = localStorage.getItem('currentSchedule');
    if (currentSchedule) {
        try {
            const scheduleData = JSON.parse(currentSchedule);
            // Відновлюємо дані з currentSchedule (вони будуть завантажені в restoreState)
            console.log('Завантажено збережений розклад');
            
            // Очищаємо дані сесії, щоб при поверненні на сторінку дані не зберігалися
            localStorage.removeItem('currentSchedule');
        } catch (error) {
            console.error('Помилка при завантаженні збереженого розкладу:', error);
            localStorage.removeItem('currentSchedule');
        }
    }
    
    restoreState();
    initFaculties();
    collectAllTeachers();

    // Перевірка налаштування профілю користувача
    checkProfileSetup();

    if (window.currentState.faculty) {
        showGroups(window.currentState.faculty);
    }
    if (window.currentState.group) {
        showSchedule(window.currentState.group);
    }

    const teacherSearchInput = document.getElementById('teacher-search');
    if (teacherSearchInput) {
        teacherSearchInput.addEventListener('input', () => {
            showTeacherSuggestions(teacherSearchInput.value);
            // Оновлюємо window.currentState при введенні в поле пошуку
            window.currentState.teacherSearch = teacherSearchInput.value;
            saveState();
        });
    }

    const dateFromInput = document.getElementById('date-from');
    const dateToInput = document.getElementById('date-to');
    if (dateFromInput) {
        dateFromInput.addEventListener('change', () => {
            // При зміні дати "з", оновлюємо window.currentState
            window.currentState.dateFrom = dateFromInput.value;
            saveState();
        });
    }
    if (dateToInput) {
        dateToInput.addEventListener('change', () => {
            // При зміні дати "по", оновлюємо window.currentState
            window.currentState.dateTo = dateToInput.value;
            saveState();
        });
    }

    document.addEventListener('click', (event) => {
        const suggestionsDiv = document.getElementById('teacher-suggestions');
        if (suggestionsDiv && !event.target.closest('.autocomplete-wrapper')) {
            suggestionsDiv.style.display = 'none';
        }
    });


    // Поява кнопки прокрутки вгору/вниз із анімацією
    window.onscroll = function () {
        scrollFunction();
    };

    function scrollFunction() {
        let scrollToTopBtn = document.getElementById("scrollToTopBtn");
        const arrow = scrollToTopBtn.querySelector('.toggle-arrow');
        const scrollTop = document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight;
        const clientHeight = document.documentElement.clientHeight;
        const scrollBottom = scrollHeight - clientHeight - scrollTop;

        if (scrollTop > 20 || scrollBottom > 20) {
            scrollToTopBtn.classList.add("show");
        } else {
            scrollToTopBtn.classList.remove("show");
        }

        // Логіка для зміни напрямку стрілки
        if (scrollBottom < clientHeight / 2) {
            // Білянизу сторінки — стрілка вгору
            scrollToTopBtn.dataset.direction = "up";
            arrow.classList.remove('down');
        } else if (scrollTop < clientHeight / 2) {
            // Біляверху сторінки — стрілка вниз
            scrollToTopBtn.dataset.direction = "down";
            arrow.classList.add('down');
        } else {
            // В середині сторінки — стрілка вниз (за замовчуванням)
            scrollToTopBtn.dataset.direction = "down";
            arrow.classList.add('down');
        }
    }

    // Функція для плавної прокрутки вгору/вниз
    document.getElementById("scrollToTopBtn").addEventListener("click", function () {
        const direction = this.dataset.direction;
        if (direction === "up") {
            scrollToTop();
        } else {
            scrollToBottom();
        }
    });

    function scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    function scrollToBottom() {
        window.scrollTo({
            top: document.documentElement.scrollHeight,
            behavior: 'smooth'
        });
    }

    // Функція перевірки налаштування профілю
    function checkProfileSetup() {
        console.log('[SCHEDULE] === Початок перевірки налаштування профілю користувача ===');

        // Перевіряємо, чи обрані предмети в профілі
        const hasSelectedSubjects = window.currentState.selectedSubjects &&
            Object.keys(window.currentState.selectedSubjects).length > 0;

        // Перевіряємо, чи обрана група
        const hasSelectedGroup = window.currentState.group !== null && window.currentState.group !== undefined;

        // Перевіряємо, чи були колись налаштовані предмети
        const hadSelectedSubjects = localStorage.getItem('hadSelectedSubjects') === 'true';

        // Детальне логування стану профілю
        console.log('[SCHEDULE] Стан профілю:');
        console.log('[SCHEDULE] - Обрані предмети:', hasSelectedSubjects);
        console.log('[SCHEDULE] - Кількість обраних предметів:', Object.keys(window.currentState.selectedSubjects || {}).length);
        console.log('[SCHEDULE] - Обрана група:', hasSelectedGroup, window.currentState.group);
        console.log('[SCHEDULE] - Раніше були обрані предмети:', hadSelectedSubjects);

        // Якщо користувач раніше мав обрані предмети, запам'ятовуємо це
        if (hasSelectedSubjects) {
            localStorage.setItem('hadSelectedSubjects', 'true');
            console.log('[SCHEDULE] Зберігаємо інформацію, що користувач обрав предмети');
        }

        // Перевіряємо, чи потрібно показувати повідомлення - тепер завжди показуємо, якщо немає обраних предметів
        const shouldShowWarning = !hasSelectedSubjects;
        console.log('[SCHEDULE] Результат перевірки - потрібно показувати повідомлення:', shouldShowWarning);

        // Показуємо повідомлення, якщо не обрані предмети
        if (shouldShowWarning) {
            showProfileWarning();
        }

        console.log('[SCHEDULE] === Кінець перевірки налаштування профілю користувача ===');

        return shouldShowWarning;
    }

    // Функція відображення повідомлення про необхідність налаштування профілю
    function showProfileWarning() {
        console.log('[SCHEDULE] Відображення повідомлення про налаштування профілю');

        // Створюємо модальне вікно
        const modal = document.createElement('div');
        modal.id = 'profile-warning-modal'; // Додаємо id для можливості пошуку вікна на сторінці
        modal.className = 'profile-warning-modal';
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        modal.style.display = 'flex';
        modal.style.justifyContent = 'center';
        modal.style.alignItems = 'center';
        modal.style.zIndex = '1000';

        // Створюємо контент модального вікна
        const modalContent = document.createElement('div');
        modalContent.id = 'profile-warning-modal-content'; // Додаємо id для контенту
        modalContent.className = 'profile-warning-modal-content';
        modalContent.style.padding = '20px';
        modalContent.style.borderRadius = '10px';
        modalContent.style.maxWidth = '500px';
        modalContent.style.width = '90%';

        // Додаємо заголовок
        const header = document.createElement('h3');
        header.id = 'profile-warning-header'; // Додаємо id для заголовка
        header.textContent = 'Увага!';
        header.style.marginTop = '0';
        header.style.fontSize = '1.5rem';
        modalContent.appendChild(header);

        // Додаємо повідомлення
        const message = document.createElement('p');
        message.textContent = 'Ви не налаштували профіль. Розклад буде пустим. Щоб побачити загальний розклад натисність на кнопку "Показати загальний розклад"';
        message.style.marginBottom = '20px';
        message.style.fontWeight = '500';
        modalContent.appendChild(message);

        // Створюємо контейнер для кнопок
        const buttonsContainer = document.createElement('div');
        buttonsContainer.style.display = 'flex';
        buttonsContainer.style.justifyContent = 'space-between';

        // Кнопка "Ок"
        const okButton = document.createElement('button');
        okButton.textContent = 'Ок';
        okButton.className = 'control-btn primary';
        okButton.style.marginRight = '10px';

        // Обробник натискання кнопки "Ок"
        okButton.addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        // Кнопка "Налаштувати профіль"
        const setupProfileButton = document.createElement('button');
        setupProfileButton.textContent = 'Налаштувати профіль';
        setupProfileButton.className = 'control-btn warning';

        // Обробник натискання кнопки "Налаштувати профіль"
        setupProfileButton.addEventListener('click', () => {
            document.body.removeChild(modal);
            window.location.href = 'profile_new.html';
        });

        // Додаємо кнопки в контейнер
        buttonsContainer.appendChild(okButton);
        buttonsContainer.appendChild(setupProfileButton);
        modalContent.appendChild(buttonsContainer);

        // Додаємо контент у модальне вікно
        modal.appendChild(modalContent);
        document.body.appendChild(modal);

        // Функція оновлення стилів модального вікна відповідно до поточної теми
        function updateModalTheme() {
            const isDarkTheme = document.documentElement.getAttribute('data-theme') === 'dark';
            console.log('[SCHEDULE] Оновлення стилів модального вікна. Темна тема:', isDarkTheme);

            if (isDarkTheme) {
                // Темна тема - встановлюємо темні кольори
                modalContent.style.backgroundColor = '#1e272e';
                modalContent.style.color = '#f5f6fa';
                modalContent.style.border = '2px solid #6c5ce7';
                modalContent.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.5)';
                header.style.color = '#ffeaa7'; // жовтий для темної теми
            } else {
                // Світла тема - встановлюємо більш контрастні кольори
                modalContent.style.backgroundColor = '#ffffff';
                modalContent.style.color = '#2d3436';
                modalContent.style.border = '2px solid #fdcb6e';
                modalContent.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.3)';
                header.style.color = 'var(--warning-color)';
            }
        }

        // Викликаємо оновлення стилів при першому відображенні
        updateModalTheme();

        // Додаємо слухач події зміни теми на документі
        const themeObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
                    updateModalTheme();
                }
            });
        });

        // Почати спостереження за зміною атрибута data-theme
        themeObserver.observe(document.documentElement, { attributes: true });

        // Зупинити спостереження, коли модальне вікно закривається
        const stopObserver = () => {
            themeObserver.disconnect();
        };

        // Додаємо обробники для зупинки спостереження
        okButton.addEventListener('click', stopObserver);
        setupProfileButton.addEventListener('click', stopObserver);
    }
});