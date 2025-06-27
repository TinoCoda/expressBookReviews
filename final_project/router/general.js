const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const { username, password } = req.body;

  // Check if the password is provided and is valid
  if (!password || password.length < 4) {
    return res.status(400).json({message: "Password must be at least 4 characters long"});
  }
 
  // Check if username is not provided or is invalid
  if (!username || !isValid(username)) {
    return res.status(400).json({message: "Invalid username"});
  }
  // Add new user to the users array
  users.push({ username, password });
  return res.status(200).json({message: "User registered successfully"});
});

// Get the book list available in the shop
public_users.get('/',async function (req, res) {
  //Write your code here
  return res.status(200).json({data: books, message: "Book list retrieved successfully"});
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',async function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (!book) {
    return res.status(404).json({message: "Book not found"});
  }
  return res.status(200).json({message:  "Book found", data: book });
 });
  
// Get book details based on author
public_users.get('/author/:author',async function (req, res) {
  //Write your code here
  const author = req.params.author;
  const booksByAuthor = Object.values(books).filter(book => book.author.toLowerCase().includes(author.toLowerCase()) );
  if (booksByAuthor.length > 0) {
    return res.status(200).json({message: "Books found", data: booksByAuthor});
  }
  return res.status(404).json({message: "No books found by this author"});
  
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  //Write your code here
  const title = req.params.title;
  const booksByTitle = Object.values(books).filter(book => book.title.toLowerCase().includes(title.toLowerCase()));
  if (booksByTitle.length > 0) {
    return res.status(200).json({message: "Books found", data: booksByTitle});
  }
  return res.status(404).json({message: "No books found with this title"});
  
});

//  Get book review
public_users.get('/review/:isbn',async function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (!book) {
    return res.status(404).json({message: "Book not found"});
  }
  if (!book.reviews || Object.keys(book.reviews).length === 0) {
    return res.status(404).json({message: "No reviews found for this book"});
  }
  return res.status(200).json({message: "Reviews found", data: book.reviews});
  
});

module.exports.general = public_users;
