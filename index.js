// Import and require dependencies
const express = require('express');
const inquirer = require('inquirer');
const { isNull } = require('mathjs');
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
    viewSalaries: "View Department Spend",
    viewByManager: "View Employees By Manager",
    addEmployee: "Add Employee",
    addDepartment: "Add Department",
    addRole: "Add Role",
    updateRole: "Update Employee Role",
    removeEmployee: "Remove Employee",
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
              userSelections.removeEmployee,
              userSelections.viewSalaries,
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

              case userSelections.viewByManager:
                  viewByManager();
                  break;

              case userSelections.viewSalaries:
                  viewSalaries();
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

              case userSelections.removeEmployee:
                  remove('delete');
                  break;

              case userSelections.quit:
                  db.end();
                  break;
          }
      });
}

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

function viewAllRoles() {
  const query = `SELECT * FROM role;`;
  // `SELECT role.id, role.title, role.salary, department.department_name AS department FROM department
  // INNER JOIN department ON (department.id = role.department_id)
  // ORDER BY role.title;`;
  //INNER JOIN department ON (department.id = role.department_id)
  db.query(query, (err, res) => {
      if (err) throw err;
      console.log('\n');
      console.log('VIEW ALL ROLES');
      console.log('\n');
      console.table(res);
      prompt();
  });
}

function locateID() {
    return ([
        {
            name: 'name',
            type: 'input',
            message: 'What is the employee ID?:'
        }
    ]);
}

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
          },
          {
            name: 'role',
            type: 'list',
            choices: () => res.map(res => res.salary),
            message: 'What is the updated employee salary?: '
        },
        {
          name: 'role',
          type: 'list',
          choices: () => res.map(res => res.department_id),
          message: 'What is the updated department ID?: '
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

function remove(input) {
    const askUser = {
        yes: "Yes",
        no: "No I don't (view all employees on the main option)"
    };
    inquirer.prompt([
        {
            name: "action",
            type: "list",
            message: "An employee ID must be entered. View all employees to get the employee ID. Do you know the employee ID?",
            choices: [askUser.yes, askUser.no]
        }
    ]).then(answer => {
        if (input === 'delete' && answer.action === 'Yes') removeEmployee();
        else if (input === 'role' && answer.action === 'Yes') updateRole();
        else viewAllEmployees();
    });
};

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
              managerID = null;
          } else {
              for (const data of res) {
                  data.fullName = `${data.first_name} ${data.last_name}`;
                  if (data.fullName === manager) {
                      managerID = data.id;
                      managerName = data.fullName;
                      console.log(managerID);
                      console.log(managerName);
                      console.log(data.id);
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


// async function addRole() {
//     db.query('SELECT role.title, role.salary FROM role;', async (err, res) => {
//         if (err) throw err;
//     const answers = await inquirer.prompt ([
//       {
//         name: 'role',
//         message: 'What is the title of the role?:',
//         type: 'input'
//       },
//       {
//         name: 'salary',
//         message: 'What is the salary for the role?:',
//         type: 'input'
//       },
//     //   {
//     //     name: 'department',
//     //     type: 'list',
//     //     choices: () => res.map(res => res.department),
//     //     message: 'What department does the role belong to?: '
//     //   }
//     ])

//     db.query(
//     'INSERT INTO role SET ?',
//     {
//         title: addRole.title,
//         salary: addRole.salary
//     },
//     (err, res) => {
//         if (err) throw err;
//         prompt();
//     })
//     })
// }

// async function addRole() {
//     const answers = await inquirer.prompt ([
//     {
//       name: 'addRole',
//       type: "input",
//       message: "'What is the title of the role?;"
//     },
//     {
//         name: 'addSalary',
//         type: "input",
//         message: "'What is the salary for the role?;"
//     }
//     ])
//     .then(function (answers) {
//       console.log(answers.addRole);
//       console.log(answers.addSalary);
//       db.query("INSERT INTO role SET ?",
//       {
//         title: answers.addRole,
//         salary: answers.addSalary
//       }, function (err, res) {
//         if (err) throw err;
//         console.table(res);
//         console.log("The role has been added.");
//         prompt()
//       })
//     }); 
// }


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

// ADD ROLE
// 1. Create function addRole
// 2. Ask questions from user to get information for inquirer.prompt
// 3. Query database to get from the department table
// 4. Make an inquiry.prompt to return a list of departments that the user can choose from
// 5. Make a call to insert into the role table; salary, title, dept


