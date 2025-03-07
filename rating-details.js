document.addEventListener('DOMContentLoaded', () => {
    const ratingData = JSON.parse(localStorage.getItem('currentRatingDetails'));
    const container = document.getElementById('ratingDetails');

    if (!ratingData) {
        container.innerHTML = '<p>Дані не знайдено</p>';
        return;
    }

    // Генеруємо HTML таблиці
    const tableHTML = `
        <h2 class="section-title">${ratingData.name}</h2>
        <p class="rating-date">Дата: ${ratingData.date}</p>
        <div class="results-table">
            <table>
                <thead>
                    <tr>
                        <th>Предмет</th>
                        <th>Бали</th>
                        <th>Кредити</th>
                        <th>Тип</th>
                    </tr>
                </thead>
                <tbody>
                    ${[...ratingData.examSubjects, ...ratingData.creditSubjects]
                        .map(subject => `
                        <tr>
                            <td>${subject.name}</td>
                            <td>${subject.score}</td>
                            <td>${subject.credits}</td>
                            <td>${subject.type}</td>
                        </tr>
                        `).join('')}
                </tbody>
            </table>
            
            <div class="rating-summary">
                <div>Екзамени: <span>${ratingData.examRating}</span></div>
                <div>Заліки: <span>${ratingData.creditRating}</span></div>
                <div class="total">Загальний: <span>${ratingData.totalRating}</span></div>
            </div>
        </div>
    `;

    container.innerHTML = tableHTML;
});