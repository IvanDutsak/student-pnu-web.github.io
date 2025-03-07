// Функція для додавання інформаційного повідомлення на сторінку
function addPageInfo(pageType) {
    console.log('[PAGE-INFO] Ініціалізація інформаційного повідомлення для', pageType);
    
    // Перевіряємо, чи потрібно показувати повідомлення
    if (localStorage.getItem(`${pageType}InfoShown`) === 'true') {
        console.log('[PAGE-INFO] Повідомлення вже було показано раніше');
        return;
    }
    
    // Визначаємо вміст для різних типів сторінок
    const pageInfoContent = {
        'schedule': {
            title: 'Розклад занять',
            content: `
                <p>Це сторінка розкладу занять, де ви можете переглянути свій розклад відповідно до обраних налаштувань у профілі.</p>
                <ul>
                    <li>Ви можете бачити повний розклад на тиждень або обрати конкретний день</li>
                    <li>Доступна фільтрація за типом занять, викладачами і предметами</li>
                    <li>Налаштувати профіль можна через меню "Профіль" у навігації</li>
                </ul>
            `
        },
        'profile': {
            title: 'Налаштування профілю',
            content: `
                <p>Тут ви можете налаштувати свій профіль для перегляду розкладу.</p>
                <ul>
                    <li>Оберіть спеціальність, групу та семестр</li>
                    <li>Виберіть предмети, які ви вивчаєте</li>
                    <li>За необхідності, оберіть підгрупи для кожного предмета</li>
                    <li>Після налаштування профілю, ви зможете переглянути свій персоналізований розклад</li>
                </ul>
            `
        },
        'rating': {
            title: 'Розрахунок рейтингового балу',
            content: `
                <p>На цій сторінці ви можете розрахувати свій рейтинговий бал.</p>
                <ul>
                    <li>Додайте інформацію про ваші оцінки та кількість кредитів для кожного предмета</li>
                    <li>Система автоматично розрахує ваш загальний рейтинговий бал</li>
                    <li>Ви можете зберегти результати для подальшого перегляду</li>
                </ul>
            `
        },
        'saved': {
            title: 'Збережені дані',
            content: `
                <p>Тут зберігаються ваші збережені розклади та розрахунки рейтингових балів.</p>
                <ul>
                    <li>Переглядайте раніше збережені розклади</li>
                    <li>Знайдіть історію розрахунків рейтингового балу</li>
                    <li>Ви можете видалити непотрібні збережені дані</li>
                </ul>
            `
        },
        'index': {
            title: 'Головна сторінка',
            content: `
                <p>Ласкаво просимо до системи керування навчальним процесом!</p>
                <ul>
                    <li>Використовуйте меню навігації для переходу до різних розділів</li>
                    <li>Для початку налаштуйте свій профіль у розділі "Профіль"</li>
                    <li>Після цього ви зможете переглядати розклад, розраховувати рейтинговий бал та інше</li>
                </ul>
            `
        },
        'schedule-details': {
            title: 'Деталі збереженого розкладу',
            content: `
                <p>Тут ви можете переглянути деталі раніше збереженого розкладу.</p>
                <ul>
                    <li>Всі фільтри та налаштування збережені такими, якими вони були на момент збереження</li>
                    <li>Ви можете повернутися до списку збережених даних через меню "Збережене"</li>
                </ul>
            `
        },
        'rating-details': {
            title: 'Деталі збереженого рейтингового балу',
            content: `
                <p>На цій сторінці відображаються деталі збереженого розрахунку рейтингового балу.</p>
                <ul>
                    <li>Ви можете бачити всі предмети, що були включені до розрахунку</li>
                    <li>Загальний рейтинговий бал та інша статистика також відображаються тут</li>
                    <li>Повернутися до списку збережених даних можна через меню "Збережене"</li>
                </ul>
            `
        }
    };
    
    // Отримуємо інформацію для поточної сторінки
    const info = pageInfoContent[pageType];
    if (!info) {
        console.error('[PAGE-INFO] Немає інформації для типу сторінки:', pageType);
        return;
    }
    
    // Створюємо HTML блок інформаційного повідомлення
    const infoBlock = document.createElement('div');
    infoBlock.className = 'page-info';
    
    // Для сторінки розкладу додаємо додатковий клас
    if (pageType === 'schedule') {
        infoBlock.classList.add('schedule-info');
    }
    
    infoBlock.innerHTML = `
        <h3>${info.title}</h3>
        ${info.content}
        <button class="close-btn">&times;</button>
    `;
    
    // Додаємо повідомлення на сторінку (на початку body або в специфічний контейнер)
    const container = document.querySelector('.container') || document.body;
    if (container.firstChild) {
        container.insertBefore(infoBlock, container.firstChild);
    } else {
        container.appendChild(infoBlock);
    }
    
    // Додаємо обробник події для закриття повідомлення
    const closeBtn = infoBlock.querySelector('.close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            infoBlock.style.opacity = '0';
            infoBlock.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                infoBlock.remove();
            }, 500);
            
            // Зберігаємо інформацію про те, що повідомлення було показано
            localStorage.setItem(`${pageType}InfoShown`, 'true');
            console.log('[PAGE-INFO] Повідомлення закрито, статус збережено');
        });
    }
    
    console.log('[PAGE-INFO] Інформаційне повідомлення додано на сторінку');
}

// Визначаємо тип поточної сторінки
function getCurrentPageType() {
    const path = window.location.pathname;
    
    if (path.includes('schedule.html')) return 'schedule';
    if (path.includes('profile.html')) return 'profile';
    if (path.includes('rating.html')) return 'rating';
    if (path.includes('saved.html')) return 'saved';
    if (path.includes('schedule-details.html')) return 'schedule-details';
    if (path.includes('rating-details.html')) return 'rating-details';
    
    // Якщо це головна сторінка або не вдалося визначити
    if (path.includes('index.html') || path.endsWith('/')) return 'index';
    
    return null;
}

// Ініціалізуємо інформаційне повідомлення при завантаженні сторінки
document.addEventListener('DOMContentLoaded', function() {
    const pageType = getCurrentPageType();
    console.log('[PAGE-INFO] Визначено тип сторінки:', pageType);
    
    if (pageType) {
        addPageInfo(pageType);
    }
}); 