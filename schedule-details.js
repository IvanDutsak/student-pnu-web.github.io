// schedule-details.js

document.addEventListener('DOMContentLoaded', () => {
    const scheduleData = JSON.parse(localStorage.getItem('currentScheduleDetails'));

    if (!scheduleData) {
        document.getElementById('scheduleDetails').innerHTML = '<p>Дані розкладу не знайдено.</p>';
        return;
    }

    const table = document.createElement('table');
    table.id = "scheduleTable";
    table.classList.add("results-table");

    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>Час</th>
            <th>Предмет</th>
            <th>Викладач</th>
            <th>Група</th>
        </tr>
    `;
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    scheduleData.schedule.forEach(day => {
        const dayHeaderRow = document.createElement('tr');
        dayHeaderRow.classList.add("day-header", "day-separator");
        const dayHeaderCell = document.createElement('td');
        dayHeaderCell.colSpan = 4;
        dayHeaderCell.textContent = `${day.date} (${day.day})`;
        dayHeaderRow.appendChild(dayHeaderCell);
        tbody.appendChild(dayHeaderRow);

        const timeSlots = {
            1: "09:00-10:20", 2: "10:35-11:55", 3: "12:20-13:40", 4: "13:50-15:10",
            5: "15:20-16:40", 6: "16:50-18:10", 7: "18:15-19:35", 8: "19:40-21:00"
        };

        for (let lessonNumber = 1; lessonNumber <= 8; lessonNumber++) {
            const lesson = day.lessons.find(l => l.number === lessonNumber) || {};
            const row = document.createElement('tr');

            const timeCell = document.createElement('td');
            timeCell.innerHTML = `<span class="time-slot">${lessonNumber} пара<br>${timeSlots[lessonNumber]}</span>`;
            row.appendChild(timeCell);

            const subjectCell = document.createElement('td');
            subjectCell.textContent = lesson.subject || '';
            if (lesson.details) {
                subjectCell.innerHTML += `<br><small>${lesson.details}</small>`;
            }
            row.appendChild(subjectCell);

            const teacherCell = document.createElement('td');
            teacherCell.textContent = lesson.teacher || '';
            row.appendChild(teacherCell);

            const groupCell = document.createElement('td');
            // Відображаємо групу лише якщо є предмет
            groupCell.textContent = lesson.subject ? (lesson.group || scheduleData.group) : '';
            row.appendChild(groupCell);

            tbody.appendChild(row);
        }
    });

    table.appendChild(tbody);
    document.getElementById('scheduleDetails').appendChild(table);
});