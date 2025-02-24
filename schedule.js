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

    const groupData = schedulesData[groupKey];
    if (!groupData) {
        console.error('[SCHEDULE] Помилка: група', groupKey, 'не знайдена');
        return;
    }
    const schedule = groupData.schedule;
    const tbody = document.querySelector('#scheduleTable tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const dateFrom = document.getElementById('date-from').value;
    const dateTo = document.getElementById('date-to').value;
    const teacherSearch = document.getElementById('teacher-search').value.toLowerCase();

    const timeSlots = {
        1: "09:00-10:20", 2: "10:35-11:55", 3: "12:20-13:40", 4: "13:50-15:10",
        5: "15:20-16:40", 6: "16:50-18:10", 7: "18:15-19:35", 8: "19:40-21:00"
    };

    schedule.forEach(day => {
        if (!isDateInRange(day.date, dateFrom, dateTo)) return;

        const dayHeaderRow = tbody.insertRow();
        dayHeaderRow.classList.add("day-header");
        const dayHeaderCell = dayHeaderRow.insertCell();
        dayHeaderCell.colSpan = 4;
        dayHeaderCell.textContent = `${day.date} (${day.day})`;

        for (let lessonNumber = 1; lessonNumber <= 8; lessonNumber++) {
            const lesson = (day.lessons || []).find(l => 
                l.time && l.time.replace(/\s/g, "") === timeSlots[lessonNumber].replace(/\s/g, "")
            ) || {};

            const coreSubject = extractCoreSubject(lesson.subject);
            const lessonSubjectLower = normalizeSubject(coreSubject);
            const lessonSubgroup = extractSubgroup(lesson.subject);

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

            const isTeacherMatch = !teacherSearch || (lesson.teacher && lesson.teacher.toLowerCase().includes(teacherSearch));
            const shouldDisplay = isSubjectSelected && isTeacherMatch && isSubgroupMatch;

            const row = tbody.insertRow();
            const timeCell = row.insertCell();
            timeCell.innerHTML = `<span class="time-slot">${lessonNumber} пара<br>${timeSlots[lessonNumber]}</span>`;
            const subjectCell = row.insertCell();
            const teacherCell = row.insertCell();
            const groupCell = row.insertCell();

            if (lesson.subject && shouldDisplay) {
                subjectCell.textContent = lesson.subject;
                if (lesson.details) subjectCell.innerHTML += `<br><small>${lesson.details}</small>`;
                if (lessonSubgroup) subjectCell.innerHTML += `<br><small>${lessonSubgroup}</small>`;
                teacherCell.textContent = lesson.teacher || '';
                groupCell.textContent = lesson.group || groupKey;
            }
        }
    });

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
        dayHeaderCell.textContent = `${day.date} (${day.day})`;

        for (let lessonNumber = 1; lessonNumber <= 8; lessonNumber++) {
            const lesson = (day.lessons || []).find(l => 
                l.time && l.time.replace(/\s/g, "") === timeSlots[lessonNumber].replace(/\s/g, "")
            ) || {};

            const row = tbody.insertRow();
            const timeCell = row.insertCell();
            timeCell.innerHTML = `<span class="time-slot">${lessonNumber} пара<br>${timeSlots[lessonNumber]}</span>`;
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
// --- Функція експорту розкладу у PDF ---
async function exportScheduleToPDF() {
    const scheduleTable = document.getElementById('scheduleTable');
    if (!scheduleTable || scheduleTable.querySelector('tbody').children.length === 0) {
        alert('Немає розкладу для збереження у PDF. Спочатку виберіть групу та застосуйте фільтри, якщо потрібно.');
        return;
    }

    try {
        const canvas = await html2canvas(scheduleTable, {
            scale: 2, // Збільшуємо якість зображення
            useCORS: true,
            logging: false
        });

        const imgData = canvas.toDataURL("image/png");
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const imgWidth = pageWidth - 20; // Залишаємо поля 10 мм з кожного боку
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        let heightLeft = imgHeight;
        let position = 10; // Початкова позиція зверху

        doc.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= (pageHeight - 20); // Віднімаємо висоту сторінки, враховуючи поля

        // Додаємо нові сторінки, якщо розклад не вміщається на одній
        while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            doc.addPage();
            doc.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
            heightLeft -= (pageHeight - 20);
        }

        // Формуємо назву файлу
        const groupKey = document.querySelector('.group-btn.active')?.dataset.group || 'Розклад';
        const dateFrom = document.getElementById('date-from').value;
        const dateTo = document.getElementById('date-to').value;

        let fileName;
        if (dateFrom && dateTo) {
            // Якщо є обидві дати, форматуємо їх і додаємо до назви
            const formattedDateFrom = formatDate(dateFrom);
            const formattedDateTo = formatDate(dateTo);
            fileName = `${groupKey}_Фільтрація_${formattedDateFrom}-${formattedDateTo}`;
        } else if (dateFrom) {
            // Якщо є тільки дата "з", додаємо тільки її
            const formattedDateFrom = formatDate(dateFrom);
            fileName = `${groupKey}_Фільтрація_з_${formattedDateFrom}`;
        } else if (dateTo) {
            // Якщо є тільки дата "до", додаємо тільки її
            const formattedDateTo = formatDate(dateTo);
            fileName = `${groupKey}_Фільтрація_до_${formattedDateTo}`;
        } else {
            // Якщо немає фільтрів за датами, просто назва групи
            fileName = `${groupKey}_розклад`;
        }

        doc.save(`${fileName}.pdf`);
    } catch (error) {
        console.error('Помилка при створенні PDF:', error);
        alert('Не вдалося створити PDF. Перевірте консоль для деталей.');
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
});