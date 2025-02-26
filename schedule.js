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
    return subgroup
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim();
}

// --- Функції для витягнення підгрупи та основної назви предмета ---
function extractCoreSubject(subject) {
    if (!subject) return '';
    let core = subject
        .replace(/^\(підгр\. \d+\)\s*/, '')
        .replace(/^Збірна група \S+\s*/, '')
        .replace(/^Потік \S+\s*/, '')
        .replace(/\s*\((Л|Лекція|Лаб|Сем|ПрС)\)$/, '')
        .replace(/\n/g, ' ')
        .trim();
    return core;
}

function normalizeSubject(subject) {
    return (subject || '')
        .toLowerCase()
        .replace(/[^a-zа-яіїєґ0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function extractSubgroup(subject) {
    if (!subject) return '';
    const patterns = [
        { regex: /^\(підгр\. (\d+)\)/, format: (match) => `Підгрупа ${match[1]}` },
        { regex: /КН\(зб\)(\d+\.\d+)\s+.*\((Л|Лекція|Лаб)\)/, format: (match) => `${match[1]} (${match[2] === 'Л' ? 'Лекція' : match[2] === 'Лаб' ? 'Лабораторна' : match[2]})` },
        { regex: /\(Л\)$/, format: () => "Лекція" },
        { regex: /\(Лекція\)$/, format: () => "Лекція" },
        { regex: /\(Лаб\)$/, format: () => "Лабораторна" },
        { regex: /\(Сем\)$/, format: () => "Семінар" },
        { regex: /\(ПРС\)$/, format: () => "Практика" },
    ];
    for (const pattern of patterns) {
        const match = subject.match(pattern.regex);
        if (match) return pattern.format(match);
    }
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

    for (const groupKey in schedulesData) {
        const groupData = schedulesData[groupKey];
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
    window.currentState.group = groupKey;
    saveState();

    // Перевіряємо наявність даних для групи
    const groupData = schedulesData[groupKey];
    if (!groupData) {
        console.error('[SCHEDULE] Помилка: група', groupKey, 'не знайдена');
        return;
    }
    const schedule = groupData.schedule;
    const tbody = document.querySelector('#scheduleTable tbody');
    if (!tbody) return;

    // Очищаємо вміст таблиці
    tbody.innerHTML = '';

    // Створюємо DocumentFragment для оптимізації
    const fragment = document.createDocumentFragment();

    // Зчитуємо значення фільтрів один раз
    const dateFrom = document.getElementById('date-from').value;
    const dateTo = document.getElementById('date-to').value;
    const teacherSearch = document.getElementById('teacher-search').value.toLowerCase();

    // Часові слоти для пар
    const timeSlots = {
        1: "09:00-10:20", 2: "10:35-11:55", 3: "12:20-13:40", 4: "13:50-15:10",
        5: "15:20-16:40", 6: "16:50-18:10", 7: "18:15-19:35", 8: "19:40-21:00"
    };

    // Обробляємо кожен день у розкладі
    schedule.forEach(day => {
        // Перевіряємо, чи день входить у діапазон дат
        if (!isDateInRange(day.date, dateFrom, dateTo)) {
            return; // Пропускаємо день, якщо він не в діапазоні
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

        // Додаємо обробник кліку для розгортання/згортання
        dayHeaderRow.addEventListener('click', () => {
            isDayExpanded = !isDayExpanded;
            lessonRows.forEach(row => {
                row.style.display = isDayExpanded ? '' : 'none';
            });
            const arrowSpan = dayHeaderCell.querySelector('.toggle-arrow');
            arrowSpan.textContent = isDayExpanded ? '▼' : '▶';
        });

        // Обробляємо пари (уроки) для кожного дня
        for (let lessonNumber = 1; lessonNumber <= 8; lessonNumber++) {
            const lesson = (day.lessons || []).find(l =>
                l.time && l.time.replace(/\s/g, "") === timeSlots[lessonNumber].replace(/\s/g, "")
            ) || {};

            const coreSubject = extractCoreSubject(lesson.subject);
            const lessonSubjectLower = normalizeSubject(coreSubject);
            const lessonSubgroup = extractSubgroup(lesson.subject);

            // Перевіряємо відповідність вибраним предметам
            const isSubjectSelected = Object.keys(window.currentState.selectedSubjects).length === 0 ||
                Object.keys(window.currentState.selectedSubjects).some(subject => {
                    const normalizedSelectedSubject = normalizeSubject(subject);
                    return lessonSubjectLower.includes(normalizedSelectedSubject) ||
                           normalizedSelectedSubject.includes(lessonSubjectLower);
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
                    return normalizedSelectedSubgroup === normalizedLessonSubgroup ||
                           normalizedSelectedSubgroup.startsWith(normalizedLessonSubgroup) ||
                           normalizedLessonSubgroup.startsWith(normalizedSelectedSubgroup);
                });

            // Перевіряємо відповідність викладачу
            const isTeacherMatch = !teacherSearch || (lesson.teacher && lesson.teacher.toLowerCase().includes(teacherSearch));
            const shouldDisplay = isSubjectSelected && isTeacherMatch && isSubgroupMatch;

            // Створюємо рядок для пари
            const row = document.createElement('tr');
            row.classList.toggle('empty-slot', !lesson.subject || !shouldDisplay);
            lessonRows.push(row);

            const timeCell = document.createElement('td');
            timeCell.setAttribute('data-label', 'Час');
            const isMobileView = window.innerWidth <= 768;
            timeCell.innerHTML = `<span class="time-slot">${lessonNumber} пара ${timeSlots[lessonNumber]}</span>`;

            const subjectCell = document.createElement('td');
            subjectCell.setAttribute('data-label', 'Предмет');
            const teacherCell = document.createElement('td');
            teacherCell.setAttribute('data-label', 'Викладач');
            const groupCell = document.createElement('td');
            groupCell.setAttribute('data-label', 'Група');

            // Заповнюємо клітинки, якщо є дані та вони відповідають фільтрам
            if (lesson.subject && shouldDisplay) {
                timeCell.classList.add('lesson-cell');
                subjectCell.classList.add('lesson-cell');
                teacherCell.classList.add('lesson-cell');
                groupCell.classList.add('lesson-cell');

                subjectCell.textContent = lesson.subject;
                if (lesson.details) subjectCell.innerHTML += `<br><small>${lesson.details}</small>`;
                if (lessonSubgroup) subjectCell.innerHTML += `<br><small>${lessonSubgroup}</small>`;
                teacherCell.textContent = lesson.teacher || '';
                groupCell.textContent = lesson.group || groupKey;
            } else {
                subjectCell.textContent = '';
                teacherCell.textContent = '';
                groupCell.textContent = '';
            }

            // Додаємо клітинки до рядка
            row.appendChild(timeCell);
            row.appendChild(subjectCell);
            row.appendChild(teacherCell);
            row.appendChild(groupCell);
            fragment.appendChild(row);
        }
    });

    // Додаємо всі рядки до таблиці одним викликом
    tbody.appendChild(fragment);

    // Показуємо таблицю
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
                            return lessonSubjectLower.includes(normalizedSelectedSubject) ||
                                   normalizedSelectedSubject.includes(normalizedSelectedSubject);
                        });

                    const selectedSubjectKey = Object.keys(window.currentState.selectedSubjects).find(subject => {
                        const normalizedSelectedSubject = normalizeSubject(subject);
                        return lessonSubjectLower.includes(normalizedSelectedSubject) ||
                               normalizedSelectedSubject.includes(normalizedSelectedSubject);
                        });
                    const selectedSubgroups = selectedSubjectKey ? window.currentState.selectedSubjects[selectedSubjectKey] : [];
                    const normalizedLessonSubgroup = normalizeSubgroup(lessonSubgroup);
                    const isSubgroupMatch = selectedSubgroups.length === 0 ||
                                            selectedSubgroups.some(selectedSubgroup => {
                                                const normalizedSelectedSubgroup = normalizeSubgroup(selectedSubgroup);
                                                return normalizedSelectedSubgroup === normalizedLessonSubgroup ||
                                                       normalizedSelectedSubgroup.startsWith(normalizedLessonSubgroup) ||
                                                       normalizedLessonSubgroup.startsWith(normalizedSelectedSubgroup);
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
            lessonRows.forEach(row => {
                row.style.display = isDayExpanded ? '' : 'none';
            });
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
            // Змінили формат відображення часу, щоб він відповідав showSchedule (без <br>)
            timeCell.innerHTML = `<span class="time-slot">${lessonNumber} пара ${timeSlots[lessonNumber]}</span>`;
            const subjectCell = row.insertCell();
            const teacherCell = row.insertCell();
            const groupCell = row.insertCell();

            if (lesson.subject) {
                subjectCell.textContent = lesson.subject;
                if (lesson.details) subjectCell.innerHTML += `<br><small>${lesson.details}</small>`;
                const lessonSubgroup = extractSubgroup(lesson.subject);
                if (lessonSubgroup) subjectCell.innerHTML += `<br><small>${lessonSubgroup}</small>`;
                teacherCell.textContent = lesson.teacher || '';
                groupCell.textContent = lesson.group || groupKey;
            }
        }
    });

    document.querySelector('.schedule-view').style.display = 'block';
}


// Додана допоміжна функція для перевірки, чи урок повинен відображатися з урахуванням фільтрів
function shouldDisplayLesson(lesson, teacherSearch) {
    if (!lesson.subject) return false;

    const coreSubject = extractCoreSubject(lesson.subject);
    const lessonSubjectLower = normalizeSubject(coreSubject);
    const lessonSubgroup = extractSubgroup(lesson.subject);

    const isSubjectSelected = Object.keys(window.currentState.selectedSubjects).length === 0 ||
        Object.keys(window.currentState.selectedSubjects).some(subject => {
            const normalizedSelectedSubject = normalizeSubject(subject);
            return lessonSubjectLower.includes(normalizedSelectedSubject) ||
                   normalizedSelectedSubject.includes(normalizedSelectedSubject);
        });

    const selectedSubjectKey = Object.keys(window.currentState.selectedSubjects).find(subject => {
        const normalizedSelectedSubject = normalizeSubject(subject);
        return lessonSubjectLower.includes(normalizedSelectedSubject) ||
               normalizedSelectedSubject.includes(normalizedSelectedSubject);
        });
    const selectedSubgroups = selectedSubjectKey ? window.currentState.selectedSubjects[selectedSubjectKey] : [];
    const normalizedLessonSubgroup = normalizeSubgroup(lessonSubgroup);
    const isSubgroupMatch = selectedSubgroups.length === 0 ||
                            selectedSubgroups.some(selectedSubgroup => {
                                const normalizedSelectedSubgroup = normalizeSubgroup(selectedSubgroup);
                                return normalizedSelectedSubgroup === normalizedLessonSubgroup ||
                                       normalizedSelectedSubgroup.startsWith(normalizedLessonSubgroup) ||
                                       normalizedLessonSubgroup.startsWith(normalizedSelectedSubgroup);
                            });

    const isTeacherMatch = !teacherSearch || (lesson.teacher && lesson.teacher.toLowerCase().includes(teacherSearch));
    return isSubjectSelected && isTeacherMatch && isSubgroupMatch;
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
        const canvas = await html2canvas(scheduleTable, {
            scale: 2,
            useCORS: true,
            logging: true,
        });

        const imgData = canvas.toDataURL("image/png");
        if (!imgData || imgData === 'data:,') {
            throw new Error('Зображення не створено або порожнє');
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');

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