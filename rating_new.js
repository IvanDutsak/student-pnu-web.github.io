/**
 * rating_new.js
 * Модуль для розрахунку рейтингового балу студента
 */

// База даних предметів: назва -> [кредити, тип оцінювання]
const subjectsDatabase = {
    "Українська мова за професійним спрямуванням": [3, "Залік"],
    "Історія України": [3, "Залік"],
    "Історія української культури": [3, "Залік"],
    "Фізика": [6, "Екзамен"],
    "Філософія": [3, "Залік"],
    "Політологія": [3, "Залік"],
    "Економіка": [3, "Залік"],
    "Безпека життєдіяльності та цивільний захист": [3, "Залік"],
    "Математичний аналіз": [9, "Екзамен"],
    "Алгебра і геометрія": [6, "Екзамен"],
    "Дискретна математика": [3, "Екзамен"],
    "Теорія ймовірностей та математична статистика": [3, "Залік"],
    "Математична логіка та теорія алгоритмів": [6, "Залік"],
    "Диференціальні рівняння": [3, "Залік"],
    "Іноземна мова": [9, "Залік"],
    "Web-дизайн": [3, "Залік"],
    "Структури даних": [3, "Залік"],
    "Архітектура обчислювальних систем": [3, "Екзамен"],
    "Комп'ютерні мережі": [3, "Екзамен"],
    "Вступ у спеціальність": [3, "Залік"],
    "Бази даних": [3, "Залік"],
    "Програмна реалізація чисельних методів": [3, "Залік"],
    "Операційні системи": [3, "Залік"],
    "Системне програмування": [6, "Екзамен"],
    "Програмування С++": [12, "Екзамен"],
    "Програмування C#": [6, "Екзамен"],
    "Програмування Java": [6, "Екзамен"],
    "Паралельні та розподілені обчислення": [3, "Екзамен"],
    "Платформи корпоративних інформаційних систем": [3, "Залік"],
    "Програмування та підтримка веб-застосувань": [3, "Екзамен"],
    "Теорія програмування": [3, "Екзамен"],
    "Цифрова техніка": [3, "Залік"],
    "Мікропрограмування": [3, "Залік"],
    "Мікропроцесорні системи": [3, "Екзамен"],
    "Теорія інформації та кодування": [6, "Екзамен"],
    "Перетворення форми інформації та цифрова обробка інформації": [3, "Залік"],
    "Аналіз даних": [3, "Екзамен"],
    "Безпека інфотехнологій": [3, "Залік"],
    "Курсова робота": [3, "Екзамен"],
    "Кваліфікаційна робота": [3, "Екзамен"],
    "Навчальна практика": [3, "Залік"],
    "Обчислювальна практика": [3, "Залік"],
    "Виробнича практика": [9, "Залік"],
    "Практикум з програмування": [3, "Екзамен"],
    "Управління ІТ-проектами": [3, "Залік"],
    "Іноземна мова професійного спрямування": [6, "Залік"],
    "Основи проджект менеджменту": [3, "Залік"],
    "Практикум технічного перекладу": [6, "Залік"],
    "Алгоритми обробки зображень": [3, "Залік"],
    "Основи розробки комп'ютерних ігор": [6, "Залік"],
    "Технології проектування комп'ютерних ігор (Unity)": [6, "Залік"],
    "WEB – програмування (JavaScript)": [6, "Залік"],
    "Алгоритми на графах": [3, "Залік"],
    "Доповнена реальність, симулятори та людино-машинні інтерфейси": [6, "Залік"],
    "Веб-програмування (PHP)": [6, "Залік"],
    "Серверне програмування": [6, "Залік"],
    "Розробка WEB-додатків (TypeScript)": [3, "Залік"],
    "Проектування систем глибинного навчання": [6, "Залік"],
    "Шаблони проектування ПЗ": [3, "Залік"],
    "Програмування мобільних додатків (Android)": [6, "Залік"],
    "Технології розробки мобільних додатків": [6, "Залік"],
    "Програмування iOS": [6, "Залік"],
    "Крос-платформне програмування (Python)": [3, "Залік"],
    "Python для Data Science": [6, "Залік"],
    "Машинне навчання": [6, "Залік"],
    "Крос-платформні бібліотеки для розробки графічного інтерфейсу (QT/Juce C++)": [6, "Залік"],
    "Тестування та забезпечення якості ІТ проектів": [3, "Залік"],
    "Програмування Mac iOS": [6, "Залік"]
};

