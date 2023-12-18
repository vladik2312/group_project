// app.js
const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const usersRouter = require('./routes/users');

// Встановлення шляху до папки з шаблонами та використання двигуна шаблонів EJS
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Використання middleware для обробки даних форми
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


// Використання middleware для обробки статичних файлів
app.use(express.static(path.join(__dirname, 'public')));

// Додавання middleware для роботи із сесіями

app.use(session({
    secret: 'ваш-секретний-ключ', // Секретний ключ для підпису сесій
    resave: true, // Зберігати сесію навіть якщо вона не змінена
    saveUninitialized: true // Зберігати нову, незмінену сесію
}));

// Маршрут для початкової сторінки
app.get('/', (req, res) => {
    res.render('index'); // Відображення шаблону 'index'
});

// Використання роутера для маршрутів, пов'язаних із користувачами
app.use('/users', usersRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});