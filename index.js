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

function viewAllDepartments() {
  const query = `SELECT * from department;`;
  db.query(query, (err, res) => {
      if (err) throw err;
      console.log('\n');
      console.log('VIEW ALL DEPARTMENTS');
      console.log('\n');
      console.table(res);
      prompt();
  });
}

function viewAllRoles() {
  const query = `SELECT * from role;`;
  db.query(query, (err, res) => {
      if (err) throw err;
      console.log('\n');
      console.log('VIEW ALL ROLES');
      console.log('\n');
      console.table(res);
      prompt();
  });
}

async function updateRole() {
  const roleID = await inquirer.prompt(locateID());

  db.query('SELECT role.id, role.title, role.salary, role.department_id FROM role ORDER BY role.id;', async (err, res) => {
      if (err) throw err;
      const { role } = await inquirer.prompt([
          {
              name: 'role',
              type: 'list',
              choices: () => res.map(res => res.title),
              message: 'What is the new employee role?: '
          },
          {
            name: 'role',
            type: 'list',
            choices: () => res.map(res => res.salary),
            message: 'What is the new employee salary?: '
        },
        {
          name: 'role',
          type: 'list',
          choices: () => res.map(res => res.department_id),
          message: 'What is the new department ID?: '
      },
      ]);
      let roleID;
      for (const row of res) {
          if (row.title === role) {
              roleID = row.id;
              continue;
          }
      }
      db.query(`UPDATE employee 
      SET role_id = ${roleID}
      WHERE employee.id = ${employeeID.name}`, async (err, res) => {
          if (err) throw err;
          console.log('Role has been updated..')
          prompt();
      });
  });
}

async function addEmployee() {
    const addPerson = await inquirer.prompt(askName());
      db.query('SELECT role.id, role.title FROM role ORDER BY role.id;', async (err, res) => {
      if (err) throw err;
      const { role } = await inquirer.prompt([
          {
              name: 'role',
              type: 'list',
              choices: () => res.map(res => res.title),
              message: 'What is the employee role?: '
          }
          // {
          //   name: 'text',
          //   type: 'input',
          //   choices: () => res.map(res => res.last_name),
          //   message: 'What is the employee last name?: '
          // },
          // {
          //   name: 'roleID',
          //   type: 'number',
          //   choices: () => res.map(res => res.role_id),
          //   message: 'What is the role ID?: '
          // },
          // {
          //   name: 'LineID',
          //   type: 'number',
          //   choices: () => res.map(res => res.role_id),
          //   message: 'What is the manager ID?: '
          // },
      ]);
      let roleId;
      for (const row of res) {
          if (row.title === role) {
              roleId = row.id;
              continue;
          }
      }
      db.query('SELECT * FROM employee', async (err, res) => {
          if (err) throw err;
          let choices = res.map(res => `${res.first_name} ${res.last_name}`);
          choices.push('none');
          let { manager } = await inquirer.prompt([
              {
                  name: 'manager',
                  type: 'list',
                  choices: choices,
                  message: 'Choose the employee Manager: '
              }
          ]);
          let managerID;
          if (manager === 'none') {
              managerID = NULL;
          } else {
              for (const data of res) {
                  data.fullName = `${data.first_name} ${data.last_name}`;
                  if (data.fullName === manager) {
                      managerID = data.id;
                      managerName = data.fullName;
                      console.log(managerID);
                      console.log(managerName);
                      continue;
                  }
              }
          }
          console.log('Employee has been added. Please view all employees to verify...');
          db.query(
              'INSERT INTO employee SET ?',
              {
                  first_name: addPerson.first,
                  last_name: addPerson.last,
                  role_id: roleId,
                  manager_id: parseInt(managerID)
              },
              (err, res) => {
                  if (err) throw err;
                  prompt();

              }
          );
      });
  });
}

function askName() {
  return ([
      {
          name: 'first',
          type: 'input',
          message: 'What is the employee first name?'
      },
      {
          name: 'last',
          type: 'input',
          message: 'What is the employee last name?'
      }
  ]);
}

//display user inputs
// var text = "";
// if (answers.text.length > 0 && answers.text.length < 31) {
//   // valid character length between 1-30 chars
//   text = answers.text;
// } else {
//   // invalid character length
//   console.log("Invalid text length.  Please enter text length of upto 30 characters");
//   return "Invalid"
// }

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
