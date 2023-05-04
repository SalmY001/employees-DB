// Import and require dependencies
const express = require('express');
const inquirer = require('inquirer');
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

// Display user input selections
function prompt() {
  inquirer
      .prompt({
          name: 'view_options',
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
                  db.end();
                  break;
          }
      });
}

// Function to view all employees 
function viewAllEmployees() {
  const query = `SELECT employee.id, employee.first_name, employee.last_name, role.title, department.department_name AS department, role.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager
  FROM employee
  LEFT JOIN employee manager on manager.id = employee.manager_id
  INNER JOIN role ON (role.id = employee.role_id)
  INNER JOIN department ON (department.id = role.department_id)
  ORDER BY employee.id;`;
  db.query(query, (err, res) => {
      if (err) throw err;
      console.log('\n');
      console.log('VIEW ALL EMPLOYEES');
      console.log('\n');
      console.table(res);
      prompt();
  });
}

// Function to view all departments from department table
function viewAllDepartments() {
  const query = `SELECT * FROM department ORDER BY department.id;`;
  db.query(query, (err, res) => {
      if (err) throw err;
      console.log('\n');
      console.log('VIEW ALL DEPARTMENTS');
      console.log('\n');
      console.table(res);
      prompt();
  });
}

// Function to view all roles in role table
function viewAllRoles() {
  const query = `SELECT * FROM role;`;
  db.query(query, (err, res) => {
      if (err) throw err;
      console.log('\n');
      console.log('VIEW ALL ROLES');
      console.log('\n');
      console.table(res);
      prompt();
  });
}

// Function to ask for user input to locate employee ID
function locateID() {
    return ([
        {
            name: 'name',
            type: 'input',
            message: 'What is the employee ID?:'
        }
    ]);
}

// Function to update employee role in role table
async function updateRole() {
  const employeeID = await inquirer.prompt(locateID());
  db.query('SELECT role.id, role.title, role.salary, role.department_id FROM role ORDER BY role.id;', async (err, res) => {
      if (err) throw err;
      const { role } = await inquirer.prompt([
          {
              name: 'role',
              type: 'list',
              choices: () => res.map(res => res.title),
              message: 'What is the updated employee role?: '
          }
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
          console.log('Role title has been updated. Please view all employees to verify...')
          prompt();
      });
  });
}

// Function to view employee ID and remove old employee role
function remove(input) {
    const askUser = {
        yes: "Yes I do",
        no: "No I don't know it (select to view all employees from the list of options)"
    };
    inquirer.prompt([
        {
            name: "action",
            type: "list",
            message: "An employee ID must be entered. View all employees to get the employee ID. Do you know the employee ID?",
            choices: [askUser.yes, askUser.no]
        }
    ]).then(answer => {
        if (input === 'delete' && answer.action === 'Yes I do') removeEmployee();
        else if (input === 'role' && answer.action === 'Yes I do') updateRole();
        else viewAllEmployees();
    });
};

// Function to add an employee to the employee table
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
              managerID = null;
          } else {
              for (const data of res) {
                  data.fullName = `${data.first_name} ${data.last_name}`;
                  if (data.fullName === manager) {
                      managerID = data.id;
                      managerName = data.fullName;
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
                  manager_id: managerID
              },
              (err, res) => {
                  if (err) throw err;
                  prompt();

              }
          );
      });
  });
}

// Function to add a new department name to department table
async function addDepartment() {
  const answers = await inquirer.prompt ([
    {name: 'department',
    message: 'What is the name of the department?:',
    type: 'input'
    }
  ])

    const department = answers.department
    db.query(
        `INSERT INTO department (department_name) VALUES ('${department}')`,
        (err, res) => {
            if (err) throw err;
            console.log('The new department has been added. Please view all departments to verify...');
            prompt();
    })
}

// Function to ask for name of employee
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



