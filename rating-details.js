document.addEventListener('DOMContentLoaded', () => {
    const ratingData = JSON.parse(localStorage.getItem('currentRatingDetails'));
    const container = document.getElementById('ratingDetails');

    if (!ratingData) {
        container.innerHTML = '<p>Дані не знайдено</p>';
        return;
    }

    // Генеруємо HTML таблиці
    const tableHTML = `
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
                            <td>${subject.type === "Екзамен" ? "Екзамен" : "Залік"}</td>
                        </tr>
                        `).join('')}
                </tbody>
            </table>
            
            <div class="rating-summary">
                <div>Екзамени: <span>${ratingData.R_e?.toFixed(2) || 0}</span></div>
                <div>Заліки: <span>${ratingData.R_z?.toFixed(2) || 0}</span></div>
                <div class="total">Загальний: <span>${ratingData.R?.toFixed(2) || 0}</span></div>
            </div>
        </div>
    `;

    container.innerHTML = tableHTML;
});