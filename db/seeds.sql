INSERT INTO department (department_name)
VALUES ("Finance"),
       ("Human Resources"),
       ("Engineering"),
       ("Compliance"),
       ("Executive Leadership"),
       ("Sales");


INSERT INTO role (title, salary, department_id)
VALUES ("Finance Manager", 60000, 1),
       ("Human Resources Officer", 35000, 2),
       ("Software Developer", 45000, 3),
       ("IT Technician", 30000, 3),
       ("Legal Associate", 45000, 4),
       ("Legal Director", 100000, 4),
       ("CEO", 350000, 5),
       ("Sales Executive", 40000, 6);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Michelle", "Jackson", 1, NULL),
       ("Finn", "Breen", 2, NULL),
       ("Stacey", "Green", 3, NULL),
       ("Macey", "Pace", 4, NULL),
       ("Abdul", "Hussain", 5, 6),
       ("Patience", "Okoro", 6, NULL),
       ("Natasha", "Brown", 7, NULL),
       ("Mark", "Lipz", 8, NULL);
