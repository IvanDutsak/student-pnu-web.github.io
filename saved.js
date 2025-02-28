function loadSavedItems() {
    // === Збережені розклади ===
    const savedSchedules = JSON.parse(localStorage.getItem('savedSchedules')) || {};
    const schedulesList = document.getElementById('savedSchedulesList');
    if (!schedulesList) return;

    if (Object.keys(savedSchedules).length === 0) {
        schedulesList.innerHTML = '<div class="empty-message">Немає збережених розкладів</div>';
    } else {
        schedulesList.innerHTML = '';
        
        // === ЗЧИТУЄМО schedulesData ===
        const schedulesData = JSON.parse(localStorage.getItem('schedulesData')) || {};
        
        for (const key in savedSchedules) {
            let isValidKey = false;

            // Перевіряємо тільки якщо schedulesData існує
            if (schedulesData) {
                for (const groupKey in schedulesData) {
                    if (key.startsWith(groupKey + "_")) {
                        isValidKey = true;
                        break;
                    }
                }
            }

            if (!isValidKey) {
                console.warn("Skipping invalid key:", key);
                continue;
            }

            const scheduleData = savedSchedules[key];
            if (scheduleData && scheduleData.name && scheduleData.group) {
                const item = document.createElement('div');
                item.className = 'saved-item';
                item.innerHTML = `
                    <div class="saved-item-header">
                        <i class="fas fa-calendar-day"></i>
                        <div>
                            <h3>${scheduleData.name}</h3>
                            <p>Група: ${scheduleData.group}</p>
                        </div>
                    </div>
                    <div class="button-group">
                        <button class="control-btn primary" onclick="showScheduleDetails('${key}')">
                            Перейти
                        </button>
                         <button class="control-btn danger" onclick="deleteSchedule('${key}', this)">
                            <i class="fas fa-trash"></i> Видалити
                        </button>
                    </div>
                `;
                schedulesList.appendChild(item);
            } else {
                console.warn(`Invalid schedule data for key: ${key}`, scheduleData);
            }
        }
    }

    // === Збережені рейтинги ===
    const savedRatings = JSON.parse(localStorage.getItem('savedRatings')) || [];
    const ratingsList = document.getElementById('savedRatingsList');
    if (!ratingsList) return;

    if (savedRatings.length === 0) {
        ratingsList.innerHTML = '<div class="empty-message">Немає збережених рейтингів</div>';
    } else {
        ratingsList.innerHTML = '';
        savedRatings.forEach((rating, index) => {
            const examCount = rating.examSubjects.length;
            const creditCount = rating.creditSubjects.length;
            const totalSubjects = examCount + creditCount;

            const item = document.createElement('div');
            item.className = 'saved-item';
            item.innerHTML = `
                <div class="saved-item-header">
                    <i class="fas fa-chart-line"></i>
                    <div>
                        <h3>${rating.name}</h3>
                        <p>
                            Загальний рейтинг: ${rating.totalRating}
                            <br>
                            <span class="total-count">Предметів: ${totalSubjects}</span>
                            <span class="details-count"> (${examCount} екзаменів, ${creditCount} заліків)</span>
                            <br>
                            Дата: ${rating.date}
                        </p>
                    </div>
                </div>
                <div class="button-group">
                    <button class="control-btn primary" onclick="showRatingDetails(${index})">
                        <i class="fas fa-eye"></i> Деталі
                    </button>
                    <button class="control-btn warning" onclick="editRating(${index})">
                        <i class="fas fa-edit"></i> Редагувати
                    </button>
                    <button class="control-btn danger" onclick="deleteRating(${index})">
                        <i class="fas fa-trash"></i> Видалити
                    </button>
                </div>
            `;
            ratingsList.appendChild(item);
        });
    }
}

function deleteRating(index) {
    const savedRatings = JSON.parse(localStorage.getItem('savedRatings')) || [];
    const rating = savedRatings[index];
    
    if (confirm(`Видалити рейтинг "${rating.name}"?`)) {
        savedRatings.splice(index, 1);
        localStorage.setItem('savedRatings', JSON.stringify(savedRatings));
        loadSavedItems(); // Оновлюємо список
    }
}

function showRatingDetails(index) {
    const savedRatings = JSON.parse(localStorage.getItem('savedRatings')) || [];
    const rating = savedRatings[index];
    if (!rating) return;

    localStorage.setItem('currentRatingDetails', JSON.stringify(rating));
    window.location.href = 'rating-details.html';
}

function showScheduleDetails(key) {
    const savedSchedules = JSON.parse(localStorage.getItem('savedSchedules')) || {};
    const scheduleData = savedSchedules[key];

    if (scheduleData) {
        localStorage.setItem('currentScheduleDetails', JSON.stringify(scheduleData));
        window.location.href = 'schedule-details.html';
    } else {
        alert("Розклад не знайдено!");
    }
}

function deleteSchedule(key, buttonElement) {
    if (confirm("Видалити цей розклад?")) {
        const savedSchedules = JSON.parse(localStorage.getItem('savedSchedules')) || {};
        delete savedSchedules[key];
        localStorage.setItem('savedSchedules', JSON.stringify(savedSchedules));
        buttonElement.closest('.saved-item').remove();
          if (Object.keys(savedSchedules).length === 0) {
            document.getElementById('savedSchedulesList').innerHTML =
                '<div class="empty-message">Немає збережених розкладів</div>';
        }

    }
}

function editRating(index) {
    const savedRatings = JSON.parse(localStorage.getItem('savedRatings')) || [];
    const rating = savedRatings[index];
    if (!rating) return;

    localStorage.setItem('currentRatingEdit', JSON.stringify(rating));
    window.location.href = 'rating.html?edit=true';
}

document.addEventListener('DOMContentLoaded', loadSavedItems);