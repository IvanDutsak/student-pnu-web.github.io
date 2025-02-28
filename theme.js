document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    
    // Перевіряємо збережену тему
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    themeToggle.addEventListener('click', () => {
        // Отримуємо поточну тему
        const currentTheme = document.documentElement.getAttribute('data-theme');
        
        // Змінюємо тему
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        // Зберігаємо нову тему
        localStorage.setItem('theme', newTheme);
        
        // Застосовуємо нову тему
        document.documentElement.setAttribute('data-theme', newTheme);
        
        // Додаємо анімацію кнопці
        themeToggle.style.transform = 'scale(0.8)';
        setTimeout(() => {
            themeToggle.style.transform = 'scale(1)';
        }, 200);
    });
});
