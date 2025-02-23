// schedule-details.js

document.addEventListener('DOMContentLoaded', () => {
    const scheduleData = JSON.parse(localStorage.getItem('currentScheduleDetails'));

    if (!scheduleData) {
        document.getElementById('scheduleDetails').innerHTML = '<p>Дані розкладу не знайдено.</p>';
        return;
    }

    const tbody = document.createElement('tbody');
    const table = document.createElement('table'); //Створюємо таблицю
    table.id = "scheduleTable";  //потрібні стилі
    table.classList.add("results-table");

      // Додавання заголовка таблиці
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>Дата</th>
            <th>Предмет</th>
            <th>Викладач</th>
            <th>Група</th>
        </tr>
    `;
     table.appendChild(thead);


    scheduleData.schedule.forEach(day => {
        // Рядок-заголовок для дня
        const dayHeaderRow = document.createElement('tr');
        dayHeaderRow.classList.add("day-header", "day-separator");
        const dayHeaderCell = document.createElement('td');
        dayHeaderCell.colSpan = 4;
        dayHeaderCell.textContent = `${day.date} (${day.day})`;
        dayHeaderRow.appendChild(dayHeaderCell);
        tbody.appendChild(dayHeaderRow);

        let lessonCounter = 1;

        day.lessons.forEach(lesson => {
           if (lesson.subject) {
                const row = document.createElement('tr');

                const timeCell = document.createElement('td');
                timeCell.innerHTML = `<span class="time-slot">${lessonCounter} пара<br>${lesson.time}</span>`;
                row.appendChild(timeCell);

                const subjectCell = document.createElement('td');
                subjectCell.textContent = lesson.subject;
                if (lesson.details) {
                    subjectCell.innerHTML += `<br><small>${lesson.details}</small>`;
                }
                row.appendChild(subjectCell);

                const teacherCell = document.createElement('td');
                teacherCell.textContent = lesson.teacher;
                row.appendChild(teacherCell);

                const groupCell = document.createElement('td');
                groupCell.textContent = lesson.group || scheduleData.group; //  Група з даних
                row.appendChild(groupCell);
                tbody.appendChild(row);
                lessonCounter++;
            } else {
                // Порожній рядок, якщо немає даних
                const row = document.createElement('tr');
                row.innerHTML = `<td>${day.date}</td><td></td><td></td><td></td>`;
                tbody.appendChild(row);
            }
        });
    });
    table.appendChild(tbody);
    document.getElementById('scheduleDetails').appendChild(table); // Додаємо таблицю в контейнер
});