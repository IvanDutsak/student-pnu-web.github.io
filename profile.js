// Дані про групи
const groups = {
    "КН": ["КН-11", "КН-12", "КН-13", "КН-21", "КН-22", "КН-23", "КН-31", "КН-32"],
    "ІПЗ": ["ІПЗ-11", "ІПЗ-12", "ІПЗ-21", "ІПЗ-22"],
    "ІСТ": ["ІСТ-11", "ІСТ-12", "ІСТ-21"]
};



// Дані про предмети з підгрупами для "Автоматично обраних предметів"
const subjectsData = {
    "фізична культура": { displayName: "Фізична культура", credits: null, assessment: null, semester: "1,2,3,4", subgroups: ["Підгрупа 1", "Підгрупа 2"] },
    "українська мова за професійним спрямуванням": { displayName: "Українська мова за професійним спрямуванням", credits: 3, assessment: "Залік", semester: "3", subgroups: ["Підгрупа 1", "Підгрупа 2"] },
    "історія україни": { displayName: "Історія України", credits: 3, assessment: "Залік", semester: "2", subgroups: ["Підгрупа 1", "Підгрупа 2"] },
    "історія української культури": { displayName: "Історія української культури", credits: 3, assessment: "Залік", semester: "8", subgroups: ["Підгрупа 1", "Підгрупа 2"] },
    "філософія": { displayName: "Філософія", credits: 3, assessment: "Залік", semester: "3", subgroups: ["Підгрупа 1", "Підгрупа 2"] },
    "політологія": { displayName: "Політологія", credits: 3, assessment: "Залік", semester: "7", subgroups: ["Підгрупа 1", "Підгрупа 2"] },
    "економіка": { displayName: "Економіка", credits: 3, assessment: "Залік", semester: "6" },
    "безпека життєдіяльності та цивільний захист": { displayName: "Безпека життєдіяльності та цивільний захист", credits: 3, assessment: "Залік", semester: "4", subgroups: ["Підгрупа 1", "Підгрупа 2"] },
    "математичний аналіз": { displayName: "Математичний аналіз", credits: 9, assessment: "Екзамен", semester: "1,2", subgroups: ["Підгрупа 1", "Підгрупа 2"] },
    "алгебра і геометрія": { displayName: "Алгебра і геометрія", credits: 6, assessment: "Екзамен", semester: "1", subgroups: ["Підгрупа 1", "Підгрупа 2"] },
    "дискретна математика": { displayName: "Дискретна математика", credits: 3, assessment: "Екзамен", semester: "3", subgroups: ["Підгрупа 1", "Підгрупа 2"] },
    "теорія ймовірностей та математична статистика": { displayName: "Теорія ймовірностей та математична статистика", credits: 3, assessment: "Залік", semester: "2", subgroups: ["Підгрупа 1", "Підгрупа 2"] },
    "математична логіка та теорія алгоритмів": { displayName: "Математична логіка та теорія алгоритмів", credits: 6, assessment: "Залік", semester: "1", subgroups: ["Підгрупа 1", "Підгрупа 2"] },
    "диференціальні рівняння": { displayName: "Диференціальні рівняння", credits: 3, assessment: "Залік", semester: "3", subgroups: ["Підгрупа 1", "Підгрупа 2"] },
    "іноземна мова": { displayName: "Іноземна мова", credits: 9, assessment: "Залік", semester: "1,2", subgroups: ["Підгрупа 1", "Підгрупа 2"] },
    "web-дизайн": { displayName: "Web-дизайн", credits: 3, assessment: "Залік", semester: "1", subgroups: ["Підгрупа 1", "Підгрупа 2"] },
    "структури даних": { displayName: "Структури даних", credits: 3, assessment: "Залік", semester: "3", subgroups: ["Підгрупа 1", "Підгрупа 2"] },
    "архітектура обчислювальних систем": { displayName: "Архітектура обчислювальних систем", credits: 3, assessment: "Екзамен", semester: "5", subgroups: ["Підгрупа 1", "Підгрупа 2"] },
    "комп'ютерні мережі": { displayName: "Комп’ютерні мережі", credits: 3, assessment: "Екзамен", semester: "6", subgroups: ["Підгрупа 1", "Підгрупа 2"] },
    "вступ у спеціальність": { displayName: "Вступ у спеціальність", credits: 3, assessment: "Залік", semester: "1", subgroups: ["Підгрупа 1", "Підгрупа 2"] },
    "бази даних": { displayName: "Бази даних", credits: 3, assessment: "Залік", semester: "3", subgroups: ["Підгрупа 1", "Підгрупа 2"] },
    "програмна реалізація чисельних методів": { displayName: "Програмна реалізація чисельних методів", credits: 3, assessment: "Залік", semester: "4", subgroups: ["Підгрупа 1", "Підгрупа 2"] },
    "операційні системи": { displayName: "Операційні системи", credits: 3, assessment: "Залік", semester: "6", subgroups: ["Підгрупа 1", "Підгрупа 2"] },
    "системне програмування": { displayName: "Системне програмування", credits: 6, assessment: "Екзамен", semester: "5", subgroups: ["Підгрупа 1", "Підгрупа 2"] },
    "програмування c++": { displayName: "Програмування С++", credits: 12, assessment: "Екзамен", semester: "1,2", subgroups: ["Підгрупа 1", "Підгрупа 2"] },
    "програмування c#": { displayName: "Програмування C#", credits: 6, assessment: "Екзамен", semester: "3", subgroups: ["Підгрупа 1", "Підгрупа 2"] },
    "програмування java": { displayName: "Програмування Java", credits: 6, assessment: "Екзамен", semester: "4", subgroups: ["Підгрупа 1", "Підгрупа 2"] },
    "паралельні та розподілені обчислення": { displayName: "Паралельні та розподілені обчислення", credits: 3, assessment: "Екзамен", semester: "7", subgroups: ["Підгрупа 1", "Підгрупа 2"] },
    "платформи корпоративних інформаційних систем": { displayName: "Платформи корпоративних інформаційних систем", credits: 3, assessment: "Залік", semester: "7", subgroups: ["Підгрупа 1", "Підгрупа 2"] },
    "програмування та підтримка веб-застосувань": { displayName: "Програмування та підтримка веб-застосувань", credits: 3, assessment: "Екзамен", semester: "7", subgroups: ["Підгрупа 1", "Підгрупа 2"] },
    "теорія програмування": { displayName: "Теорія програмування", credits: 3, assessment: "Екзамен", semester: "8", subgroups: ["Підгрупа 1", "Підгрупа 2"] },
    "цифрова техніка": { displayName: "Цифрова техніка", credits: 3, assessment: "Залік", semester: "2", subgroups: ["Підгрупа 1", "Підгрупа 2"] },
    "мікропрограмування": { displayName: "Мікропрограмування", credits: 3, assessment: "Залік", semester: "3", subgroups: ["Підгрупа 1", "Підгрупа 2"] },
    "мікропроцесорні системи": { displayName: "Мікропроцесорні системи", credits: 3, assessment: "Екзамен", semester: "4", subgroups: ["Підгрупа 1", "Підгрупа 2"] },
    "теорія інформації та кодування": { displayName: "Теорія інформації та кодування", credits: 6, assessment: "Екзамен", semester: "4", subgroups: ["Підгрупа 1", "Підгрупа 2"] },
    "перетворення форми інформації та цифрова обробка інформації": { displayName: "Перетворення форми інформації та цифрова обробка інформації", credits: 3, assessment: "Залік", semester: "5", subgroups: ["Підгрупа 1", "Підгрупа 2"] },
    "аналіз даних": { displayName: "Аналіз даних", credits: 3, assessment: "Екзамен", semester: "6", subgroups: ["Підгрупа 1", "Підгрупа 2"] },
    "безпека інфотехнологій": { displayName: "Безпека інфотехнологій", credits: 3, assessment: "Залік", semester: "4", subgroups: ["Підгрупа 1", "Підгрупа 2"] },
    "курсова робота": { displayName: "Курсова робота 2", credits: 3, assessment: "Курсова робота", semester: "5", subgroups: ["Підгрупа 1", "Підгрупа 2"] },
    "кваліфікаційна робота": { displayName: "Кваліфікаційна робота", credits: 3, assessment: "Екзамен", semester: "8", subgroups: ["Підгрупа 1", "Підгрупа 2"] },
    "навчальна практика": { displayName: "Навчальна практика", credits: 3, assessment: "Залік", semester: "2", subgroups: ["Підгрупа 1", "Підгрупа 2"] },
    "обчислювальна практика": { displayName: "Обчислювальна практика", credits: 3, assessment: "Залік", semester: "4", subgroups: ["Підгрупа 1", "Підгрупа 2"] },
    "виробнича практика": { displayName: "Виробнича практика", credits: 9, assessment: "Залік", semester: "8", subgroups: ["Підгрупа 1", "Підгрупа 2"] },
    "практикум з програмування": { displayName: "Практикум з програмування", credits: 3, assessment: "Екзамен", semester: "6" },
    "управління it-проектами": { displayName: "Управління IT-проектами", credits: 3, assessment: "Залік", semester: "4", subgroups: ["Підгрупа 1", "Підгрупа 2"] },
    "іноземна мова професійного спрямування": { displayName: "Іноземна мова професійного спрямування", credits: 6, assessment: "Залік", semester: "5", subgroups: ["Підгрупа 1", "Підгрупа 2"] },
    "основи проджект менеджменту": { displayName: "Основи проджект менеджменту", credits: 3, assessment: "Залік", semester: "4", subgroups: ["Підгрупа 1", "Підгрупа 2"] },
    "практикум технічного перекладу": { displayName: "Практикум технічного перекладу", credits: 6, assessment: "Залік", semester: "5", subgroups: ["Підгрупа 1", "Підгрупа 2"] },
    "алгоритми обробки зображень": { displayName: "Алгоритми обробки зображень", credits: 3, assessment: "Залік", semester: "5", subgroups: ["Підгрупа 1", "Підгрупа 2"] },
    "основи розробки комп'ютерних ігор": { displayName: "Основи розробки комп’ютерних ігор", credits: 6, assessment: "Залік", semester: "5", subgroups: ["Підгрупа 1", "Підгрупа 2"] },
    "технології проектування комп'ютерних ігор (unity)": { displayName: "Технології проектування комп’ютерних ігор (Unity)", credits: 6, assessment: "Залік", semester: "6", subgroups: ["2.19 (Лекція)", "2.20", "2.21"] },
    "web-програмування (javascript)": { displayName: "WEB – програмування (JavaScript)", credits: 6, assessment: "Залік", semester: "6", subgroups: ["2.23 (Лекція)", "2.24", "2.25", "2.26"] },
    "алгоритми на графах": { displayName: "Алгоритми на графах", credits: 3, assessment: "Залік", semester: "6", subgroups: ["2.28 (Лекція)", "2.28"] },
    "доповнена реальність, симулятори та людино-машинні інтерфейси": { displayName: "Доповнена реальність, симулятори та людино-машинні інтерфейси", credits: 6, assessment: "Залік", semester: "7", subgroups: ["Підгрупа 1", "Підгрупа 2"] },
    "веб-програмування (php)": { displayName: "Веб-програмування (PHP)", credits: 6, assessment: "Залік", semester: "7", subgroups: ["Підгрупа 1", "Підгрупа 2"] },
    "серверне програмування": { displayName: "Серверне програмування", credits: 6, assessment: "Залік", semester: "7", subgroups: ["Підгрупа 1", "Підгрупа 2"] },
    "розробка web-додатків (typescript)": { displayName: "Розробка WEB-додатків (TypeScript)", credits: 3, assessment: "Залік", semester: "8", subgroups: ["Підгрупа 1", "Підгрупа 2"] },
    "проектування систем глибинного навчання": { displayName: "Проектування систем глибинного навчання", credits: 6, assessment: "Залік", semester: "8", subgroups: ["Підгрупа 1", "Підгрупа 2"] },
    "шаблони проектування пз": { displayName: "Шаблони проектування ПЗ", credits: 3, assessment: "Залік", semester: "5", subgroups: ["Підгрупа 1", "Підгрупа 2"] },
    "програмування мобільних додатків (android)": { displayName: "Програмування мобільних додатків (Android)", credits: 6, assessment: "Залік", semester: "5", subgroups: ["Підгрупа 1", "Підгрупа 2"] },
    "технології розробки мобільних додатків": { displayName: "Технології розробки мобільних додатків", credits: 6, assessment: "Залік", semester: "6", subgroups: ["2.22(Лекція)", "2.22"] },
    "програмування ios": { displayName: "Програмування iOS", credits: 6, assessment: "Залік", semester: "6" },
    "крос-платформне програмування (python)": { displayName: "Крос-платформне програмування (Python)", credits: 3, assessment: "Залік", semester: "6", subgroups: ["2.29 (Лекція)", "2.30", "2.31", "2.32"] },
    "python для data science": { displayName: "Python для Data Science", credits: 6, assessment: "Залік", semester: "7", subgroups: ["2.29 (Лекція)", "2.30", "2.31", "2.32"] },
    "машинне навчання": { displayName: "Машинне навчання", credits: 6, assessment: "Залік", semester: "7", subgroups: ["Підгрупа 1", "Підгрупа 2"] },
    "крос-платформні бібліотеки для розробки графічного інтерфейсу (qt/juce c++)": { displayName: "Крос-платформні бібліотеки для розробки графічного інтерфейсу (QT/Juce C++)", credits: 6, assessment: "Залік", semester: "7", subgroups: ["Підгрупа 1", "Підгрупа 2"] },
    "тестування та забезпечення якості іт проектів": { displayName: "Тестування та забезпечення якості ІТ проектів", credits: 3, assessment: "Залік", semester: "8", subgroups: ["Підгрупа 1", "Підгрупа 2"] },
    "програмування mac ios": { displayName: "Програмування Mac iOS", credits: 6, assessment: "Залік", semester: "8", subgroups: ["Підгрупа 1", "Підгрупа 2"] },
    "атестація": { displayName: "Атестація", credits: 3, assessment: "Екзамен", semester: "8", subgroups: ["Підгрупа 1", "Підгрупа 2"] },
};

