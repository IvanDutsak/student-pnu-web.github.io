let changesData = null;
let currentGroupFilter = 'all';
let currentHistoryIndex = 0;

const TIME_TO_PAIR = {
    '09:00-10:20': '1 пара',
    '10:35-11:55': '2 пара',
    '12:20-13:40': '3 пара',
    '13:50-15:10': '4 пара',
    '15:20-16:40': '5 пара',
    '16:50-18:10': '6 пара',
    '18:15-19:35': '7 пара',
    '19:40-21:00': '8 пара'
};

function getPairNumber(timeStr) {
    if (!timeStr) return '';
    const pair = TIME_TO_PAIR[timeStr];
    if (pair) return pair;
    const startTime = timeStr.split('-')[0];
    for (const [key, val] of Object.entries(TIME_TO_PAIR)) {
        if (key.startsWith(startTime)) return val;
    }
    return '';
}

document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initScrollButton();
    loadChangesData();
});

function initMobileMenu() {
    const btn = document.querySelector('.mobile-menu-btn');
    const navList = document.querySelector('.nav-list');
    if (btn && navList) {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            navList.classList.toggle('show');
        });
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.main-nav')) {
                navList.classList.remove('show');
            }
        });
    }
}



function initScrollButton() {
    const btn = document.getElementById('scrollToTopBtn');
    if (!btn) return;
    let direction = 'up';
    window.addEventListener('scroll', () => {
        btn.classList.toggle('show', window.scrollY > 300);
    });
    btn.addEventListener('click', () => {
        if (direction === 'up') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            direction = 'down';
            btn.querySelector('.toggle-arrow').classList.add('down');
        } else {
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            direction = 'up';
            btn.querySelector('.toggle-arrow').classList.remove('down');
        }
    });
}

async function loadChangesData() {
    try {
        const cacheBuster = '?t=' + Date.now();
        const response = await fetch('schedule_changes.json' + cacheBuster);
        if (!response.ok) throw new Error('HTTP ' + response.status);
        changesData = await response.json();

        if (!changesData.latest && (!changesData.history || changesData.history.length === 0)) {
            showEmptyState();
            return;
        }

        if (changesData.history && changesData.history.length > 0) {
            setupHistorySelector();
        }

        renderChanges(changesData.latest || changesData.history[0]);
    } catch (err) {
        console.error('Помилка завантаження змін:', err);
        showEmptyState('Не вдалося завантажити дані про зміни');
    }
}

function setupHistorySelector() {
    const container = document.getElementById('history-selector');
    const select = document.getElementById('history-select');
    if (!container || !select || !changesData.history || changesData.history.length <= 1) return;

    container.style.display = 'flex';
    select.innerHTML = '';

    changesData.history.forEach((entry, index) => {
        const opt = document.createElement('option');
        opt.value = index;
        const ts = entry.timestamp || 'Невідомо';
        const groupNames = Object.keys(entry.groups || {}).join(', ');
        const totalDays = Object.values(entry.groups || {}).reduce((sum, g) => sum + Object.keys(g.days || {}).length, 0);
        opt.textContent = `${formatTimestamp(ts)} — ${groupNames} (${totalDays} днів із змінами)`;
        if (index === 0) opt.textContent = '🔴 ' + opt.textContent;
        select.appendChild(opt);
    });

    select.addEventListener('change', () => {
        currentHistoryIndex = parseInt(select.value);
        renderChanges(changesData.history[currentHistoryIndex]);
    });
}

