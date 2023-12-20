// routes/users.js
const express = require('express');
const router = express.Router();
const pool = require('../db'); // Підключення до бази даних
const bcrypt = require('bcrypt'); // Бібліотека для хешування паролів


// Роут для отримання сторінки реєстрації
router.get('/register', (req, res) => {
    res.render('register', { message: req.query.message });
});
// Роут для обробки даних форми реєстрації
router.post('/register', async (req, res) => {
    const { login, pass, name } = req.body;

    // Перевірка, чи користувач із заданим логіном вже існує
    const checkQuery = 'SELECT * FROM account WHERE login = ?';
    pool.query(checkQuery, [login], (error, results) => {
        if (error) throw error; // Обробка помилок

        if (results.length > 0) {
            // Якщо користувач із таким логіном вже існує, повідомлення про помилку
            return res.render('register', { message: 'User with this login already exists' });
        }

        // Хешування пароля перед збереженням у базу даних
        bcrypt.hash(pass, 10, (hashErr, hashedPassword) => {
            if (hashErr) throw hashErr; // Обробка помилок

            // SQL-запит для вставки нового користувача в базу даних
            const insertQuery = 'INSERT INTO account (login, pass, name) VALUES (?, ?, ?)';

            // Виконання SQL-запиту до бази даних
            pool.query(insertQuery, [login, hashedPassword, name], (insertError, insertResults) => {
                if (insertError) throw insertError; // Обробка помилок
                res.redirect('/users/registration-success'); // Перенаправлення після успішної реєстрації
            });
        });
    });
});
// Роут для отримання сторінки входу
router.get('/login', (req, res) => {
    res.render('login', { message: req.query.message });
});
// Роут для обробки даних форми входу
router.post('/login', (req, res) => {
    const { login, pass } = req.body;

    // SQL-запит для отримання користувача з бази даних за логіном
    const query = 'SELECT * FROM account WHERE login = ?';

    // Виконання SQL-запиту до бази даних
    pool.query(query, [login], async (error, results) => {
        if (error) throw error; // Обробка помилок

        if (results.length > 0) {
            // Порівняння введеного пароля із збереженим хешем
            const match = await bcrypt.compare(pass, results[0].pass);

            if (match) {
                // Якщо пароль співпадає, зберегти ідентифікатор користувача в сесії
                req.session.userId = results[0].id;
                res.redirect('/users/forum'); // Перенаправлення на сторінку форуму
            } else {
                res.redirect('/users/login?message=Invalid login or password');
            }
        } else {
            res.redirect('/users/login?message=Invalid login or password');
        }
    });
});

// Роут для сторінки панелі приладів
router.get('/dashboard', (req, res) => {
    res.render('dashboard');
});

// Роут для сторінки після успішної реєстрації
router.get('/registration-success', (req, res) => {
    res.render('registration-success');
});


// Роут для виходу користувача
router.post('/logout', (req, res) => {
    // Очищення сесії та відправлення успішного статусу
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
            res.status(500).send('Internal Server Error');
        } else {
            res.sendStatus(200);
        }
    });
});

// Роут для створення нової теми
router.get('/forum', (req, res) => {
    // SQL-запит для отримання переліку тем з іменами користувачів
    const query = 'SELECT topics.id, topics.title, account.name AS author FROM topics JOIN account ON topics.user_id = account.id';

    // Виконання SQL-запиту до бази даних
    pool.query(query, (error, topics) => {
        if (error) {
            console.error('Error fetching topics:', error);
            res.status(500).send('Internal Server Error');
            return;
        }

        res.render('forum', { topics });
    });
});


router.get('/forum/topic/:topicId', (req, res) => {
    const topicId = req.params.topicId;

    // SQL-запит для отримання повідомлень в темі
    const queryMessages = 'SELECT messages.message_text, account.name FROM messages JOIN account ON messages.user_id = account.id WHERE messages.topic_id = ?';

    // Виконання SQL-запиту до бази даних для отримання повідомлень
    pool.query(queryMessages, [topicId], (error, messages) => {
        if (error) throw error; // Обробка помилок

        // SQL-запит для отримання назви теми
        const queryTopic = 'SELECT title FROM topics WHERE id = ?';

        // Виконання SQL-запиту до бази даних для отримання назви теми
        pool.query(queryTopic, [topicId], (error, topic) => {
            if (error) throw error; // Обробка помилок

            // Отримання списку тем для передачі у шаблон
            const queryTopics = 'SELECT * FROM topics';
            pool.query(queryTopics, (error, topics) => {
                if (error) throw error; // Обробка помилок
                res.render('topic', { messages, topicId, topicTitle: topic[0].title, topics });
            });
        });
    });
});






router.post('/forum/add-message/:topicId', (req, res) => {
    // Перевірка, чи користувач авторизований
    if (!req.session.userId) {
        res.redirect('/users/login');
        return;
    }

    const topicId = req.params.topicId;
    const { message } = req.body;

    // Перевірка, чи введено не пусте повідомлення
    if (!message) {
        res.redirect(`/users/forum/topic/${topicId}?message=Повідомлення не може бути порожнім`);
        return;
    }

    // SQL-запит для додавання повідомлення в тему
    const query = 'INSERT INTO messages (user_id, topic_id, message_text) VALUES (?, ?, ?)';

    // Виконання SQL-запиту до бази даних
    pool.query(query, [req.session.userId, topicId, message], (error, results) => {
        if (error) throw error; // Обробка помилок
        res.redirect(`/users/forum/topic/${topicId}`); // Перенаправлення на сторінку теми
    });
});

// Один з роутів для створення нової теми
router.post('/forum/create-topic', (req, res) => {
    // Перевірка, чи користувач авторизований
    if (!req.session.userId) {
        res.redirect('/users/login');
        return;
    }

    const { title } = req.body;

    // Перевірка, чи введено не пусту назву теми
    if (!title) {
        res.redirect('/users/forum?message=Назва теми не може бути порожньою');
        return;
    }

    // Перевірка, чи тема з такою назвою вже існує
    const checkTopicQuery = 'SELECT COUNT(*) AS count FROM topics WHERE title = ?';

    pool.query(checkTopicQuery, [title], (error, result) => {
        if (error) {
            console.error('Error checking existing topic:', error);
            res.status(500).send('Internal Server Error');
            return;
        }

        const topicExists = result[0].count > 0;

        if (topicExists) {
            // Тема з такою назвою вже існує, повертаємо помилку або виконуємо необхідні дії
            res.redirect('/users/forum?error=Тема з такою назвою вже існує');
            return;
        }

        // Якщо тема не існує, виконуємо SQL-запит для створення нової теми
        const createTopicQuery = 'INSERT INTO topics (user_id, title, created_at) VALUES (?, ?, NOW())';
        const values = [req.session.userId, title];

        pool.query(createTopicQuery, values, (error, results) => {
            if (error) {
                console.error('Error creating topic:', error);
                res.status(500).send('Internal Server Error');
                return;
            }

            // Тема успішно створена
            res.redirect('/users/forum');
        });
    });
});



module.exports = router; // Експорт роутера для використання в інших частинах програми
