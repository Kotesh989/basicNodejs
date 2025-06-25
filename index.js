const { faker } = require('@faker-js/faker');
const mysql = require('mysql2');
const express = require("express");
const app = express();
const port = 8080;
let methodOverride = require("method-override");
app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));


const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'college',
  password: "123456",
});

let createRandomUser = () => {
  return [
    faker.string.uuid(),
    faker.internet.username(), // before version 9.1.0, use userName()
    faker.internet.email(),
    faker.internet.password(),
  ];
}

// let q='INSERT INTO STUDENT1 (ID,NAME,EMAIL,PASSWORD) VALUES ?';

// let data = [];

// for(let i=1;i<=100;i++){
//     data.push(createRandomUser());
// }

// try{
//     connection.query(
//   q,[data],
//   (err, results) => {
//     if(err) throw err;
//     console.log(results); // results contains rows returned by server
//   }
// );
// }
// catch(err){
//     console.log(err); 
// }

// connection.end();


// console.log(createRandomUser());

app.get("/", (req, res) => {
  let q = "SELECT COUNT(*) FROM STUDENT1";
  try {
    connection.query(q, (err, results) => {
      if (err) throw err;
      let count = results[0]["COUNT(*)"];
      res.render("home.ejs", { count });
    })
  }
  catch (err) {
    console.log("Error:", err);
  }
})

app.get("/users", (req, res) => {
  let q = "SELECT * FROM STUDENT1";
  try {
    connection.query(q, (err, results) => {
      if (err) throw err;
      res.render("show.ejs", { results });
    })
  }
  catch (err) {
    console.log("Error:", err);
  }
})

app.post("/users", (req, res) => {

  let { name1, pass } = req.body;
  let q = "SELECT * FROM STUDENT1 where name=? and password=?";
  try {
    connection.query(q, [name1, pass], (err, results) => {
      if (err) throw err;
      console.log(results);
      if (results.length != 0) {
        res.render("search.ejs", { results });
      }
      else {
        res.send("Username and password is incorrect");
      }
    })
  }
  catch (err) {
    console.log("Error:", err);
  }
});
app.get("/users/:id/edit", (req, res) => {
  let { id } = req.params;
  let q = "SELECT * FROM STUDENT1 where id=?";
  try {
    connection.query(q, [id], (err, results) => {
      if (err) throw err;
      let name = results[0];
      res.render("edit.ejs", { name });
    })
  }
  catch (err) {
    console.log("Error:", err);
  }
});


app.patch("/user/:id", (req, res) => {
  let { email, password } = req.body;
  let { id } = req.params;
  console.log(email, id);

  let q = "update student1 set email=?,password=? where id=?";
  try {
    connection.query(q, [email, password, id], (err, results) => {
      if (err) throw err;
      res.redirect("http://localhost:8080/");
    })

  }
  catch (err) {
    console.log("Error:", err);
  }

})

app.get("/users/register", (req, res) => {
  res.render("new.ejs");
})

app.post("/users/register", (req, res) => {
  let { id, name1, email, pass } = req.body;
  let details = [id, name1, email, pass];

  console.log(details);

  let q = "Insert into Student1 (id,name,email,password)values (?,?,?,?)";
  try {
    connection.query(q, details, (err, results) => {
      if (err) throw err;
      res.redirect("http://localhost:8080/")
    })

  }
  catch (err) {
    console.log("Error:", err);
  }
})

app.delete("/users/:id/delete", (req, res) => {
  const { id } = req.params;

  const fetchQuery = "SELECT * FROM student1 WHERE id = ?";
  const deleteQuery = "DELETE FROM student1 WHERE id = ?";

 try{
   connection.query(fetchQuery, [id], (err, results) => {
    if (err) {
      if(err) throw err;
      return res.status(500).send("Error fetching user.");
    }

    if (results.length === 0) {
      return res.send(`<h1>User with ID ${id} not found</h1><a href="/users">⬅ Back to Users</a>`);
    }

    const deletedUser = results[0]; 

    connection.query(deleteQuery, [id], (err2, result2) => {
      if (err2) {
        console.log("Delete error:", err2);
        return res.status(500).send("Error deleting user.");
      }

      res.send(`
        <h1>User Deleted Successfully!</h1>
        <h2>ID: ${deletedUser.id}</h2>
        <h2>Name: ${deletedUser.name}</h2>
        <h2>Email: ${deletedUser.email}</h2>
        <a href="/users">⬅ Back to Users</a>
      `);
    });
  });
 }
 catch(err){
  console.log(err);
  
 }
});


app.listen(port, () => {
  console.log("app listening");
});