let addedExamSubjects = [];
let addedCreditSubjects = [];
let editingSubject = null; // Для редагування предметів

document.addEventListener('DOMContentLoaded', function() {
    // Мобільне меню
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navList = document.querySelector('.nav-list');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            navList.classList.toggle('show');
        });
    }
    
    // Перевіряємо, чи є збережені дані для редагування
    const currentRating = localStorage.getItem('currentRating');
    
    if (currentRating) {
        try {
            const ratingData = JSON.parse(currentRating);
            
            // Заповнюємо предмети з даних рейтингу
            if (ratingData.examSubjects && Array.isArray(ratingData.examSubjects)) {
                ratingData.examSubjects.forEach(subject => {
                    addedExamSubjects.push({
                        name: subject.name,
                        score: parseFloat(subject.score),
                        credits: parseFloat(subject.credits)
                    });
                });
            }
            
            if (ratingData.creditSubjects && Array.isArray(ratingData.creditSubjects)) {
                ratingData.creditSubjects.forEach(subject => {
                    addedCreditSubjects.push({
                        name: subject.name,
                        score: parseFloat(subject.score),
                        credits: parseFloat(subject.credits)
                    });
                });
            }
            
            updateAddedSubjectsList();
            calculateRating();
            
            // Очищаємо дані сесії, щоб при повторному відвідуванні сторінки дані не завантажувались знову
            localStorage.removeItem('currentRating');
            console.log('Дані рейтингу завантажено і очищено з пам\'яті');
        } catch (error) {
            console.error('Помилка при завантаженні даних рейтингу:', error);
            localStorage.removeItem('currentRating');
        }
    }
});

function showSuggestions(inputText) {
    const input = document.getElementById('subjectName');
    const suggestions = document.getElementById('suggestions');
    suggestions.innerHTML = '';

    if (!inputText) {
        suggestions.style.display = 'none';
        return;
    }

    const filtered = Object.keys(subjectsDatabase)
        .filter(item => item.toLowerCase().includes(inputText.toLowerCase()))
        .slice(0, 8);

    if (filtered.length === 0) {
        suggestions.style.display = 'none';
        return;
    }

    filtered.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        li.onclick = () => {
            input.value = item;
            suggestions.style.display = 'none';
        };
        suggestions.appendChild(li);
    });

    suggestions.style.display = 'block';
}

function addSubject() {
    const subjectName = document.getElementById('subjectName').value.trim();
    const subjectScore = parseInt(document.getElementById('subjectScore').value);

    // Перевірка коректності введених даних
    if (!subjectName || isNaN(subjectScore) || subjectScore < 0 || subjectScore > 100) {
        alert('Будь ласка, введіть коректну назву предмету та оцінку (0-100).');
        return;
    }

    const subjectData = subjectsDatabase[subjectName];
    if (!subjectData) {
        alert('Предмет не знайдено в базі даних.');
        return;
    }

    const [credits, type] = subjectData;
    const isExam = type === "Екзамен";

    // Перевірка на дублювання предмета (враховуємо, що редагований предмет може бути замінений)
    const allSubjects = [...addedExamSubjects, ...addedCreditSubjects];
    const isAlreadyAdded = allSubjects.some(
        subj => subj.name === subjectName && (!editingSubject || editingSubject.name !== subj.name)
    );

    if (isAlreadyAdded) {
        alert('Цей предмет уже додано!');
        return;
    }

    if (editingSubject) {
        // Перевірка, чи новий предмет належить до тієї ж категорії (Екзамен/Залік)
        const editingIsExam = editingSubject.isExam;
        if (editingIsExam !== isExam) {
            alert(`Ви не можете обрати предмет, так як він є ${isExam ? 'екзаменаційним' : 'заліковим'}.`);
            return;
        }

        // Оновлюємо предмет у відповідному списку
        const list = editingIsExam ? addedExamSubjects : addedCreditSubjects;
        const index = list.findIndex(subj => subj.name === editingSubject.name);
        if (index !== -1) {
            list[index] = { name: subjectName, score: subjectScore, credits, type };
        }
        editingSubject = null; // Скидаємо editingSubject після редагування
    } else {
        // Додаємо новий предмет
        if (isExam) {
            addedExamSubjects.push({ name: subjectName, score: subjectScore, credits, type });
        } else {
            addedCreditSubjects.push({ name: subjectName, score: subjectScore, credits, type });
        }
    }

    updateAddedSubjectsList();
    calculateRating();
    document.getElementById('subjectName').value = '';
    document.getElementById('subjectScore').value = '';
}

