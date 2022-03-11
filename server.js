const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mysql = require('mysql');
const { body, validationResult } = require('express-validator');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to Database
const dbCon = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'nodejs_crud'
});

dbCon.connect();

// Get all book
app.get('/books', (req, res) => {
    dbCon.query('SELECT * FROM books', (err, results, fields) => {
        if (err) throw err;

        let message = "";
        if (results === undefined || results.length == 0) {
            message = "Books table is empty.";
        } else {
            message = "Success query data.";
        }

        res.send(
            {
                queryDescription: "ข้อมูลหนังสือทั้งหมด",
                error: false,
                data: results,
                message: message
            }
        );
    });
});

// add book
app.post('/book', [
    body('name').not().isEmpty().withMessage('กรุณากรอกชื่อ'),
    body('author').not().isEmpty().withMessage('กรุณากรอกชื่อผู้แต่ง')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const name = req.body.name;
    const author = req.body.author;
    dbCon.query(`INSERT INTO books (name, author) VALUES ('${name}', '${author}')`, (err, results, fields) => {
        if (err) throw err;
        return res.send({ error: false, data: results, message: "Book successfully added!" });
    });
});

// get single book
app.get('/book/:id', (req, res) => {
    let id = req.params.id;
    if (!id) return res.status(400).send({ error: true, message: "Please provide book id" });

    dbCon.query(`SELECT * FROM books WHERE id = ${id}`, (err, results, fields) => {
        if (err) throw err;
        let message = "";
        if (results === undefined || results.length == 0) {
            message = "Book not found!";
        } else {
            message = "Success query book data!";
        }

        return res.send({ error: false, data: results[0], message: message });
    });
});

// update book
app.put('/book', [
    body('id')
        .not().isEmpty().withMessage('กรุณาระบุ ID ที่จะอัพเดท'),
    body('name')
        .not().isEmpty().withMessage('กรุณากรอกชื่อ'),
    body('author')
        .not().isEmpty().withMessage('กรุณากรอกชื่อผู้แต่ง')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    
    const id = req.body.id;
    const name = req.body.name;
    const author = req.body.author;

    dbCon.query(`UPDATE books SET name='${name}', author='${author}' WHERE id = ${id}`, (err, results, fields) => {
        if (err) throw err;

        let message = "";
        if (results.changedRows === 0) {
            message = "Book not found or data are same";
        } else {
            message = "Success update book data!";
        }

        return res.send({ error: false, data: results, message: message });
    });
});

// delete book
app.delete('/book',[
    body('id')
        .not().isEmpty().withMessage('กรุณาระบุ ID ที่จะอัพเดท')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    let id = req.body.id;
    dbCon.query(`DELETE FROM books WHERE id = ${id}`, (err, results, fields) => {
        if (err) throw err;

        let message = "";
        if (results.affectedRows === 0) {
            message = "Book not found";
        } else {
            message = "Success delete book data!";
        }

        return res.send({ error: false, data: results, message: message });
    });
})

// homepage
app.get('/', (req, res) => {
    return res.send(
        {
            error: false,
            message: 'Welcome to REST API with Nodejs, Express, MYSQL'
        }
    )
});

app.listen(3000, () => {
    console.log('Node App is Running on port 3000')
});