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

    suggestions.style.display = 'block'; // Показуємо список
}

// Додавання предмету
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

    const [credits, type] = subject;
    if (type === "Екзамен") {
        addedExamSubjects.push({ 
            name: subjectName, 
            score: subjectScore, 
            credits,
            type // Додаємо тип
        });
    } else if (type === "Залік") {
        addedCreditSubjects.push({ 
            name: subjectName, 
            score: subjectScore, 
            credits,
            type // Додаємо тип
        });
    }

    updateAddedSubjectsList();
    document.getElementById('subjectName').value = '';
    document.getElementById('subjectScore').value = '';
}

// Оновлення списків доданих предметів
function updateAddedSubjectsList() {
    const examList = document.getElementById('examList');
    const creditList = document.getElementById('creditList');
    examList.innerHTML = '';
    creditList.innerHTML = '';

    addedExamSubjects.forEach(subject => {
        const li = document.createElement('li');
        li.textContent = `${subject.name}: ${subject.score} балів, ${subject.credits} кредитів`;
        examList.appendChild(li);
    });

    addedCreditSubjects.forEach(subject => {
        const li = document.createElement('li');
        li.textContent = `${subject.name}: ${subject.score} балів, ${subject.credits} кредитів`;
        creditList.appendChild(li);
    });
}

// Розрахунок рейтингу
function calculateRating() {
    // Перевірка на наявність доданих предметів
    if (addedExamSubjects.length === 0 && addedCreditSubjects.length === 0) {
        alert('Додайте хоча б один предмет.');
        return;
    }

    // Ініціалізація змінних для розрахунків
    let examTotal = 0;    // Сума (бал * кредити) для екзаменів
    let examCredits = 0;  // Загальна кількість кредитів для екзаменів
    let creditTotal = 0;  // Сума (бал * кредити) для заліків
    let creditCredits = 0;// Загальна кількість кредитів для заліків

    // Розрахунок для екзаменаційних предметів
    addedExamSubjects.forEach(subject => {
        examTotal += subject.score * subject.credits;
        examCredits += subject.credits;
    });

    // Розрахунок для залікових предметів
    addedCreditSubjects.forEach(subject => {
        creditTotal += subject.score * subject.credits;
        creditCredits += subject.credits;
    });

    // Обчислення рейтингів
    const R_e = examCredits > 0 ? examTotal / examCredits : 0;  // Рейтинг екзаменів
    const R_z = creditCredits > 0 ? creditTotal / creditCredits : 0; // Рейтинг заліків
    
    // Обчислення загального рейтингу
    const totalCredits = examCredits + creditCredits;
    const R = totalCredits > 0 
        ? (2 * R_e * examCredits + R_z * creditCredits) / (2 * examCredits + creditCredits) 
        : 0;

    // Оновлення таблиці результатів
    const tbody = document.querySelector('.results-table tbody');
    tbody.innerHTML = ''; // Очищення таблиці

    // Додавання рядків для екзаменів
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

    // Додавання рядків для заліків
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

    // Оновлення підсумкових значень
    document.getElementById('examRating').textContent = R_e.toFixed(2);
    document.getElementById('creditRating').textContent = R_z.toFixed(2);
    document.getElementById('totalRating').textContent = R.toFixed(2);

    // Збереження даних для експорту
    window.examData = addedExamSubjects;
    window.creditData = addedCreditSubjects;
    window.R_e = R_e;
    window.R_z = R_z;
    window.R = R;
}

// Експорт до PDF
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

// Очищення даних
function clearData() {
    addedExamSubjects = [];
    addedCreditSubjects = [];
    updateAddedSubjectsList();
    document.getElementById('results').innerHTML = '';
}

// Збереження локально
function saveLocally() {
    const name = prompt("Введіть назву для збереження рейтингу:");
    if (!name) return;

    const data = {
        examSubjects: addedExamSubjects.map(subj => ({
            ...subj,
            type: "Екзамен" // Явно вказуємо тип
        })),
        creditSubjects: addedCreditSubjects.map(subj => ({
            ...subj,
            type: "Залік" // Явно вказуємо тип
        })),
        R_e: window.R_e,
        R_z: window.R_z,
        R: window.R,
        timestamp: new Date().toISOString(),
        // Додаємо HTML для швидкого відображення
        html: document.getElementById('results').outerHTML
    };

    localStorage.setItem(`rating_${name}`, JSON.stringify(data));
    alert(`Рейтинг "${name}" збережено!`);
}

// Ховаємо пропозиції при кліку поза полем
document.addEventListener('click', (e) => {
    if (!document.getElementById('subjectName').contains(e.target) && 
        !document.getElementById('suggestions').contains(e.target)) {
        document.getElementById('suggestions').style.display = 'none';
    }
});

// Відновлення даних при завантаженні
document.addEventListener('DOMContentLoaded', () => {
    const savedData = localStorage.getItem('currentRating');
    if (savedData) {
        const data = JSON.parse(savedData);
        addedExamSubjects = data.examSubjects || [];
        addedCreditSubjects = data.creditSubjects || [];
        updateAddedSubjectsList();
    }
});