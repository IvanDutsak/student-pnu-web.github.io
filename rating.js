// База даних предметів
const subjectsDatabase = {
    "Українська мова за професійним спрямуванням": [3, "Залік"],
    "Історія України": [3, "Залік"],
    "Історія української культури": [3, "Залік"],
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

// Змінні для зберігання доданих предметів
let addedExamSubjects = [];
let addedCreditSubjects = [];

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

// Додавання предмету з перевіркою на дублікати
function addSubject() {
    const subjectName = document.getElementById('subjectName').value.trim();
    const subjectScore = parseInt(document.getElementById('subjectScore').value);

    if (!subjectName || isNaN(subjectScore) || subjectScore < 0 || subjectScore > 100) {
        alert('Будь ласка, введіть коректну назву предмету та оцінку (0-100).');
        return;
    }

    const subject = subjectsDatabase[subjectName];
    if (!subject) {
        alert('Предмет не знайдено в базі даних.');
        return;
    }

    // Перевірка на дублікати
    const isAlreadyAdded = 
        addedExamSubjects.some(subj => subj.name === subjectName) ||
        addedCreditSubjects.some(subj => subj.name === subjectName);

    if (isAlreadyAdded) {
        alert('Цей предмет уже додано!');
        return;
    }

    const [credits, type] = subject;
    if (type === "Екзамен") {
        addedExamSubjects.push({ 
            name: subjectName, 
            score: subjectScore, 
            credits,
            type
        });
    } else if (type === "Залік") {
        addedCreditSubjects.push({ 
            name: subjectName, 
            score: subjectScore, 
            credits,
            type
        });
    }

    updateAddedSubjectsList();
    document.getElementById('subjectName').value = '';
    document.getElementById('subjectScore').value = '';
}

// Видалення предмету
function removeSubject(subjectName, isExam) {
    if (isExam) {
        addedExamSubjects = addedExamSubjects.filter(subj => subj.name !== subjectName);
    } else {
        addedCreditSubjects = addedCreditSubjects.filter(subj => subj.name !== subjectName);
    }
    updateAddedSubjectsList();
}

// Оновлення списків доданих предметів з кнопками видалення
function updateAddedSubjectsList() {
    const examList = document.getElementById('examList');
    const creditList = document.getElementById('creditList');
    examList.innerHTML = '';
    creditList.innerHTML = '';

    addedExamSubjects.forEach(subject => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div class="subject-item-content">
                <span>
                    <strong>${subject.name}</strong>
                    <small>${subject.score} балів, ${subject.credits} кредитів</small>
                </span>
                <div class="subject-item-buttons">
                    <button class="control-btn warning edit-btn" onclick="editSubject('${subject.name}', ${subject.score}, true)">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="control-btn danger remove-btn" onclick="removeSubject('${subject.name}', true)">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;
        examList.appendChild(li);
    });

    addedCreditSubjects.forEach(subject => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div class="subject-item-content">
                <span>
                    <strong>${subject.name}</strong>
                    <small>${subject.score} балів, ${subject.credits} кредитів</small>
                </span>
                <div class="subject-item-buttons">
                    <button class="control-btn warning edit-btn" onclick="editSubject('${subject.name}', ${subject.score}, false)">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="control-btn danger remove-btn" onclick="removeSubject('${subject.name}', false)">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;
        creditList.appendChild(li);
    });
}

// Функція для редагування предмету
function editSubject(subjectName, currentScore, isExam) {
    document.getElementById('subjectName').value = subjectName;
    document.getElementById('subjectScore').value = currentScore;
    
    // Видаляємо старий запис
    removeSubject(subjectName, isExam);
    
    // Фокусуємося на полі з оцінкою для редагування
    document.getElementById('subjectScore').focus();
}

// Розрахунок рейтингу (залишається без змін)
function calculateRating() {
    if (addedExamSubjects.length === 0 && addedCreditSubjects.length === 0) {
        alert('Додайте хоча б один предмет.');
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

    const tbody = document.querySelector('.results-table tbody');
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

    window.examData = addedExamSubjects;
    window.creditData = addedCreditSubjects;
    window.R_e = R_e;
    window.R_z = R_z;
    window.R = R;
}

// Експорт до PDF, Очищення даних, Збереження локально (залишаються без змін)
async function exportToPDF() {
    const resultsElement = document.querySelector("#results");
    
    if (!resultsElement) {
        alert("Блок з результатами не знайдено!");
        return;
    }

    try {
        const canvas = await html2canvas(resultsElement, {
            scale: 2,
            useCORS: true,
            logging: false
        });

        const imgData = canvas.toDataURL("image/png");
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        const imgWidth = doc.internal.pageSize.getWidth() - 20;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        doc.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
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
    document.getElementById('results').innerHTML = '';
}

function saveLocally() {
    const name = prompt("Введіть назву для збереження рейтингу:");
    if (!name) return;

    const savedRatings = JSON.parse(localStorage.getItem('savedRatings') || '[]');
    const currentDate = new Date().toLocaleDateString('uk-UA');
    
    const examList = document.getElementById('examList');
    const creditList = document.getElementById('creditList');
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
        timestamp: new Date().toISOString(),
        html: document.getElementById('results').outerHTML
    };

    // Перевіряємо, чи є вже збережений рейтинг з такою назвою
    const existingRatingIndex = savedRatings.findIndex(rating => rating.name === name);

    if (existingRatingIndex !== -1) {
        // Якщо знайдено існуючий рейтинг, показуємо діалогове вікно
        const confirmOverwrite = confirm(`Рейтинг з назвою "${name}" вже існує. Бажаєте перезаписати його?`);
        
        if (!confirmOverwrite) {
            return; // Якщо користувач відмовився, виходимо з функції
        }
        // Якщо користувач погодився, оновлюємо існуючий рейтинг
        savedRatings[existingRatingIndex] = ratingData;
    } else {
        // Якщо рейтингу з такою назвою немає, додаємо новий
        savedRatings.push(ratingData);
    }

    localStorage.setItem('savedRatings', JSON.stringify(savedRatings));
    alert(`Рейтинг "${name}" успішно збережено!`);
    
    // Оновлюємо список збережених рейтингів, якщо ми на сторінці збережених
    if (window.location.pathname.includes('saved.html')) {
        displaySavedRatings();
    }
}

// Обробники подій (залишаються без змін)
document.addEventListener('click', (e) => {
    if (!document.getElementById('subjectName').contains(e.target) && 
        !document.getElementById('suggestions').contains(e.target)) {
        document.getElementById('suggestions').style.display = 'none';
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('edit') === 'true') {
        const editData = JSON.parse(localStorage.getItem('currentRatingEdit'));
        if (editData) {
            addedExamSubjects = editData.examSubjects || [];
            addedCreditSubjects = editData.creditSubjects || [];
            updateAddedSubjectsList();
            localStorage.removeItem('currentRatingEdit');
        }
    }
    
    const savedData = localStorage.getItem('currentRating');
    if (savedData) {
        const data = JSON.parse(savedData);
        addedExamSubjects = data.examSubjects || [];
        addedCreditSubjects = data.creditSubjects || [];
        updateAddedSubjectsList();
    }
});