window.currentState = {
    faculty: null,
    group: null,
    semester: null,
    selectedSubjects: {}, // { "предмет": ["підгрупа1", "підгрупа2", ...] }
};



// Функція нормалізації назв
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

// Функція завантаження даних з localStorage
function loadState() {
    const savedState = localStorage.getItem('studentProfileState');
    console.log('[PROFILE] Завантажено з localStorage:', savedState);
    if (savedState) {
        window.currentState = JSON.parse(savedState);
        console.log('[PROFILE] Завантажено стан:', window.currentState);
        if (Object.keys(window.currentState.selectedSubjects).length > 0) {
            showProfile();
        } else if (window.currentState.semester) {
            showSubjects(window.currentState.semester, window.currentState.group);
            showStep('step-subjects');
        } else if (window.currentState.group) {
            showGroups(window.currentState.faculty);
            showStep('step-group');
        } else if (window.currentState.faculty) {
            showGroups(window.currentState.faculty);
            showStep('step-group');
        }
    }
}

// Функція збереження даних в localStorage
function saveState() {
    console.log('[PROFILE] Зберігаю стан:', window.currentState);
    localStorage.setItem('studentProfileState', JSON.stringify(window.currentState));
    console.log('[PROFILE] Збережено в localStorage:', localStorage.getItem('studentProfileState'));
}

