document.addEventListener('DOMContentLoaded', () => {
    // Мобільне меню
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navList = document.querySelector('.nav-list');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            navList.classList.toggle('show');
        });
    }
    
    loadSavedItems();
});

function loadSavedItems() {
    // Завантаження збережених розкладів
    loadSavedSchedules();
    
    // Завантаження збережених рейтингів
    loadSavedRatings();
}

// Функція для завантаження збережених розкладів
function loadSavedSchedules() {
    const savedSchedulesList = document.getElementById('savedSchedulesList');
    if (!savedSchedulesList) return;
    
    // Отримуємо збережені розклади з localStorage
    let savedSchedules;
    try {
        savedSchedules = JSON.parse(localStorage.getItem('savedSchedules') || '[]');
        // Перевіряємо, чи є savedSchedules масивом
        if (!Array.isArray(savedSchedules)) {
            console.warn('savedSchedules не є масивом, перетворюємо його на масив:', savedSchedules);
            // Якщо це об'єкт з властивостями, перетворюємо його на масив
            if (typeof savedSchedules === 'object' && savedSchedules !== null) {
                savedSchedules = Object.values(savedSchedules);
                // Зберігаємо оновлений формат назад в localStorage
                localStorage.setItem('savedSchedules', JSON.stringify(savedSchedules));
            } else {
                // Якщо це не об'єкт або null, створюємо пустий масив
                savedSchedules = [];
            }
        }
        
        // Фільтруємо масив, щоб видалити null та undefined елементи
        savedSchedules = savedSchedules.filter(item => item !== null && item !== undefined);
        localStorage.setItem('savedSchedules', JSON.stringify(savedSchedules));
    } catch (error) {
        console.error('Помилка при обробці збережених розкладів:', error);
        savedSchedules = [];
    }
    
    if (savedSchedules.length === 0) {
        savedSchedulesList.innerHTML = '<p class="empty-message">Немає збережених розкладів</p>';
        return;
    }
    
    savedSchedulesList.innerHTML = '';
    savedSchedules.forEach((schedule, index) => {
        // Пропускаємо некоректні елементи
        if (!schedule || typeof schedule !== 'object') {
            console.warn('Пропущено некоректний елемент розкладу:', schedule);
            return;
        }
        
        // Використовуємо поле createdAt для дати або формуємо з поля date
        let displayDate = schedule.date || 'Не вказано';
        if (schedule.createdAt) {
            displayDate = new Date(schedule.createdAt).toLocaleDateString('uk-UA');
        }
        
        // Отримуємо тільки групу
        const groupName = schedule.group || 'Не вказано';
        
        const savedItem = document.createElement('div');
        savedItem.className = 'saved-item';
        savedItem.innerHTML = `
            <div class="saved-item-header">
                <h3>${schedule.name || `Розклад #${index + 1}`}</h3>
                <p>
                    <span class="details-count">група ${groupName}</span>
                </p>
            </div>
            <div class="saved-item-meta">
                <div class="saved-item-date">
                    <i class="far fa-calendar-alt"></i>
                    ${displayDate}
                </div>
            </div>
            <div class="saved-item-actions">
                <button class="control-btn info load-btn" onclick="viewSchedule(${index})">
                    <i class="fas fa-eye"></i> Переглянути
                </button>
                <button class="control-btn danger remove-btn" onclick="deleteSchedule(${index})">
                    <i class="fas fa-trash-alt"></i> Видалити
                </button>
            </div>
        `;
        savedSchedulesList.appendChild(savedItem);
    });
}

// Функція для завантаження збережених рейтингів
function loadSavedRatings() {
    const savedRatingsList = document.getElementById('savedRatingsList');
    if (!savedRatingsList) return;
    
    let savedRatings;
    try {
        savedRatings = JSON.parse(localStorage.getItem('savedRatings') || '[]');
        if (!Array.isArray(savedRatings)) {
            if (typeof savedRatings === 'object' && savedRatings !== null) {
                savedRatings = Object.values(savedRatings);
                localStorage.setItem('savedRatings', JSON.stringify(savedRatings));
            } else {
                savedRatings = [];
            }
        }
        
        // Фільтруємо масив, щоб видалити null та undefined елементи
        savedRatings = savedRatings.filter(item => item !== null && item !== undefined);
        localStorage.setItem('savedRatings', JSON.stringify(savedRatings));
    } catch (error) {
        console.error('Помилка при обробці збережених рейтингів:', error);
        savedRatings = [];
    }
    
    if (savedRatings.length === 0) {
        savedRatingsList.innerHTML = '<p class="empty-message">Немає збережених рейтингів</p>';
        return;
    }
    
    savedRatingsList.innerHTML = '';
    savedRatings.forEach((rating, index) => {
        // Пропускаємо некоректні елементи
        if (!rating || typeof rating !== 'object') {
            console.warn('Пропущено некоректний елемент рейтингу:', rating);
            return;
        }
        
        const createdDate = new Date(rating.createdAt || Date.now()).toLocaleDateString('uk-UA');
        
        const savedItem = document.createElement('div');
        savedItem.className = 'saved-item';
        savedItem.innerHTML = `
            <div class="saved-item-header">
                <h3>${rating.name || `Рейтинг #${index + 1}`}</h3>
            </div>
            <div class="saved-item-meta">
                <div class="saved-item-date">
                    <i class="far fa-calendar-alt"></i>
                    ${createdDate}
                </div>
            </div>
            <div class="saved-item-actions">
                <button class="control-btn info load-btn" onclick="viewRating(${index})">
                    <i class="fas fa-eye"></i> Переглянути
                </button>
                <button class="control-btn primary load-btn" onclick="loadRating(${index})">
                    <i class="fas fa-edit"></i> Редагувати
                </button>
                <button class="control-btn danger remove-btn" onclick="deleteRating(${index})">
                    <i class="fas fa-trash-alt"></i> Видалити
                </button>
            </div>
        `;
        
        savedRatingsList.appendChild(savedItem);
    });
}

// Функція для видалення збереженого розкладу
function deleteSchedule(index) {
    if (confirm('Ви впевнені, що хочете видалити цей розклад?')) {
        try {
            let savedSchedules = JSON.parse(localStorage.getItem('savedSchedules') || '[]');
            if (!Array.isArray(savedSchedules)) {
                if (typeof savedSchedules === 'object' && savedSchedules !== null) {
                    savedSchedules = Object.values(savedSchedules);
                } else {
                    savedSchedules = [];
                }
            }
            savedSchedules.splice(index, 1);
            localStorage.setItem('savedSchedules', JSON.stringify(savedSchedules));
        } catch (error) {
            console.error('Помилка при видаленні розкладу:', error);
        }
        loadSavedSchedules();
    }
}

// Функція для видалення збереженого рейтингу
function deleteRating(index) {
    if (confirm('Ви впевнені, що хочете видалити цей рейтинг?')) {
        let savedRatings;
        try {
            savedRatings = JSON.parse(localStorage.getItem('savedRatings') || '[]');
            if (!Array.isArray(savedRatings)) {
                if (typeof savedRatings === 'object' && savedRatings !== null) {
                    savedRatings = Object.values(savedRatings);
                } else {
                    savedRatings = [];
                }
            }
            savedRatings.splice(index, 1);
            localStorage.setItem('savedRatings', JSON.stringify(savedRatings));
        } catch (error) {
            console.error('Помилка при видаленні рейтингу:', error);
        }
        loadSavedRatings();
    }
}

// Функція для завантаження збереженого розкладу для редагування
function loadSchedule(index) {
    try {
        let savedSchedules = JSON.parse(localStorage.getItem('savedSchedules') || '[]');
        if (!Array.isArray(savedSchedules)) {
            if (typeof savedSchedules === 'object' && savedSchedules !== null) {
                savedSchedules = Object.values(savedSchedules);
                // Зберігаємо оновлений формат назад
                localStorage.setItem('savedSchedules', JSON.stringify(savedSchedules));
            } else {
                savedSchedules = [];
            }
        }
        
        if (savedSchedules[index]) {
            localStorage.setItem('currentSchedule', JSON.stringify(savedSchedules[index]));
            window.location.href = 'schedule_new.html';
        } else {
            console.error('Не знайдено розклад з індексом:', index);
            alert('Помилка: Не вдалося завантажити розклад');
        }
    } catch (error) {
        console.error('Помилка при завантаженні розкладу:', error);
        alert('Помилка: Не вдалося завантажити розклад');
    }
}

// Функція для завантаження збереженого рейтингу для редагування
function loadRating(index) {
    try {
        let savedRatings = JSON.parse(localStorage.getItem('savedRatings') || '[]');
        if (!Array.isArray(savedRatings)) {
            if (typeof savedRatings === 'object' && savedRatings !== null) {
                savedRatings = Object.values(savedRatings);
            } else {
                savedRatings = [];
            }
        }
        
        if (savedRatings[index]) {
            localStorage.setItem('currentRating', JSON.stringify(savedRatings[index]));
            window.location.href = 'rating_new.html';
        } else {
            console.error('Не знайдено рейтинг з індексом:', index);
            alert('Помилка: Не вдалося завантажити рейтинг');
        }
    } catch (error) {
        console.error('Помилка при завантаженні рейтингу:', error);
        alert('Помилка: Не вдалося завантажити рейтинг');
    }
}

// Функція для перегляду збереженого рейтингу
function viewRating(index) {
    try {
        let savedRatings = JSON.parse(localStorage.getItem('savedRatings') || '[]');
        if (!Array.isArray(savedRatings)) {
            if (typeof savedRatings === 'object' && savedRatings !== null) {
                savedRatings = Object.values(savedRatings);
            } else {
                savedRatings = [];
            }
        }
        
        if (savedRatings[index]) {
            localStorage.setItem('viewRating', JSON.stringify(savedRatings[index]));
            window.location.href = 'rating-view.html';
        } else {
            console.error('Не знайдено рейтинг з індексом:', index);
            alert('Помилка: Не вдалося знайти рейтинг для перегляду');
        }
    } catch (error) {
        console.error('Помилка при завантаженні рейтингу для перегляду:', error);
        alert('Помилка: Не вдалося знайти рейтинг для перегляду');
    }
}

// Функція для перегляду збереженого розкладу
function viewSchedule(index) {
    try {
        let savedSchedules = JSON.parse(localStorage.getItem('savedSchedules') || '[]');
        if (!Array.isArray(savedSchedules)) {
            if (typeof savedSchedules === 'object' && savedSchedules !== null) {
                savedSchedules = Object.values(savedSchedules);
                // Зберігаємо оновлений формат назад
                localStorage.setItem('savedSchedules', JSON.stringify(savedSchedules));
            } else {
                savedSchedules = [];
            }
        }
        
        if (savedSchedules[index]) {
            localStorage.setItem('viewSchedule', JSON.stringify(savedSchedules[index]));
            window.location.href = 'schedule-view.html';
        } else {
            console.error('Не знайдено розклад з індексом:', index);
            alert('Помилка: Не вдалося знайти розклад для перегляду');
        }
    } catch (error) {
        console.error('Помилка при завантаженні розкладу для перегляду:', error);
        alert('Помилка: Не вдалося знайти розклад для перегляду');
    }
}