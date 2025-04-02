const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = 3000;

// 初始化SQLite数据库（若不存在会自动创建）
const db = new sqlite3.Database('database.db', (err) => {
    if (err) throw err;
    console.log('Connected to SQLite database.');

    // 创建用户表并插入一条虚拟数据
    db.serialize(() => {
        db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY,
                username TEXT,
                password_hash TEXT
            )
        `);
        db.run(`INSERT INTO users (username, password_hash) VALUES ('admin', 'fake_hash')`);
    });
});

// 静态文件托管
app.use(express.static('public'));
// 解析JSON请求体
app.use(express.json());

// 登录接口（存在SQL注入漏洞！）
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // 直接拼接SQL查询（漏洞点）
    const query = `SELECT * FROM users WHERE username = '${username}' AND password_hash = '${password}'`;

    db.get(query, (err, row) => {
        if (err) {
            return res.json({ success: false });
        }
        if (row) {
            // 登录成功返回答案
            res.json({ success: true, answer: 'FLAG{SQLi_Bypass_Hash}' });
        } else {
            res.json({ success: false });
        }
    });
});

// 启动服务
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});