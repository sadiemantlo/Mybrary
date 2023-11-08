const express = require('express');
const router = express.Router();
const Author = require('../models/author');
const Book = require('../models/book');

// All Authors Route
router.get('/', async (req, res) => {
    let searchOptions = {}
    if (req.query.name != null && req.query.name !== '') {
        searchOptions.name = new RegExp(req.query.name, 'i')
    }
    try {
        const authors = await Author.find(searchOptions);
        res.render('authors/index', { 
            authors: authors, 
            searchOptions: req.query 
        })
    } catch {
        res.redirect('/')
    }
});

// New Author Route
router.get('/new', (req, res) => {
    res.render('authors/new', { author: new Author() });
});

// Create Author Route
router.post('/', async (req, res) => {
    const author = new Author({
        name: req.body.name
    })

    try {
        const newAuthor = await author.save();
        res.redirect(`authors/${newAuthor.id}`)
        res.redirect(`authors/`)
    } catch (err) {
        res.render('authors/new', {
            author: author,
            errorMessage: 'Error creating Author'
    })
    }
});

// Show Author Route
router.get('/:id', async (req, res) => {
    try{
        const author = await Author.findById(req.params.id); 
        const books  = await Book.find({ author: author.id }).limit(6).exec();
        res.render('authors/show', {
            author: author,
            booksByAuthor: books
        })
    } catch {
        res.redirect('/')
    }
});

// Edit Author Route
router.get('/:id/edit', async (req, res) => {
    try {
        const author = await Author.findById(req.params.id);
        res.render('authors/edit', { author: author })
    } catch {
        res.redirect('/authors')
    }
});

router.put('/:id', async (req, res) => {
    let author;
    try {
        author = await Author.findById(req.params.id);
        author.name = req.body.name;
        res.redirect(`/authors/${author.id}`)
        await author.save();
    } catch (err) {
        if (author == null) {
            res.redirect('/')
        } else {
        res.render('authors/edit', {
            author: author,
            errorMessage: 'Error updating Author'
        })
     }
    }
});
// Delete Author Route
router.delete('/:id', async (req, res) => {
    try {
        const author = await Author.findById(req.params.id);
        
        if (!author) {
            return res.redirect('/');
        }

        // Check if the author has associated books
        const books = await Book.find({ author: author._id });

        if (books.length > 0) {
            // Author has associated books, prevent deletion
            return res.redirect(`/authors/${req.params.id}`);
        }

        // No associated books, safe to delete the author
        const result = await Author.findOneAndDelete({ _id: req.params.id });
        
        if (result) {
            res.redirect('/authors');
        } else {
            // Author not found
            res.redirect('/');
        }
    } catch (err) {
        console.error('Error deleting Author', err);
        res.redirect(`/authors/${req.params.id}`);
    }
});



module.exports = router;