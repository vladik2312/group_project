// db.js

const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'sql11.freesqldatabase.com',
    user: 'sql11670668',
    password: 'SYVSkLe7xc',
    database: 'sql11670668'
});

connection.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL');
});

module.exports = connection; // Експорт створеного пулу з'єднань для використання у інших частинах програми
