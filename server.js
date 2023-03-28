const express = require('express');
const Sequelize = require('sequelize');
const app = express();

app.use(express.json());

const sequelize = new Sequelize('database', 'root', '', {
    host: 'localhost',
    dialect: 'sqlite',
    storage: './Database/library.db'
});

const shelves = sequelize.define('shelves', {
    shelf_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    category: {
        type: Sequelize.STRING,
        allowNull: false
    },
    total_books: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
});

const books = sequelize.define('books', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    title: {
        type: Sequelize.STRING,
        allowNull: false
    },
    author: {
        type: Sequelize.STRING,
        allowNull: false
    },
    shelf_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
});

sequelize.sync();

/////////////////////////////////////////////////////////////////
/// SHELVES

app.get('/shelves', async (req, res) => {
    shelves.findAll().then(shelve => res.json(shelve))
        .catch(err => res.status(500).send(err));
    // await shelves.drop();
    // await books.drop();
});

app.get('/shelves/:id', (req, res) => {
    shelves.findByPk(req.params.id).then(shelve => {
        if (!shelve) res.status(404).send('Shelve not found!');
        else res.json(shelve);
    }).catch(err => res.status(500).send(err));
});

app.post('/shelves', (req, res) => {
    shelves.create(req.body).then(shelve => res.send(shelve))
        .catch(err => res.status(500).send(err));
});

app.put('/shelves/:id', (req, res) => {
    shelves.findByPk(req.params.id).then(shelve => {
        if (!shelve) res.status(404).send('shelve not found!');
        else shelve.update(req.body).then(() => res.send(shelve)).catch(err => res.status(500).send(err));
    }).catch(err => res.status(500).send(err));
});

app.delete('/shelves/:id', (req, res) => {
    shelves.findByPk(req.params.id).then(shelve => {
        if (!shelve) {
            res.status(404).send('shelves not found');
        } else {
            books.destroy({ where: { shelf_id: req.params.id } });
            shelves.destroy().then(() => res.send("deleted shelve and book!")).catch(err => res.status(500).send(err));
        }
    }).catch(err => {
        res.status(500).send(err);
    });
});

/////////////////////////////////////////////////////////////////
/// BOOKS

app.get('/books', (req, res) => {
    books.findAll().then(book => res.json(book))
        .catch(err => res.status(500).send(err));
});

app.get('/books/:id', (req, res) => {
    books.findByPk(req.params.id).then(book => {
        if (!book) res.status(404).send('Book not found!');
        else res.json(book);
    }).catch(err => res.status(500).send(err));
});

app.post('/books', (req, res) => {
    shelves.findByPk(req.body.shelf_id).then(shelve => {
        if (!shelve) res.status(404).send('Shelve not found!');
        else {
            books.create(req.body).then(book => {
                shelve.update({
                    total_books: shelve.total_books + 1
                }).then(() => res.send(book)).catch(err => res.status(500).send(err));
            }).catch(err => res.status(500).send(err));
        }
    }).catch(err => res.status(500).send(err));
});

app.put('/books/:id', (req, res) => {
    books.findByPk(req.params.id).then(book => {
        if (!book) res.status(404).send('Book not found!');
        else book.update(req.body).then(() => res.send(book))
            .catch(err => res.status(500).send(err));
    }).catch(err => res.status(500).send(err));
});

app.delete('/books/:id', (req, res) => {
    books.findByPk(req.params.id).then(book => {
        if (!book) res.status(404).send('Book not found!');
        else {
            book.destroy().then(() => {
                shelves.findByPk(req.body.shelf_id).then(shelve => {
                    if (!shelve) res.status(404).send('shelve not found!');
                    else shelve.update({
                        total_books: shelve.total_books - 1
                    }).then(() => res.send("delete book!")).catch(err => res.status(500).send(err));
                })
            }).catch(err => res.status(500).send(err));
        }
    });
});

// start the server
app.listen(3000, () => console.log(`Listening on port 3000...`));
