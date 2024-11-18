const { faker } = require('@faker-js/faker');
const mysql = require('mysql2');
const express = require('express');
const app = express();
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const uniqueId = uuidv4(); 
const methodOverride = require('method-override');





// set methods 
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'/views'));
 



// use methods 
app.use(express.json());
app.use(express.urlencoded({extended : true}));
app.use(methodOverride("_method"));
app.use(express.urlencoded({extended : true}));



// Create a MySQL connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'delta_app',
    password: 'Mysql@2024'
});


// Function to Generate a Random User Object using Faker
let getRandomUser = () => {
    return [
         faker.string.uuid(),
         faker.internet.username(),
         faker.internet.email(),
         faker.internet.password(),
    ];
};

// home route 
app.get('/', (req, res) => {
    let q = `SELECT COUNT(*) FROM user2`;
    
    connection.query(q, (err, result) => {
        if (err) {
            console.log(err); // log the error for debugging
            return res.status(500).send('Some error in DB'); // send a response immediately
        }
        
        let count = result[0]['COUNT(*)'];
        res.render('home.ejs', { count });
    });
});

// add a new row
app.post('/add', (req, res) => {
    const { username, email, password } = req.body;
    const uniqueId = uuidv4();
    const q =`INSERT INTO user2 (id, username, email, password) VALUES (?, ?, ?, ?)`;
    connection.query(q, [uniqueId, username, email, password], (err, result) => {
        if (err) {
            console.error(err.message);
            return res.status(500).send('Error inserting data into DB');
        }
        res.redirect('/');
    });
});


// Delete  a row 
app.post('/delete', (req, res) => {
    console.log('Delete route triggered'); // Debugging
    console.log('Request Body:', req.body); // Log the data received

    const { id } = req.body;

    const q = `DELETE FROM user2 WHERE id = ?`;
    connection.query(q, [id], (err, result) => {
        if (err) {
            console.error('Error:', err.message); // Log database error
            return res.status(500).send('Error deleting data from DB');
        }

        console.log('Affected Rows:', result.affectedRows); // Log affected rows
        if (result.affectedRows === 0) {
            return res.status(404).send('User Not Found');
        }

        res.redirect('/');
    });
});



// Show route
app.get('/user', (req, res) => {
    let q = `SELECT * FROM user2`;
    connection.query(q, (err, users) => {
        if (err) {
            console.error('Database error:', err); // Log the error
            return res.status(500).send('Some error occurred in the database'); // Send error response
        }
        res.render('showusers.ejs',{users});
    });
});
app.get("/user/:id/edit", (req, res) => {
    let { id } = req.params; // Extract 'id' from request parameters
    let q = `SELECT * FROM user2 WHERE id = ?`; // Use a parameterized query to prevent SQL injection

    try {
        // Pass 'id' as an array to the query
        connection.query(q, [id], (err, result) => {
            if (err) throw err; // Handle query errors
            let user = result[0];
            res.render("edit.ejs", { user }); // Pass the result to the 'edit.ejs' template
        });
    } catch (err) {
        console.error(err); // Log any errors
        res.send("Error occurred in the database."); // Send a user-friendly error message
    }
});
// UPDATE (DB) Route  
app.patch("/user/:id", (req, res) => {  
    let { id } = req.params;  
    let { password: formPass, username: newUsername } = req.body;  

    // SQL query to select user by ID  
    let q = `SELECT * FROM user2 WHERE id = ?`;  
    try {  
        connection.query(q, [id], (err, result) => {  
            if (err) {  
                console.error(err);  
                res.status(500).send("Internal Server Error");  
            } else if (!result.length) {  
                res.status(404).send("User not found");  
            } else {  
                let user = result[0];  
                if (formPass !== user.password) { // Check passwords  
                    res.status(401).send("WRONG PASSWORD");  
                } else {  
                    let q2 = `UPDATE user2 SET username = ? WHERE id = ?`;  
                    connection.query(q2, [newUsername, id], (err, result) => {  
                        if (err) {  
                            console.error(err);  
                            res.status(500).send("Error updating user");  
                        } else {  
                            res.status(200).send("User updated successfully");  
                        }  
                    });  
                }  
            }  
        });  
    } catch (err) {  
        console.error(err);  
        res.status(500).send("Internal Server Error");  
    }  
});

app.listen('8080',()=>{
    console.log("server is listening to port 8080");
});