function removeSubject(subjectName, isExam) {
    if (isExam) {
        addedExamSubjects = addedExamSubjects.filter(subj => subj.name !== subjectName);
    } else {
        addedCreditSubjects = addedCreditSubjects.filter(subj => subj.name !== subjectName);
    }
    // Скидаємо editingSubject, якщо видаляємо редагований предмет
    if (editingSubject && editingSubject.name === subjectName) {
        editingSubject = null;
    }
    updateAddedSubjectsList();
    calculateRating();
}

function updateAddedSubjectsList() {
    const examList = document.getElementById('examList');
    const creditList = document.getElementById('creditList');
    examList.innerHTML = '';
    creditList.innerHTML = '';

    addedExamSubjects.forEach(subject => {
        const li = document.createElement('li');
        li.classList.add('subject-item');
        li.innerHTML = `
            <div class="subject-details">
                <div class="subject-header">
                    <span class="subject-type-icon">
                        <i class="fas fa-graduation-cap"></i>
                    </span>
                    <span class="subject-name">${subject.name}</span>
                </div>
                <div class="subject-meta">
                    <span class="subject-score">
                        <i class="fas fa-star"></i> ${subject.score} балів
                    </span>
                    <span class="subject-credits">
                        <i class="fas fa-coins"></i> ${subject.credits} кредитів
                    </span>
                </div>
            </div>
            <div class="subject-actions">
                <button class="control-btn warning edit-btn" onclick="editSubject('${subject.name}', ${subject.score}, true)" title="Редагувати">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="control-btn danger remove-btn" onclick="removeSubject('${subject.name}', true)" title="Видалити">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        examList.appendChild(li);
    });

    addedCreditSubjects.forEach(subject => {
        const li = document.createElement('li');
        li.classList.add('subject-item');
        li.innerHTML = `
            <div class="subject-details">
                <div class="subject-header">
                    <span class="subject-type-icon">
                        <i class="fas fa-check-circle"></i>
                    </span>
                    <span class="subject-name">${subject.name}</span>
                </div>
                <div class="subject-meta">
                    <span class="subject-score">
                        <i class="fas fa-star"></i> ${subject.score} балів
                    </span>
                    <span class="subject-credits">
                        <i class="fas fa-coins"></i> ${subject.credits} кредитів
                    </span>
                </div>
            </div>
            <div class="subject-actions">
                <button class="control-btn warning edit-btn" onclick="editSubject('${subject.name}', ${subject.score}, false)" title="Редагувати">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="control-btn danger remove-btn" onclick="removeSubject('${subject.name}', false)" title="Видалити">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        creditList.appendChild(li);
    });
}

function editSubject(subjectName, currentScore, isExam) {
    document.getElementById('subjectName').value = subjectName;
    document.getElementById('subjectScore').value = currentScore;
    editingSubject = { name: subjectName, isExam: isExam };
    document.getElementById('subjectScore').focus();
}