// Обробник вибору факультету
document.querySelectorAll('[data-faculty]').forEach(btn => {
    btn.addEventListener('click', () => {
        window.currentState.faculty = btn.dataset.faculty;
        window.currentState.group = null;
        window.currentState.semester = null;
        window.currentState.selectedSubjects = {};
        showGroups(window.currentState.faculty);
        showStep('step-group');
        saveState();
    });
});

// Показати групи для факультету
function showGroups(faculty) {
    const groupContainer = document.querySelector('.groups');
    groupContainer.innerHTML = '';
    groups[faculty].forEach(group => {
        const btn = document.createElement('button');
        btn.className = 'control-btn primary';
        btn.textContent = group;
        btn.dataset.group = group;
        btn.addEventListener('click', () => {
            window.currentState.group = group;
            window.currentState.semester = null;
            window.currentState.selectedSubjects = {};
            showStep('step-semester');
            saveState();
        });
        groupContainer.appendChild(btn);
    });
}

// Обробник вибору семестру
document.querySelectorAll('[data-semester]').forEach(btn => {
    btn.addEventListener('click', () => {
        window.currentState.semester = btn.dataset.semester;
        window.currentState.selectedSubjects = {};
        showSubjects(window.currentState.semester, window.currentState.group);
        showStep('step-subjects');
        saveState();
    });
});

