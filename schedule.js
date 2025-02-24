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

// --- Функції для витягнення підгрупи та основної назви предмета ---


function extractCoreSubject(subject) {
    if (!subject) return '';
    let core = subject
        .replace(/^\(підгр\. \d+\)\s*/, '') // Видаляємо "(підгр. 1)"
        .replace(/^Збірна група КН\(зб\)\d+\.\d+\s*/, '') // Видаляємо "Збірна група КН(зб)2.19"
        .replace(/^Потік КН-\d+, КН-\д+\s*/, ''); // Видаляємо "Потік КН-31, КН-32"
    return core.trim();
}



function extractSubgroup(subject) {
    if (!subject) return '';
    const patterns = [
        { regex: /^\(підгр\. (\d+)\)/, format: (match) => `Підгрупа ${match[1]}` }, // "(підгр. 1)" → "Підгрупа 1"
        { regex: /КН\(зб\)(\d+\.\d+)\s+.*\((Л|Лекція|Лаб)\)/, format: (match) => `${match[1]} (${match[2] === 'Л' ? 'Лекція' : match[2] === 'Лаб' ? 'Лабораторна' : match[2]})` }, // "КН(зб)2.19 Технології... (Л)" → "2.19 (Лекція)", "КН(зб)2.20 Технології... (Лаб)" → "2.20 (Лабораторна)"
        { regex: /\(Л\)$/, format: () => "Лекція" }, // Додаємо підтримку "(Л)" → "Лекція"
        { regex: /\(Лекція\)$/, format: () => "Лекція" }, // Додаємо підтримку "(Лекція)"
        { regex: /\(Лаб\)$/, format: () => "Лабораторна" }, // Додаємо підтримку "(Лаб)"
        { regex: /\(Сем\)$/, format: () => "Семінар" }, // Додаємо підтримку "(Сем)"
        { regex: /\(ПРС\)$/, format: () => "Практика" }, // Додаємо підтримку "(ПРС)"
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
    for (const groupKey in schedulesData) {
        const groupData = schedulesData[groupKey];
        if (groupData.faculty === faculty) {
            const btn = document.createElement('button');
            btn.className = 'group-btn';
            btn.textContent = groupKey;
            btn.onclick = () => {
                document.querySelectorAll('.group-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                showSchedule(groupKey);
            };
            btn.dataset.group = groupKey;
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

    const savedState = localStorage.getItem('studentProfileState');
    if (savedState) {
        window.currentState = JSON.parse(savedState);
    } else {
        window.currentState = {
            faculty: null,
            group: null,
            semester: null,
            selectedSubjects: {},
        };
    }
    console.log('[SCHEDULE] Поточний стан:', JSON.parse(JSON.stringify(window.currentState)));

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

    const normalizeSubject = (subject) => {
        return (subject || '')
            .toLowerCase()
            .replace(/[^a-zа-яіїєґ0-9\s]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    };

    const normalizeSubgroup = (subgroup) => {
        if (!subgroup) return '';
        let normalized = subgroup
            .replace(/\s+/g, ' ')
            .trim()
            .toLowerCase()
            .replace(/\(\л\)/i, '(лекція)') // Нормалізуємо "(Л)" як "(лекція)", нечутливо до регістру
            .replace(/\(\лаб\)/i, '(лабораторна)'); // Нормалізуємо "(Лаб)" як "(лабораторна)"

        // Видаляємо частину "(Лекція)", "(Лабораторна)" тощо, щоб дозволити співпадання з короткими версіями
        const numberMatch = normalized.match(/^\d+\.\d+/);
        if (numberMatch) {
            return numberMatch[0]; // Повертаємо лише число, наприклад, "2.20"
        }
        return normalized;
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
            console.log('[SCHEDULE] Нормалізована назва предмету:', lessonSubjectLower, 'Підгрупа:', lessonSubgroup);

            const isSubjectSelected = Object.keys(window.currentState.selectedSubjects).length === 0 || 
                Object.keys(window.currentState.selectedSubjects).some(subject => {
                    const normalizedSelectedSubject = normalizeSubject(subject);
                    return lessonSubjectLower.includes(normalizedSelectedSubject);
                });

            const selectedSubjectKey = Object.keys(window.currentState.selectedSubjects).find(subject => 
                lessonSubjectLower.includes(normalizeSubject(subject))
            );
            const selectedSubgroups = selectedSubjectKey ? window.currentState.selectedSubjects[selectedSubjectKey] : [];
            const normalizedLessonSubgroup = normalizeSubgroup(lessonSubgroup);
            const isSubgroupMatch = selectedSubgroups.length === 0 || 
                                    selectedSubgroups.some(selectedSubgroup => {
                                        const normalizedSelectedSubgroup = normalizeSubgroup(selectedSubgroup);
                                        return normalizedSelectedSubgroup === normalizedLessonSubgroup || 
                                               (normalizedSelectedSubgroup.startsWith(normalizedLessonSubgroup) || 
                                                normalizedLessonSubgroup.startsWith(normalizedSelectedSubgroup));
                                    });

            const isTeacherMatch = !teacherSearch || (lesson.teacher && lesson.teacher.toLowerCase().includes(teacherSearch));
            const shouldDisplay = isSubjectSelected && isTeacherMatch && isSubgroupMatch;

            console.log('[SCHEDULE] Відображення:', shouldDisplay, 
                '(Subject:', isSubjectSelected, 
                'Teacher:', isTeacherMatch, 
                'Subgroup Match:', isSubgroupMatch, 
                'Lesson Subgroup:', lessonSubgroup, 
                'Selected Subgroups:', selectedSubgroups, ')');

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
                console.log('[SCHEDULE] Відображено предмет:', lesson.subject, 'Підгрупа:', lessonSubgroup);
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

    const normalizeSubject = (subject) => {
        return (subject || '')
            .toLowerCase()
            .replace(/[^a-zа-яіїєґ0-9\s]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    };

    const normalizeSubgroup = (subgroup) => {
        if (!subgroup) return '';
        let normalized = subgroup
            .replace(/\s+/g, ' ')
            .trim()
            .toLowerCase()
            .replace(/\(\л\)/i, '(лекція)') // Нормалізуємо "(Л)" як "(лекція)", нечутливо до регістру
            .replace(/\(\лаб\)/i, '(лабораторна)'); // Нормалізуємо "(Лаб)" як "(лабораторна)"

        // Видаляємо частину "(Лекція)", "(Лабораторна)" тощо, щоб дозволити співпадання з короткими версіями
        const numberMatch = normalized.match(/^\d+\.\d+/);
        if (numberMatch) {
            return numberMatch[0]; // Повертаємо лише число, наприклад, "2.20"
        }
        return normalized;
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
                            return lessonSubjectLower.includes(normalizedSelectedSubject);
                        });

                    const selectedSubjectKey = Object.keys(window.currentState.selectedSubjects).find(subject => 
                        lessonSubjectLower.includes(normalizeSubject(subject))
                    );
                    const selectedSubgroups = selectedSubjectKey ? window.currentState.selectedSubjects[selectedSubjectKey] : [];
                    const normalizedLessonSubgroup = normalizeSubgroup(lessonSubgroup);
                    const isSubgroupMatch = selectedSubgroups.length === 0 || 
                                            selectedSubgroups.some(selectedSubgroup => {
                                                const normalizedSelectedSubgroup = normalizeSubgroup(selectedSubgroup);
                                                return normalizedSelectedSubgroup === normalizedLessonSubgroup || 
                                                       (normalizedSelectedSubgroup.startsWith(normalizedLessonSubgroup) || 
                                                        normalizedLessonSubgroup.startsWith(normalizedSelectedSubgroup));
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


// --- Функція застосування фільтрів ---
function applyFilters() {
    const activeGroupBtn = document.querySelector('.group-btn.active');
    if (activeGroupBtn) showSchedule(activeGroupBtn.dataset.group);
}

// --- Ініціалізація ---
document.addEventListener('DOMContentLoaded', () => {
    localStorage.setItem('schedulesData', JSON.stringify(schedulesData));
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