function formatTimestamp(ts) {
    if (!ts || ts === 'null') return 'Невідомо';
    try {
        const d = new Date(ts);
        return d.toLocaleDateString('uk-UA', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    } catch {
        return ts;
    }
}

function showEmptyState(msg) {
    document.getElementById('changes-content').innerHTML = `
        <div class="empty-state">
            <i class="fas fa-check-circle"></i>
            <h3>${msg || 'Змін поки немає'}</h3>
            <p>Коли розклад зміниться, тут з'являться детальні відмінності</p>
        </div>`;
}

function renderChanges(changeEntry) {
    if (!changeEntry || !changeEntry.groups || Object.keys(changeEntry.groups).length === 0) {
        showEmptyState();
        return;
    }

    const tsEl = document.getElementById('change-timestamp');
    if (tsEl) {
        tsEl.innerHTML = `<i class="fas fa-clock"></i> Останнє оновлення: ${formatTimestamp(changeEntry.timestamp)}`;
    }

    renderGroupTabs(changeEntry);
    renderDayChanges(changeEntry);
}

function renderGroupTabs(changeEntry) {
    const container = document.getElementById('group-tabs');
    if (!container) return;

    const groups = Object.keys(changeEntry.groups);
    if (groups.length <= 1) {
        container.innerHTML = '';
        currentGroupFilter = groups[0] || 'all';
        return;
    }

    let html = `<button class="group-tab ${currentGroupFilter === 'all' ? 'active' : ''}" data-group="all">Усі групи</button>`;
    groups.forEach(g => {
        html += `<button class="group-tab ${currentGroupFilter === g ? 'active' : ''}" data-group="${g}">${g}</button>`;
    });
    container.innerHTML = html;

    container.querySelectorAll('.group-tab').forEach(btn => {
        btn.addEventListener('click', () => {
            currentGroupFilter = btn.dataset.group;
            container.querySelectorAll('.group-tab').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderDayChanges(changeEntry);
        });
    });
}

function renderDayChanges(changeEntry) {
    const content = document.getElementById('changes-content');
    if (!content) return;

    let html = '';
    const groups = changeEntry.groups;

    for (const [groupName, groupData] of Object.entries(groups)) {
        if (currentGroupFilter !== 'all' && currentGroupFilter !== groupName) continue;

        const days = groupData.days || {};
        const sortedDates = Object.keys(days).sort((a, b) => {
            const da = a.split('.').reverse().join('');
            const db = b.split('.').reverse().join('');
            return da.localeCompare(db);
        });

        for (const date of sortedDates) {
            const dayData = days[date];
            html += renderDayCard(groupName, date, dayData);
        }
    }

    if (!html) {
        html = `<div class="empty-state">
            <i class="fas fa-filter"></i>
            <h3>Немає змін для цієї групи</h3>
            <p>Спробуйте обрати іншу групу</p>
        </div>`;
    }

    content.innerHTML = html;
}

function renderDayCard(groupName, date, dayData) {
    const dayName = dayData.day_name || '';
    const summary = dayData.summary || '';
    const type = dayData.type || 'modified';

    let bodyHtml = '';

    if (type === 'removed_day') {
        bodyHtml = renderAllCancelled(dayData);
    } else if (type === 'added_day') {
        bodyHtml = renderAllAdded(dayData);
    } else {
        bodyHtml = renderDiffView(dayData);
    }

    return `
        <div class="day-change-card">
            <div class="day-change-header" onclick="this.parentElement.querySelector('.day-change-body').classList.toggle('collapsed')">
                <h3><i class="fas fa-calendar-day"></i> ${groupName} — ${date} ${dayName ? '(' + dayName + ')' : ''}</h3>
                <span class="change-badge">${summary}</span>
            </div>
            <div class="day-change-body">${bodyHtml}</div>
        </div>`;
}

function renderAllCancelled(dayData) {
    const lessons = dayData.old_lessons || dayData.removed || [];
    let lessonsHtml = lessons.map(l => renderLessonItem(l, 'removed')).join('');

    return `
        <div class="all-cancelled">
            <i class="fas fa-exclamation-triangle"></i>
            <h4>Усі пари з цього дня скасовані / перенесені</h4>
            <p>Нижче — пари, які були раніше:</p>
        </div>
        <div style="margin-top: 1rem;">${lessonsHtml}</div>`;
}

function renderAllAdded(dayData) {
    const lessons = dayData.new_lessons || dayData.added || [];
    let lessonsHtml = lessons.map(l => renderLessonItem(l, 'added')).join('');

    return `
        <div style="text-align:center;padding:1rem;background:var(--added-bg);border-radius:10px;border:2px dashed var(--added-border);color:var(--added-text);margin-bottom:1rem;">
            <i class="fas fa-plus-circle" style="font-size:2rem;display:block;margin-bottom:0.5rem;"></i>
            <h4>Додано новий день з парами</h4>
        </div>
        <div>${lessonsHtml}</div>`;
}

function renderDiffView(dayData) {
    const oldLessons = dayData.old_lessons || [];
    const newLessons = dayData.new_lessons || [];
    const removed = dayData.removed || [];
    const added = dayData.added || [];
    const modified = dayData.modified || [];

    const removedTimes = new Set(removed.map(l => l.time + '|' + l.subject + '|' + (l.teacher || '') + '|' + (l.details || '')));
    const addedTimes = new Set(added.map(l => l.time + '|' + l.subject + '|' + (l.teacher || '') + '|' + (l.details || '')));
    const modOldTimes = new Set(modified.map(m => m.old.time + '|' + m.old.subject + '|' + (m.old.teacher || '') + '|' + (m.old.details || '')));
    const modNewTimes = new Set(modified.map(m => m.new.time + '|' + m.new.subject + '|' + (m.new.teacher || '') + '|' + (m.new.details || '')));

    let oldHtml = oldLessons.map(l => {
        const key = l.time + '|' + l.subject + '|' + (l.teacher || '') + '|' + (l.details || '');
        if (removedTimes.has(key)) return renderLessonItem(l, 'removed');
        if (modOldTimes.has(key)) return renderLessonItem(l, 'modified-old');
        return renderLessonItem(l, 'unchanged');
    }).join('');

    let newHtml = '';
    if (newLessons.length === 0) {
        newHtml = `<div class="all-cancelled" style="padding:1.5rem;">
            <i class="fas fa-ban"></i>
            <h4>Пар більше немає</h4>
            <p>Усі заняття скасовані або перенесені</p>
        </div>`;
    } else {
        newHtml = newLessons.map(l => {
            const key = l.time + '|' + l.subject + '|' + (l.teacher || '') + '|' + (l.details || '');
            if (addedTimes.has(key)) return renderLessonItem(l, 'added');
            if (modNewTimes.has(key)) return renderLessonItem(l, 'modified-new');
            return renderLessonItem(l, 'unchanged');
        }).join('');
    }

    return `<div class="diff-container">
        <div class="diff-column">
            <div class="diff-column-title old"><i class="fas fa-arrow-left"></i> Було (${oldLessons.length} пар)</div>
            ${oldHtml || '<p style="color:#a0aec0;text-align:center;padding:1rem;">Пар не було</p>'}
        </div>
        <div class="diff-column">
            <div class="diff-column-title new"><i class="fas fa-arrow-right"></i> Стало (${newLessons.length} пар)</div>
            ${newHtml}
        </div>
    </div>`;
}

function renderLessonItem(lesson, cssClass) {
    const time = lesson.time || '';
    const subject = lesson.subject || 'Невідомий предмет';
    const teacher = lesson.teacher || '';
    const details = lesson.details || '';
    const pairNum = getPairNumber(time);

    let icon = '';
    if (cssClass === 'removed' || cssClass === 'modified-old') icon = '<i class="fas fa-minus-circle" style="color:var(--removed-text);margin-right:0.3rem;"></i>';
    else if (cssClass === 'added' || cssClass === 'modified-new') icon = '<i class="fas fa-plus-circle" style="color:var(--added-text);margin-right:0.3rem;"></i>';

    const timeDisplay = pairNum ? `${pairNum} • ${time}` : time;

    return `
        <div class="diff-lesson ${cssClass}">
            <div class="lesson-time">${icon}${timeDisplay}</div>
            <div class="lesson-subject">${subject}</div>
            ${teacher ? `<div class="lesson-teacher"><i class="fas fa-user-tie"></i> ${teacher}</div>` : ''}
            ${details ? `<div class="lesson-details"><i class="fas fa-map-marker-alt"></i> ${details}</div>` : ''}
        </div>`;
}
