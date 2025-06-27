const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean

  const user_exists = users.some(user => user.username === username);
  const regex = /^[a-zA-Z0-9_]{3,}$/; 
  return regex.test(username) && !user_exists; // Username is valid if it matches the regex and does not already exist
}

// Check if the user with the given username and password exists
const authenticatedUser = (username, password) => {
  // Filter the users array for any user with the same username and password
  let validusers = users.filter((user) => {
      return (user.username === username && user.password === password);
  });
  // Return true if any valid user is found, otherwise false
  if (validusers.length > 0) {
      return true;
  } else {
      return false;
  }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here
  const username = req.body.username;
  const password = req.body.password;

  // Check if the user exists and the password is correct
  if(!username ||!password) {
    return res.status(400).json({message: "Username and password are required"});
  }

  if(authenticatedUser(username, password)) {
    // Generate a JWT token
    const accessToken = jwt.sign({
                      username: username
                    }, 'access', {expiresIn: 60 * 2}); // Token will be valid for 2 minutes
    req.session.authorization = { accessToken, username };
    return res.status(200).json({message: "User logged in successfully", accessToken});

  }else {
    return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});





// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const isbn = req.params.isbn;
  const review = req.body.review;
  const username = req.session.authorization.username;
  if (!isbn || !review) {
    return res.status(400).json({message: "ISBN and review are required"});
  }
  if (!books[isbn]) {
    return res.status(404).json({message: "Book not found"});
  }

  // create a new review object
  const newReview = {
    username: username,
    review: review
  };

  // If the book does not have a reviews object, create one
  if (!books[isbn].reviews) {
    books[isbn].reviews = {};
    books[isbn].reviews[username] = newReview; // add the review under the username
  }else {
    // If the book already has reviews, add the new review under the username
    books[isbn].reviews[username] = newReview;
  }


  
  return res.status(200).json({message: "Review added successfully", data: books[isbn]}); 
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;

  if (!isbn) {
    return res.status(400).json({message: "ISBN is required"});
  }
  if (!books[isbn]) {
    return res.status(404).json({message: "Book not found"});
  }

  // Check if the book has reviews and if the user has a review for this book
  if (books[isbn].reviews && books[isbn].reviews[username]) {
    delete books[isbn].reviews[username]; // Remove the review by the user
    return res.status(200).json({message: "Review deleted successfully", data: books[isbn]});
  } else {
    return res.status(404).json({message: "Review not found for this user"});
  }
}
);

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