function calculateRating() {
    const hasSubjects = addedExamSubjects.length > 0 || addedCreditSubjects.length > 0;
    const resultsSection = document.getElementById('results-section');
    resultsSection.style.display = hasSubjects ? 'block' : 'none';

    if (!hasSubjects) {
        return;
    }

    let examTotal = 0;
    let examCredits = 0;
    let creditTotal = 0;
    let creditCredits = 0;

    addedExamSubjects.forEach(subject => {
        examTotal += subject.score * subject.credits;
        examCredits += subject.credits;
    });

    addedCreditSubjects.forEach(subject => {
        creditTotal += subject.score * subject.credits;
        creditCredits += subject.credits;
    });

    const R_e = examCredits > 0 ? examTotal / examCredits : 0;
    const R_z = creditCredits > 0 ? creditTotal / creditCredits : 0;
    const totalCredits = examCredits + creditCredits;
    const R = totalCredits > 0
        ? (2 * R_e * examCredits + R_z * creditCredits) / (2 * examCredits + creditCredits)
        : 0;

    const tbody = document.getElementById('resultsTableBody');
    tbody.innerHTML = '';

    addedExamSubjects.forEach(subject => {
        tbody.innerHTML += `
            <tr>
                <td>${subject.name}</td>
                <td>${subject.score}</td>
                <td>${subject.credits}</td>
                <td>Екзамен</td>
            </tr>
        `;
    });

    addedCreditSubjects.forEach(subject => {
        tbody.innerHTML += `
            <tr>
                <td>${subject.name}</td>
                <td>${subject.score}</td>
                <td>${subject.credits}</td>
                <td>Залік</td>
            </tr>
        `;
    });

    document.getElementById('examRating').textContent = R_e.toFixed(2);
    document.getElementById('creditRating').textContent = R_z.toFixed(2);
    document.getElementById('totalRating').textContent = R.toFixed(2);

    // Оновлюємо ширину графіка (максимум 100%)
    const examBar = document.getElementById('examBar');
    const creditBar = document.getElementById('creditBar');
    examBar.style.width = `${Math.min(R_e, 100)}%`;
    creditBar.style.width = `${Math.min(R_z, 100)}%`;

    window.examData = addedExamSubjects;
    window.creditData = addedCreditSubjects;
    window.R_e = R_e;
    window.R_z = R_z;
    window.R = R;
}

async function exportToPDF() {
    const resultsElement = document.getElementById('results-section');
    if (!resultsElement) {
        alert("Блок з результатами не знайдено!");
        return;
    }

    try {
        // Зберігаємо оригінальні стилі
        const originalDisplay = resultsElement.style.display;
        const originalBackground = resultsElement.style.backgroundColor;
        const originalOpacity = resultsElement.style.opacity;

        // Встановлюємо видимість і фонові кольори для кращого рендерингу
        resultsElement.style.display = 'block';
        resultsElement.style.height = 'auto';
        resultsElement.style.backgroundColor = '#ffffff';
        resultsElement.style.opacity = '1';

        // Додаємо невелику затримку, щоб переконатися, що DOM оновлений
        await new Promise(resolve => setTimeout(resolve, 100));

        // Захоплюємо весь вміст із оптимізованими параметрами
        const canvas = await html2canvas(resultsElement, {
            scale: 2, // Покращене масштабування
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff', // Гарантуємо білий фон
            windowWidth: document.documentElement.scrollWidth,
            windowHeight: document.documentElement.scrollHeight,
            scrollX: 0,
            scrollY: -window.scrollY, // Корекція для скролінгу
            x: 0,
            y: 0,
            onclone: (clonedDoc) => {
                // Додаємо стилі для клонованого документа, щоб уникнути блідості
                const clonedElement = clonedDoc.getElementById('results-section');
                clonedElement.style.backgroundColor = '#ffffff';
                clonedElement.style.opacity = '1';
                clonedElement.style.color = '#000000';

                // Переконуємося, що графік видимий
                const chartBars = clonedElement.querySelectorAll('.chart-bar');
                chartBars.forEach(bar => {
                    bar.style.backgroundColor = '#28a745';
                    bar.style.opacity = '1';
                });

                // Переконуємося, що текст у картках чіткий
                const ratingCards = clonedElement.querySelectorAll('.rating-card');
                ratingCards.forEach(card => {
                    card.style.backgroundColor = '#f8f9fa';
                    card.style.color = '#000000';
                    card.style.opacity = '1';
                });
            }
        });

        // Повертаємо оригінальні стилі
        resultsElement.style.display = originalDisplay;
        resultsElement.style.backgroundColor = originalBackground;
        resultsElement.style.opacity = originalOpacity;

        const imgData = canvas.toDataURL("image/jpeg", 1.0); // Використовуємо JPEG із максимальною якістю
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const imgWidth = 190; // Ширина зображення в PDF (з урахуванням полів)
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        let position = 10; // Початкова позиція по Y
        const pageHeight = 277; // Висота сторінки A4 (з урахуванням полів)

        // Розбиваємо на сторінки, якщо вміст перевищує висоту
        if (imgHeight > pageHeight) {
            const totalPages = Math.ceil(imgHeight / pageHeight);
            for (let i = 0; i < totalPages; i++) {
                if (i > 0) doc.addPage();
                const srcY = i * pageHeight * (canvas.width / imgWidth); // Корекція для масштабування
                doc.addImage(imgData, "JPEG", 10, position, imgWidth, Math.min(imgHeight - (i * pageHeight), pageHeight), undefined, 'FAST');
                position = 10;
            }
        } else {
            doc.addImage(imgData, "JPEG", 10, position, imgWidth, imgHeight, undefined, 'FAST');
        }

        doc.save("рейтинг.pdf");
    } catch (error) {
        console.error("Помилка при створенні PDF:", error);
        alert("Не вдалося створити PDF. Перевірте консоль для деталей.");
    }
}

