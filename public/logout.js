function logout() {
    // Створюємо новий об'єкт XMLHttpRequest
    let xhr = new XMLHttpRequest();

    // Вказуємо метод, URL та асинхронність запиту
    xhr.open('POST', '/users/logout', true);

    // Встановлюємо тип контенту для запиту
    xhr.setRequestHeader('Content-Type', 'application/json');

    // Відправляємо запит
    xhr.send();

    // Обробляємо результат запиту
    xhr.onload = function () {
        if (xhr.status === 200) {
            // Якщо успішно, перенаправляємо на сторінку входу
            window.location.href = '/users/login';
        } else {
            console.error('Error logging out:', xhr.statusText);
        }
    };
}