// Функція для визначення курсу за групою
function getCourseFromGroup(group) {
    if (!group) return null;
    const match = group.match(/(\d+)/);
    return match ? parseInt(match[0].charAt(0)) : 1;
}

// Функція показу предметів
function showSubjects(semester, group) {
    const container = document.querySelector('.subjects-container');
    if (!container) {
        console.error('[PROFILE] Елемент .subjects-container не знайдено');
        return;
    }
    container.innerHTML = '';
    const course = getCourseFromGroup(group);
    if (!course) {
        container.innerHTML = '<p>Групу не розпізнано.</p>';
        return;
    }
    const calculatedSemester = (course - 1) * 2 + parseInt(semester);
    const autoSelectedSubjects = [];
    const otherSubjects = [];
    for (const [subject, info] of Object.entries(subjectsData)) {
        const seminars = String(info.semester).split(',').map(s => s.trim());
        const isInSemester = seminars.includes(String(calculatedSemester));
        if (isInSemester) {
            autoSelectedSubjects.push({ name: subject, ...info });
        } else {
            otherSubjects.push({ name: subject, ...info });
        }
    }

    function createSubjectDiv(subjectData, isAutoSelected) {
        const subjectDiv = document.createElement('div');
        subjectDiv.className = 'subject-category';
        
        const isChecked = window.currentState.selectedSubjects.hasOwnProperty(subjectData.name);
        let selectedSubgroups = window.currentState.selectedSubjects[subjectData.name] || [];

        // Автоматично додаємо "Підгрупа 1", "Підгрупа 2" і "Лекція" ТІЛЬКИ для предметів із "Підгрупа 1" і "Підгрупа 2"
        if (isChecked && subjectData.subgroups && subjectData.subgroups.length > 0 && 
            subjectData.subgroups.every(subgroup => subgroup.startsWith("Підгрупа"))) {
            if (!selectedSubgroups.includes("Лекція")) {
                // Додаємо "Лекцію" лише якщо її ще немає
                window.currentState.selectedSubjects[subjectData.name].push("Лекція");
                selectedSubgroups = window.currentState.selectedSubjects[subjectData.name];
                saveState();
            }
        }

        subjectDiv.innerHTML = `
            <label class="subject-item">
                <input type="checkbox" data-subject="${subjectData.name}" ${isChecked ? 'checked' : ''}>
                ${subjectData.displayName} (${subjectData.credits || '0'} кредитів, ${subjectData.assessment || '-'})
            </label>
        `;
        
        if (isAutoSelected && subjectData.subgroups && subjectData.subgroups.length > 0) {
            const subgroupsDiv = document.createElement('div');
            subgroupsDiv.className = 'subgroups';
            subgroupsDiv.style.display = isChecked ? 'block' : 'none';
            
            // Показуємо підгрупи, але додаємо "Лекцію" лише для предметів із "Підгрупа 1" і "Підгрупа 2"
            let allSubgroups = [...subjectData.subgroups];
            if (subjectData.subgroups.every(subgroup => subgroup.startsWith("Підгрупа"))) {
                allSubgroups = [...subjectData.subgroups, "Лекція"];
            }
            
            allSubgroups.forEach(subgroup => {
                const label = document.createElement('label');
                label.innerHTML = `
                    <input type="checkbox" data-subject="${subjectData.name}" data-subgroup="${subgroup}" 
                           ${selectedSubgroups.includes(subgroup) ? 'checked' : ''}>
                    ${subgroup}
                `;
                subgroupsDiv.appendChild(label);
            });
            subjectDiv.appendChild(subgroupsDiv);
        }
        
        const checkbox = subjectDiv.querySelector('input[type="checkbox"]');
        checkbox.addEventListener('change', (event) => {
            const subject = event.target.dataset.subject;
            console.log('[PROFILE] Зміна предмету:', subject, event.target.checked);
            if (event.target.checked) {
                // Якщо предмет ще не в selectedSubjects, ініціалізуємо його з порожнім масивом підгруп
                if (!window.currentState.selectedSubjects.hasOwnProperty(subject)) {
                    window.currentState.selectedSubjects[subject] = [];
                }
                const subgroupsDiv = subjectDiv.querySelector('.subgroups');
                if (subgroupsDiv) subgroupsDiv.style.display = 'block';
                
                // Якщо це предмет з "Підгрупа 1" і "Підгрупа 2", автоматично додаємо "Лекцію"
                if (subjectData.subgroups && subjectData.subgroups.every(subgroup => subgroup.startsWith("Підгрупа"))) {
                    if (!window.currentState.selectedSubjects[subject].includes("Лекція")) {
                        window.currentState.selectedSubjects[subject].push("Лекція");
                        selectedSubgroups = window.currentState.selectedSubjects[subject];
                        saveState();
                    }
                }
            } else {
                // Якщо знімаємо галочку, ховаємо підгрупи і видаляємо предмет
                const subgroupsDiv = subjectDiv.querySelector('.subgroups');
                if (subgroupsDiv) subgroupsDiv.style.display = 'none';
                delete window.currentState.selectedSubjects[subject];
            }
            saveState();
        });
        
        const subgroupCheckboxes = subjectDiv.querySelectorAll('.subgroups input[type="checkbox"]');
        subgroupCheckboxes.forEach(subgroupCheckbox => {
            subgroupCheckbox.addEventListener('change', (event) => {
                const subject = event.target.dataset.subject;
                const subgroup = event.target.dataset.subgroup;
                console.log('[PROFILE] Зміна підгрупи:', subject, subgroup, event.target.checked);
                if (event.target.checked) {
                    // Переконуємося, що subject існує в selectedSubjects
                    if (!window.currentState.selectedSubjects.hasOwnProperty(subject)) {
                        window.currentState.selectedSubjects[subject] = [];
                    }
                    if (!window.currentState.selectedSubjects[subject].includes(subgroup)) {
                        window.currentState.selectedSubjects[subject].push(subgroup);
                    }
                } else {
                    window.currentState.selectedSubjects[subject] = 
                        window.currentState.selectedSubjects[subject].filter(s => s !== subgroup);
                    // Якщо немає підгруп, видаляємо предмет із selectedSubjects
                    if (window.currentState.selectedSubjects[subject].length === 0) {
                        delete window.currentState.selectedSubjects[subject];
                    }
                }
                saveState();
            });
        });
        
        return subjectDiv;
    }

    if (autoSelectedSubjects.length > 0) {
        const autoSelectedDiv = document.createElement('div');
        autoSelectedDiv.className = 'subject-category-group';
        autoSelectedDiv.innerHTML = '<h3>Автоматично обрані предмети:</h3>';
        container.appendChild(autoSelectedDiv);
        autoSelectedSubjects.forEach(subjectData => {
            autoSelectedDiv.appendChild(createSubjectDiv(subjectData, true));
        });
    }
    if (otherSubjects.length > 0) {
        const otherSubjectsDiv = document.createElement('div');
        otherSubjectsDiv.className = 'subject-category-group';
        otherSubjectsDiv.innerHTML = '<h3>Інші предмети (виберіть за бажанням):</h3>';
        container.appendChild(otherSubjectsDiv);
        otherSubjects.forEach(subjectData => {
            otherSubjectsDiv.appendChild(createSubjectDiv(subjectData, false));
        });
    }
    const confirmButton = document.createElement('button');
    confirmButton.className = 'control-btn success';
    confirmButton.textContent = 'Підтвердити';
    confirmButton.addEventListener('click', () => {
        showProfile();
        // Видаляємо цей виклик, оскільки стан вже має бути збережено
        // saveState();
    });
    container.appendChild(confirmButton);
}


