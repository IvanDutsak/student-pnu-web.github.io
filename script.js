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

// Функція для показу пропозицій автозаповнення
function showSuggestions(inputText) {
    const input = document.getElementById('subjectName');
    const suggestions = document.getElementById('suggestions');
    suggestions.innerHTML = '';

    // Приховуємо список якщо поле порожнє
    if (!inputText) {
        suggestions.style.display = 'none';
        return;
    }

    // Фільтруємо предмети
    const filtered = Object.keys(subjectsDatabase)
        .filter(item => item.toLowerCase().includes(inputText.toLowerCase()))
        .slice(0, 8);

    // Нічого не показуємо якщо немає результатів
    if (filtered.length === 0) {
        suggestions.style.display = 'none';
        return;
    }

    // Додаємо елементи до списку
    filtered.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        li.onclick = () => {
            input.value = item;
            suggestions.style.display = 'none';
        };
        suggestions.appendChild(li);
    });

    // Показуємо список (позиціонуванням керує CSS)
    suggestions.style.display = 'block';
}

// Функція для вибору пропозиції
function selectSuggestion(subject) {
    document.getElementById('subjectName').value = subject;
    document.getElementById('suggestions').style.display = 'none';
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
        addedExamSubjects.push({ name: subjectName, score: subjectScore, credits });
    } else if (type === "Залік") {
        addedCreditSubjects.push({ name: subjectName, score: subjectScore, credits });
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
    if (addedExamSubjects.length === 0 && addedCreditSubjects.length === 0) {
        alert('Додайте хоча б один предмет.');
        return;
    }

    let R_e_sum = 0;
    let K_sum = 0;
    addedExamSubjects.forEach(subject => {
        R_e_sum += subject.score * subject.credits;
        K_sum += subject.credits;
    });
    const R_e = K_sum ? R_e_sum / K_sum : 0;

    let R_z_sum = 0;
    let k_sum = 0;
    addedCreditSubjects.forEach(subject => {
        R_z_sum += subject.score * subject.credits;
        k_sum += subject.credits;
    });
    const R_z = k_sum ? R_z_sum / k_sum : 0;

    const total_credits = K_sum + k_sum;
    if (total_credits === 0) {
        alert('Сума кредитів не може бути нулем.');
        return;
    }
    const R = (2 * R_e * K_sum + R_z * k_sum) / (2 * K_sum + k_sum);

    // Виведення результатів
    let resultHtml = '<h2>Результати</h2>';
    resultHtml += '<table><tr><th>Предмет</th><th>Бали</th><th>Кредити</th><th>Тип</th></tr>';
    addedExamSubjects.forEach(subject => {
        resultHtml += `<tr><td>${subject.name}</td><td>${subject.score}</td><td>${subject.credits}</td><td>Екзамен</td></tr>`;
    });
    addedCreditSubjects.forEach(subject => {
        resultHtml += `<tr><td>${subject.name}</td><td>${subject.score}</td><td>${subject.credits}</td><td>Залік</td></tr>`;
    });
    resultHtml += '</table>';
    resultHtml += `<p>Рейтинг за екзаменаційні предмети: ${R_e.toFixed(4)}</p>`;
    resultHtml += `<p>Рейтинг за залікові предмети: ${R_z.toFixed(4)}</p>`;
    resultHtml += `<p>Загальний рейтинг: ${R.toFixed(4)}</p>`;

    document.getElementById('results').innerHTML = resultHtml;

    // Зберігаємо дані для експорту
    window.examData = addedExamSubjects;
    window.creditData = addedCreditSubjects;
    window.R_e = R_e;
    window.R_z = R_z;
    window.R = R;
}

async function exportToPDF() {
    // Захоплюємо блок з результатами
    const resultsElement = document.querySelector("#results");
    
    if (!resultsElement) {
        alert("Блок з результатами не знайдено!");
        return;
    }

    try {
        // Робимо скріншот з покращеною якістю
        const canvas = await html2canvas(resultsElement, {
            scale: 2, // Подвійна роздільна здатність
            useCORS: true, // Дозволити завантаження зовнішніх ресурсів
            logging: false // Вимкнути логи для чистоти консолі
        });

        const imgData = canvas.toDataURL("image/png");

        // Створюємо PDF
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Додаємо зображення до PDF з автоматичним масштабуванням
        const imgWidth = doc.internal.pageSize.getWidth() - 20; // Відступи по 10px з обох сторін
        const imgHeight = (canvas.height * imgWidth) / canvas.width; // Збереження пропорцій

        doc.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);

        // Зберігаємо PDF
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
    const data = {
        examSubjects: addedExamSubjects,
        creditSubjects: addedCreditSubjects
    };
    localStorage.setItem('ratingData', JSON.stringify(data));
    alert('Дані збережено локально!');
}

// Ховаємо пропозиції, якщо натиснути поза полем
document.addEventListener('click', (e) => {
    if (!document.getElementById('subjectName').contains(e.target) && !document.getElementById('suggestions').contains(e.target)) {
        document.getElementById('suggestions').style.display = 'none';
    }
});