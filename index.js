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

// Default response for any other request (Not Found)
app.use((req, res) => {
  res.status(404).end();
});

app.listen(PORT, () => {
  console.log(`Server up and running on port ${PORT}`);
});

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
  )
  db.connect(err => {
    if (err) throw err;
    prompt();
  });

  //Create an array of questions for user input
  const userSelections = {
    viewAllEmployees: "View All Employees",
    viewAllDepartments: "View All Departments",
    viewAllRoles: "View All Roles",
    addEmployee: "Add Employee",
    addDepartment: "Add Department",
    addRole: "Add Role",
    updateRole: "Update Employee Role",
    quit: "Quit"
  };

// Query database

//Create an array of questions for user input
// const questions = [
//     {
//         type: 'list',
//         name: 'view_options',
//         message: 'What would you like to do?',
//         choices: ['View All Employees', 'Add Employee', 'View All Roles', 'Add Role', 'Update Employee Role', 'View All Departments', 'Add Department', 'Quit'],
//     },
// ];

// Display user input selections
function prompt() {
  inquirer
      .prompt({
          name: 'view_options', //action
          type: 'list',
          message: 'What would you like to do?',
          choices: [
              userSelections.viewAllEmployees,
              userSelections.viewAllDepartments,
              userSelections.viewAllRoles,
              userSelections.addEmployee,
              userSelections.addDepartment,
              userSelections.addRole,
              userSelections.updateRole,
              userSelections.quit
          ]
      })
      .then(answer => {
          console.log('answer', answer);
          switch (answer.view_options) {
              case userSelections.viewAllEmployees:
                  viewAllEmployees();
                  break;

              case userSelections.viewAllDepartments:
                  viewAllDepartments();
                  break;

              case userSelections.viewAllRoles:
                  viewAllRoles();
                  break;

              case userSelections.addEmployee:
                  addEmployee();
                  break;

              case userSelections.addRole:
                  addRole();
                  break;

              case userSelections.addDepartment:
                  addDepartment();
                  break;

              case userSelections.updateRole:
                  remove('role');
                  break;

              case userSelections.quit:
                  connection.end();
                  break;
          }
      });
}

function viewAllEmployees() {
  const query = `SELECT * from employee;`;
  db.query(query, (err, res) => {
      if (err) throw err;
      console.log('\n');
      console.log('VIEW ALL EMPLOYEES');
      console.log('\n');
      console.table(res);
      prompt();
  });
}

// Create a function to initialize app
// async function init() {
//     //ask prompt(questions)

//     // Prompt the user for answers
//     const answers = await inquirer.prompt(questions);
//     console.log(answers)
//     return questions
//     .then((data) => {
//         console.log(data)
//     })
//     .catch((error) => {
//         console.log(error)
//     })
// }

// Function call to initialize app
// init();