// Функція показу профілю
function showProfile() {
    console.log('[PROFILE] Відображаю профіль, selectedSubjects:', window.currentState.selectedSubjects);
    const container = document.querySelector('.container');
    container.innerHTML = `
        <div class="profile-summary">
            <h2>Профіль студента</h2>
            <p><strong>Факультет:</strong> ${window.currentState.faculty}</p>
            <p><strong>Група:</strong> ${window.currentState.group}</p>
            <p><strong>Курс:</strong> ${getCourseFromGroup(window.currentState.group)}</p>
            <p><strong>Семестр:</strong> ${window.currentState.semester}</p>
            <h3>Обрані предмети:</h3>
            <ul>
                ${Object.entries(window.currentState.selectedSubjects).map(([subject, subgroups]) => {
                    const info = subjectsData[subject];
                    const subgroupsText = subgroups.length > 0 ? `- ${subgroups.join(', ')}` : '';
                    return `<li>${info.displayName} (${info.credits || '0'} кредитів, ${info.assessment || '-'}) ${subgroupsText}</li>`;
                }).join('')}
            </ul>
            <button class="control-btn primary" onclick="editSubjects()">Редагувати</button>
            <button class="control-btn danger" onclick="clearSubjects()">Очистити предмети</button>
        </div>
    `;
}

// Функція очищення предметів
function clearSubjects() {
    window.currentState.selectedSubjects = {};
    saveState();
    location.reload();
}


// Функція редагування предметів
function editSubjects() {
    const container = document.querySelector('.container');
    container.innerHTML = `
        <div id="step-subjects" class="rating-section active-step">
            <h2 class="section-title">Предмети вашого семестру</h2>
            <div class="subjects-container"></div>
            <button class="control-btn warning" onclick="previousStep('step-subjects')">Назад</button>
        </div>
    `;
    showSubjects(window.currentState.semester, window.currentState.group);
}

// Управління кроками
function showStep(stepId) {
    document.querySelectorAll('.rating-section').forEach(step => {
        step.classList.remove('active-step');
    });
    document.getElementById(stepId).classList.add('active-step');
}

// Ініціалізація
loadState();
if (!window.currentState.faculty) {
    showStep('step-faculty');
}