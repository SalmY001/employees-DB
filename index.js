// Import and require dependencies
const express = require('express');
const inquirer = require('inquirer')
const mysql = require('mysql2');
const dotenv = require("dotenv").config();

// SQL login variables
const userID = process.env.DB_USER;
const userPassword = process.env.DB_PASSWORD;
const userName = process.env.DB_NAME;

const PORT = process.env.PORT || 3001;
const app = express();

// Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Connect to database
const db = mysql.createConnection(
  {
    host: 'localhost',
    // MySQL username,
    user: userID,
    password: userPassword,
    database: userName,
    auth: '', // empty strings are left empty.
  },
  console.log(`Connected to the employees_db database.`),
);

// Query database

//Create an array of questions for user input
const questions = [
    {
        type: 'list',
        name: 'view_options',
        message: 'What would you like to do?',
        choices: ['View All Employees', 'Add Employee', 'View All Roles', 'Add Role', 'Update Employee Role', 'View All Departments', 'Add Department', 'Quit'],
    },
];

// Default response for any other request (Not Found)
app.use((req, res) => {
  res.status(404).end();
});

app.listen(PORT, () => {
  console.log(`Server up and running on port ${PORT}`);
});

// Create a function to initialize app
async function init() {
    //ask prompt(questions)

    // Prompt the user for answers
    const answers = await inquirer.prompt(questions);
    console.log(answers)
    return questions
    .then((data) => {
        console.log(data)
    })
    .catch((error) => {
        console.log(error)
    })
}

// Function call to initialize app
init();
