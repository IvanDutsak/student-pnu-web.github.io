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

function getDayOfWeek(dateString) {
    const date = new Date(dateString.split('.').reverse().join('-'));
    const daysOfWeek = ['Неділя', 'Понеділок', 'Вівторок', 'Середа', 'Четвер', 'П\'ятниця', 'Субота'];
    return daysOfWeek[date.getDay()];
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
    
    window.currentState.group = groupKey;
    saveState();

    const groupData = schedulesData[groupKey];
    if (!groupData) {
        console.error('[SCHEDULE] Помилка: група', groupKey, 'не знайдена');
        return;
    }
    const schedule = groupData.schedule;
    const tbody = document.querySelector('#scheduleTable tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const fragment = document.createDocumentFragment();

    const dateFrom = document.getElementById('date-from').value;
    const dateTo = document.getElementById('date-to').value;
    const teacherSearch = document.getElementById('teacher-search').value.toLowerCase();

    const timeSlots = {
        1: "09:00-10:20", 2: "10:35-11:55", 3: "12:20-13:40", 4: "13:50-15:10",
        5: "15:20-16:40", 6: "16:50-18:10", 7: "18:15-19:35", 8: "19:40-21:00"
    };

    // Перевірка мобільного перегляду
    const isMobileView = window.innerWidth <= 768;

    schedule.forEach(day => {
        if (!isDateInRange(day.date, dateFrom, dateTo)) return;

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

        dayHeaderRow.addEventListener('click', () => {
            isDayExpanded = !isDayExpanded;
            lessonRows.forEach(row => { row.style.display = isDayExpanded ? '' : 'none'; });
            const arrowSpan = dayHeaderCell.querySelector('.toggle-arrow');
            arrowSpan.textContent = isDayExpanded ? '▼' : '▶';
        });

        for (let lessonNumber = 1; lessonNumber <= 8; lessonNumber++) {
            const lesson = (day.lessons || []).find(l =>
                l.time && l.time.replace(/\s/g, "") === timeSlots[lessonNumber].replace(/\s/g, "")
            ) || {};

            const shouldDisplay = shouldDisplayLesson(lesson);

            const row = document.createElement('tr');
            row.classList.toggle('empty-slot', !lesson.subject || !shouldDisplay);
            lessonRows.push(row);

            const timeCell = document.createElement('td');
            timeCell.setAttribute('data-label', 'Час');
            timeCell.innerHTML = `<span class="time-slot">${lessonNumber} пара ${timeSlots[lessonNumber]}</span>`;

            const subjectCell = document.createElement('td');
            subjectCell.setAttribute('data-label', 'Предмет');
            const teacherCell = document.createElement('td');
            teacherCell.setAttribute('data-label', 'Викладач');
            const groupCell = document.createElement('td');
            groupCell.setAttribute('data-label', 'Група');

            if (lesson.subject && shouldDisplay) {
                if (isMobileView) {
                    subjectCell.innerHTML = `<span class="mobile-label">Предмет: </span>` + lesson.subject;
                    if (lesson.details) subjectCell.innerHTML += `<br><small>${lesson.details}</small>`;
                    teacherCell.innerHTML = `<span class="mobile-label">Викладач: </span>` + (lesson.teacher || '');
                    groupCell.innerHTML = `<span class="mobile-label">Група: </span>` + (lesson.group || groupKey);
                } else {
                    subjectCell.textContent = lesson.subject;
                    if (lesson.details) subjectCell.innerHTML += `<br><small>${lesson.details}</small>`;
                    teacherCell.textContent = lesson.teacher || '';
                    groupCell.textContent = lesson.group || groupKey;
                }
                // Додаємо класи для застосування однакового кольору
                teacherCell.classList.add('lesson-cell', 'group-color');
                groupCell.classList.add('lesson-cell', 'group-color');
            }

            row.appendChild(timeCell);
            row.appendChild(subjectCell);
            row.appendChild(teacherCell);
            row.appendChild(groupCell);
            fragment.appendChild(row);
        }
    });

    tbody.appendChild(fragment);
    document.querySelector('.schedule-view').style.display = 'block';
}

// --- Функція збереження розкладу ---
function saveSchedule() {
    const activeGroupBtn = document.querySelector('.group-btn.active');
    if (!activeGroupBtn) {
        alert('Будь ласка, оберіть групу перед збереженням.');
        return;
    }

    const groupKey = activeGroupBtn.dataset.group;
    const dateFrom = document.getElementById('date-from').value;
    const dateTo = document.getElementById('date-to').value;
    const teacherSearch = document.getElementById('teacher-search').value.toLowerCase();

    const groupData = schedulesData[groupKey];
    if (!groupData) {
        alert('Дані для обраної групи не знайдено.');
        return;
    }

    const timeSlots = {
        1: "09:00-10:20", 2: "10:35-11:55", 3: "12:20-13:40", 4: "13:50-15:10",
        5: "15:20-16:40", 6: "16:50-18:10", 7: "18:15-19:35", 8: "19:40-21:00"
    };

    const schedule = groupData.schedule
        .filter(day => isDateInRange(day.date, dateFrom, dateTo))
        .map(day => {
            const filteredLessons = [];
            for (let lessonNumber = 1; lessonNumber <= 8; lessonNumber++) {
                const lesson = (day.lessons || []).find(l =>
                    l.time && l.time.replace(/\s/g, "") === timeSlots[lessonNumber].replace(/\s/g, "")
                ) || {};

                if (lesson.subject) {
                    const coreSubject = extractCoreSubject(lesson.subject);
                    const lessonSubjectLower = normalizeSubject(coreSubject);
                    const lessonSubgroup = extractSubgroup(lesson.subject);

                    const isSubjectSelected = Object.keys(window.currentState.selectedSubjects).length === 0 ||
                        Object.keys(window.currentState.selectedSubjects).some(subject => {
                            const normalizedSelectedSubject = normalizeSubject(subject);
                            const match = lessonSubjectLower.includes(normalizedSelectedSubject) ||
                                         normalizedSelectedSubject.includes(lessonSubjectLower);
                            return match;
                        });

                    const selectedSubjectKey = Object.keys(window.currentState.selectedSubjects).find(subject => {
                        const normalizedSelectedSubject = normalizeSubject(subject);
                        return lessonSubjectLower.includes(normalizedSelectedSubject) ||
                               normalizedSelectedSubject.includes(lessonSubjectLower);
                    });
                    const selectedSubgroups = selectedSubjectKey ? window.currentState.selectedSubjects[selectedSubjectKey] : [];
                    const normalizedLessonSubgroup = normalizeSubgroup(lessonSubgroup);
                    const isSubgroupMatch = selectedSubgroups.length === 0 ||
                                            selectedSubgroups.some(selectedSubgroup => {
                                                const normalizedSelectedSubgroup = normalizeSubgroup(selectedSubgroup);
                                                const match = normalizedSelectedSubgroup === normalizedLessonSubgroup ||
                                                             normalizedSelectedSubgroup.includes(normalizedLessonSubgroup) ||
                                                             normalizedLessonSubgroup.includes(normalizedSelectedSubgroup);
                                                return match;
                                            });

                    const isTeacherMatch = !teacherSearch || (lesson.teacher && lesson.teacher.toLowerCase().includes(teacherSearch));
                    if (isSubjectSelected && isTeacherMatch && isSubgroupMatch) {
                        filteredLessons.push({
                            number: lessonNumber,
                            time: timeSlots[lessonNumber],
                            subject: lesson.subject,
                            teacher: lesson.teacher || '',
                            group: lesson.group || groupKey,
                            subgroup: lessonSubgroup,
                            details: lesson.details || ''
                        });
                    }
                }
            }
            return {
                date: day.date,
                day: day.day,
                lessons: filteredLessons
            };
        })
        .filter(day => day.lessons.length > 0);

    if (schedule.length === 0) {
        alert('Немає занять для збереження з обраними фільтрами.');
        return;
    }

    const name = prompt('Введіть назву для збереженого розкладу:');
    if (!name) {
        alert('Назву не введено. Збереження скасовано.');
        return;
    }

    const savedSchedules = JSON.parse(localStorage.getItem('savedSchedules')) || {};
    
    // Перевіряємо, чи існує розклад з такою назвою
    const existingScheduleKey = Object.keys(savedSchedules).find(key => savedSchedules[key].name === name);
    
    if (existingScheduleKey) {
        const confirmOverwrite = confirm(`Розклад з назвою "${name}" вже існує. Бажаєте перезаписати його?`);
        if (!confirmOverwrite) {
            return; // Якщо користувач відмовився, виходимо з функції
        }
        // Якщо користувач погодився, видаляємо старий розклад
        delete savedSchedules[existingScheduleKey];
    }

    // Створюємо новий ключ для розкладу
    const key = `${groupKey}_${Date.now()}`;
    savedSchedules[key] = {
        name: name,
        group: groupKey,
        dateFrom: dateFrom,
        dateTo: dateTo,
        teacherSearch: teacherSearch,
        schedule: schedule
    };

    localStorage.setItem('savedSchedules', JSON.stringify(savedSchedules));
    alert('Розклад успішно збережено!');
}

// Збереження стану
function saveState() {
    const state = {
        faculty: window.currentState?.faculty,
        group: window.currentState?.group,
        semester: window.currentState?.semester,
        selectedSubjects: window.currentState?.selectedSubjects || {},
        dateFrom: document.getElementById('date-from')?.value || '',
        dateTo: document.getElementById('date-to')?.value || '',
        teacherSearch: document.getElementById('teacher-search')?.value || ''
    };
    localStorage.setItem('appState', JSON.stringify(state));
}

// Відновлення стану
function restoreState() {
    const savedState = localStorage.getItem('appState');
    if (savedState) {
        window.currentState = JSON.parse(savedState);
    } else {
        window.currentState = {
            faculty: null,
            group: null,
            semester: null,
            selectedSubjects: {},
            dateFrom: '',
            dateTo: '',
            teacherSearch: ''
        };
    }
    document.getElementById('date-from').value = window.currentState.dateFrom || '';
    document.getElementById('date-to').value = window.currentState.dateTo || '';
    document.getElementById('teacher-search').value = window.currentState.teacherSearch || '';
    if (window.currentState.group) {
        showSchedule(window.currentState.group);
    }
}

// --- Функція відображення повного розкладу ---
function showFullSchedule() {
    const activeGroupBtn = document.querySelector('.group-btn.active');
    if (!activeGroupBtn) {
        alert('Будь ласка, оберіть групу перед переглядом розкладу.');
        return;
    }

    const groupKey = activeGroupBtn.dataset.group;
    const groupData = schedulesData[groupKey];
    if (!groupData) {
        console.error('[SCHEDULE] Помилка: група', groupKey, 'не знайдена');
        return;
    }
    const schedule = groupData.schedule;
    const tbody = document.querySelector('#scheduleTable tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const timeSlots = {
        1: "09:00-10:20", 2: "10:35-11:55", 3: "12:20-13:40", 4: "13:50-15:10",
        5: "15:20-16:40", 6: "16:50-18:10", 7: "18:15-19:35", 8: "19:40-21:00"
    };

    // Перевірка мобільного перегляду
    const isMobileView = window.innerWidth <= 768;

    schedule.forEach(day => {
        const dayHeaderRow = tbody.insertRow();
        dayHeaderRow.classList.add("day-header");
        const dayHeaderCell = dayHeaderRow.insertCell();
        dayHeaderCell.colSpan = 4;
        dayHeaderCell.style.cursor = 'pointer';
        dayHeaderCell.innerHTML = `${day.date} (${day.day}) <span class="toggle-arrow">▼</span>`;

        let lessonRows = [];
        let isDayExpanded = true;

        dayHeaderRow.addEventListener('click', () => {
            isDayExpanded = !isDayExpanded;
            lessonRows.forEach(row => { row.style.display = isDayExpanded ? '' : 'none'; });
            const arrowSpan = dayHeaderCell.querySelector('.toggle-arrow');
            arrowSpan.textContent = isDayExpanded ? '▼' : '▶';
        });

        for (let lessonNumber = 1; lessonNumber <= 8; lessonNumber++) {
            const lesson = (day.lessons || []).find(l =>
                l.time && l.time.replace(/\s/g, "") === timeSlots[lessonNumber].replace(/\s/g, "")
            ) || {};

            const row = tbody.insertRow();
            lessonRows.push(row);
            const timeCell = row.insertCell();
            timeCell.innerHTML = `<span class="time-slot">${lessonNumber} пара ${timeSlots[lessonNumber]}</span>`;

            const subjectCell = row.insertCell();
            const teacherCell = row.insertCell();
            const groupCell = row.insertCell();

            if (lesson.subject) {
                if (isMobileView) {
                    subjectCell.innerHTML = `<span class="mobile-label">Предмет: </span>` + lesson.subject;
                    if (lesson.details) subjectCell.innerHTML += `<br><small>${lesson.details}</small>`;
                    const lessonSubgroup = extractSubgroup(lesson.subject);
                    if (lessonSubgroup) subjectCell.innerHTML += `<br><small>${lessonSubgroup}</small>`;
                    teacherCell.innerHTML = `<span class="mobile-label">Викладач: </span>` + (lesson.teacher || '');
                    groupCell.innerHTML = `<span class="mobile-label">Група: </span>` + (lesson.group || groupKey);
                } else {
                    subjectCell.textContent = lesson.subject;
                    if (lesson.details) subjectCell.innerHTML += `<br><small>${lesson.details}</small>`;
                    const lessonSubgroup = extractSubgroup(lesson.subject);
                    if (lessonSubgroup) subjectCell.innerHTML += `<br><small>${lessonSubgroup}</small>`;
                    teacherCell.textContent = lesson.teacher || '';
                    groupCell.textContent = lesson.group || groupKey;
                }
                // Додаємо класи для застосування однакового кольору
                teacherCell.classList.add('lesson-cell', 'group-color');
                groupCell.classList.add('lesson-cell', 'group-color');
            }
        }
    });

    document.querySelector('.schedule-view').style.display = 'block';
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
    saveState();
    const activeGroupBtn = document.querySelector('.group-btn.active');
    if (activeGroupBtn) showSchedule(activeGroupBtn.dataset.group);
}

// --- Функція скидання фільтрів ---
function resetFilters() {
    document.getElementById('date-from').value = '';
    document.getElementById('date-to').value = '';
    document.getElementById('teacher-search').value = '';
    window.currentState.dateFrom = '';
    window.currentState.dateTo = '';
    window.currentState.teacherSearch = '';
    saveState();
    const activeGroupBtn = document.querySelector('.group-btn.active');
    if (activeGroupBtn) showSchedule(activeGroupBtn.dataset.group);
}

// --- Функція експорту розкладу у PDF ---
async function exportScheduleToPDF() {
    const activeGroupBtn = document.querySelector('.group-btn.active');
    if (!activeGroupBtn) {
        alert('Будь ласка, оберіть групу перед збереженням у PDF.');
        return;
    }

    if (!document.getElementById('date-from').value &&
        !document.getElementById('date-to').value &&
        !document.getElementById('teacher-search').value) {
        showFullSchedule();
    } else {
        applyFilters();
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
    restoreState();
    initFaculties();
    collectAllTeachers();

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
            saveState();
        });
    }

    const dateFromInput = document.getElementById('date-from');
    const dateToInput = document.getElementById('date-to');
    if (dateFromInput) dateFromInput.addEventListener('change', saveState);
    if (dateToInput) dateToInput.addEventListener('change', saveState);

    document.addEventListener('click', (event) => {
        const suggestionsDiv = document.getElementById('teacher-suggestions');
        if (suggestionsDiv && !event.target.closest('.autocomplete-wrapper')) {
            suggestionsDiv.style.display = 'none';
        }
    });

    function showScheduleForDays(days) {
        const today = new Date();
        const dateFrom = today.toISOString().split('T')[0];
        const futureDate = new Date(today);
        futureDate.setDate(today.getDate() + days);
        const dateTo = futureDate.toISOString().split('T')[0];

        document.getElementById('date-from').value = dateFrom;
        document.getElementById('date-to').value = dateTo;
        applyFilters();
    }

    function showScheduleForMonth() {
        const today = new Date();
        const dateFrom = today.toISOString().split('T')[0];
        const futureDate = new Date(today);
        futureDate.setMonth(today.getMonth() + 1);
        const dateTo = futureDate.toISOString().split('T')[0];

        document.getElementById('date-from').value = dateFrom;
        document.getElementById('date-to').value = dateTo;
        applyFilters();
    }

    // Поява кнопки прокрутки вгору/вниз із анімацією
    window.onscroll = function() {
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
    document.getElementById("scrollToTopBtn").addEventListener("click", function() {
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
});
