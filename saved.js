function loadSavedItems() {
    // === Збережені розклади ===
    const savedSchedules = JSON.parse(localStorage.getItem('savedSchedules')) || {};
    const schedulesList = document.getElementById('savedSchedulesList');
    if (!schedulesList) return;

    

    if (Object.keys(savedSchedules).length === 0) {
        schedulesList.innerHTML = '<div class="empty-message">Немає збережених розкладів</div>';
        return;
    }
    schedulesList.innerHTML = '';

    // === ЗЧИТУЄМО schedulesData ===
    const schedulesData = JSON.parse(localStorage.getItem('schedulesData'));
    if (!schedulesData) {
      console.error("Error: schedulesData not found in localStorage!");
      return; //  Якщо даних немає, виходимо
    }
    // ===============================

    for (const key in savedSchedules) {
        // Перевіряємо, чи ключ починається з однієї з відомих груп
        let isValidKey = false;

        for (const groupKey in schedulesData) { //  Тепер schedulesData доступна!

            if (key.startsWith(groupKey + "_")) {
                isValidKey = true;
                break;
            }
        }

        if (!isValidKey) {
          console.warn("Skipping invalid key:", key);
          continue; // Пропускаємо цей ключ, якщо він не валідний
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


    // === Збережені рейтинги === (без змін, але для повноти)
    const savedRatings = Object.keys(localStorage)
        .filter(key => key.startsWith('rating_'))
        .map(key => ({
            key: key,
            name: key.replace('rating_', ''),
            data: JSON.parse(localStorage.getItem(key))
        }));

    const ratingsList = document.getElementById('savedRatingsList');
     if (!ratingsList) return; //перевірка

    ratingsList.innerHTML = savedRatings.length > 0
        ? ''
        : '<div class="empty-message">Немає збережених рейтингів</div>';

    savedRatings.forEach(rating => {
        const item = document.createElement('div');
        item.className = 'saved-item';
        item.innerHTML = `
            <div class="saved-item-header">
                <i class="fas fa-chart-line"></i>
                <div>
                    <h3>${rating.name}</h3>
                    <p>Загальний рейтинг: ${rating.data.R?.toFixed(2) || 'Н/Д'}</p>
                </div>
            </div>
            <div class="button-group">
                <button class="control-btn primary" onclick="showRatingDetails('${rating.key}')">
                    Деталі
                </button>
                <button class="control-btn danger" onclick="deleteRating('${rating.key}', this)">
                    <i class="fas fa-trash"></i> Видалити
                </button>
            </div>
        `;
        ratingsList.appendChild(item);
    });
}

function deleteRating(key, button) {
    if (confirm('Видалити цей рейтинг?')) {
        localStorage.removeItem(key);
        button.closest('.saved-item').remove();
        // Оновлення списку після видалення
        if (document.getElementById('savedRatingsList').children.length === 0) {
            document.getElementById('savedRatingsList').innerHTML =
                '<div class="empty-message">Немає збережених рейтингів</div>';
        }
    }
}

function showRatingDetails(key) {
    const ratingData = JSON.parse(localStorage.getItem(key));
    localStorage.setItem('currentRatingDetails', JSON.stringify(ratingData));
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
document.addEventListener('DOMContentLoaded', loadSavedItems);