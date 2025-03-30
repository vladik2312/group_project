# 🧵 Форум-проєкт на Node.js та MySQL

Цей проєкт реалізує базовий форум із використанням Node.js для серверної частини та MySQL для зберігання даних. Нижче описано інструкції щодо встановлення, налаштування бази даних і запуску застосунку **на Ubuntu**.

---

## 📦 Встановлення MySQL

```bash
sudo apt update
sudo apt install mysql-server
```

### 🔧 Налаштування доступу до MySQL

Відредагуйте конфігураційний файл:

```bash
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
```

🔁 Знайдіть рядок `bind-address` і змініть його на:

```
bind-address = 0.0.0.0
```

Це дозволить підключення до MySQL з інших хостів.

Після цього перезапустіть MySQL:

```bash
sudo service mysql restart
```

---

## 👤 Створення користувача та бази даних

Запустіть MySQL:

```bash
mysql -u root -p
```

Виконайте такі команди у MySQL-консолі:

```sql
CREATE USER 'user'@'%' IDENTIFIED BY 'pass';
```

> 🔐 Замість `%` ви можете вказати конкретну IP-адресу хоста, якому дозволено підключення. `%` — це шаблон, що дозволяє доступ з **будь-якого хоста** (небезпечно для продакшену).
>
> 🔑 Пароль `'pass'` слід замінити на надійний, з урахуванням політик безпеки.

```sql
GRANT ALL PRIVILEGES ON *.* TO 'user'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;
CREATE DATABASE db;
USE db;
```

---

## 🗂 Створення таблиць

```sql
-- Таблиця користувачів
CREATE TABLE account (
    id SERIAL PRIMARY KEY,
    login VARCHAR(255) UNIQUE NOT NULL,
    pass VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL
);

-- Таблиця тем
CREATE TABLE topics (
    id SERIAL PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES account(id) ON DELETE CASCADE
);

-- Таблиця повідомлень
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    topic_id BIGINT UNSIGNED NOT NULL,
    message_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES account(id) ON DELETE CASCADE,
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
);
```

---

## ⚙️ Налаштування Node.js застосунку

### Встановлення NVM і Node.js:

```bash
sudo apt update
curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.4/install.sh | bash
source ~/.bashrc
nvm install node
nvm use node
```

### Перехід до папки з кодом:

```bash
cd /шлях/до/твого/репозиторію
```

### Встановлення залежностей:

```bash
sudo apt install npm
sudo npm install
```

---

## 🚨 ВАЖЛИВА ПРИМІТКА

🔧 **Перед запуском застосунку потрібно відкрити файл `db.js` і змінити параметри підключення до бази даних:**

```js
const connection = mysql.createConnection({
  host: 'localhost',     // або IP вашого сервера MySQL
  user: 'user',           // ім’я користувача, якого ви створили
  password: 'pass',       // пароль
  database: 'db'          // назва бази даних
});
```

Без цього застосунок не зможе з'єднатися з базою даних.

---

## 🚀 Запуск застосунку

```bash
node app.js
```

### (Опційно) Використання `pm2` для продакшн-запуску:

```bash
npm install -g pm2
pm2 start app.js
```

Для зупинки:

```bash
pm2 stop app.js
```

---

## 📌 Примітка

- Переконайся, що порт, який використовує застосунок, відкритий у брандмауері або в cloud-середовищі.
- Не використовуйте српавжні паролі при створенні акаунту, проект взагалі не захищений, і був створений виключно в навчальних цілях.