function clearData() {
    addedExamSubjects = [];
    addedCreditSubjects = [];
    updateAddedSubjectsList();
    calculateRating();
}

function saveLocally() {
    const name = prompt("Введіть назву для збереження рейтингу:");
    if (!name) return;

    const savedRatings = JSON.parse(localStorage.getItem('savedRatings') || '[]'); // Змінено ключ на 'savedRatings'
    const currentDate = new Date().toLocaleDateString('uk-UA');

    const examRating = document.getElementById('examRating').textContent;
    const creditRating = document.getElementById('creditRating').textContent;
    const totalRating = document.getElementById('totalRating').textContent;

    const examSubjects = addedExamSubjects.map(subject => ({
        name: subject.name,
        score: subject.score,
        credits: subject.credits,
        type: "Екзамен"
    }));

    const creditSubjects = addedCreditSubjects.map(subject => ({
        name: subject.name,
        score: subject.score,
        credits: subject.credits,
        type: "Залік"
    }));

    const ratingData = {
        name: name,
        date: currentDate,
        examSubjects,
        creditSubjects,
        examRating,
        creditRating,
        totalRating,
        timestamp: '2025-03-07', // Використовуємо фіксовану дату
        html: document.getElementById('results-section').outerHTML
    };

    const existingRatingIndex = savedRatings.findIndex(rating => rating.name === name);

    if (existingRatingIndex !== -1) {
        const confirmOverwrite = confirm(`Рейтинг з назвою "${name}" вже існує. Бажаєте перезаписати його?`);
        if (!confirmOverwrite) {
            return;
        }
        savedRatings[existingRatingIndex] = ratingData;
    } else {
        savedRatings.push(ratingData);
    }

    localStorage.setItem('savedRatings', JSON.stringify(savedRatings)); // Змінено ключ на 'savedRatings'
    alert(`Рейтинг "${name}" успішно збережено!`);

    if (window.location.pathname.includes('saved_new.html')) { // Змінено на 'saved_new.html'
        displaySavedRatings(); // Переконайтеся, що ця функція існує в saved_new.js або видаліть виклик, якщо її немає і вона вам не потрібна тут
    }
}

document.addEventListener('click', (e) => {
    if (!document.getElementById('subjectName').contains(e.target) &&
        !document.getElementById('suggestions').contains(e.target)) {
        document.getElementById('suggestions').style.display = 'none';
    }
});