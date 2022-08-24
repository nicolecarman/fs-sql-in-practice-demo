// boilerplate code
// let's import the dotenv package, configure it, so we can use the variables
require("dotenv").config();

// now we need to import sequelize. note that the default export is a class (that's why "sequelize" has a capital S)
const Sequelize = require("sequelize");

// destructure the CONNECTION_STRING from our process.env object. we can now use CONNECTION_STRING as a variable
const {CONNECTION_STRING} = process.env;

// instantiate a sequelize object (don't capitalize) from the Sequelize class (capitalize)
const sequelize = new Sequelize(CONNECTION_STRING, {
    dialect: "postgres",
    dialectOptions: {
        ssl: {
            rejectUnauthorized: false
        }
    }
})


// JUST FOR THIS DEMO, let's declare a few variables 
const userId = 4;
const clientId = 3;


// another module.exports
// if you have more than one module.exports object, you can organize them and put whatever you want in them depending on what functionality you want and what project you're creating. there's no certain way to have them.
module.exports = {
    getUserInfo: (req, res) => {
        // c for "clients", u for "users"
        sequelize.query(`SELECT * FROM cc_clients AS c
        JOIN cc_users AS u
        ON  c.user_id = u.user_id
        WHERE u.user_id = ${userId}`)
        // sequelize waits until the above code pulls our data before doing anything else (hence the ".then" -- do this, then this)
            .then((dbResponse) => {
                // Sequelize will store your data at the index of 0
                res.status(200).send(dbResponse[0])
            })
            .catch((err) => {
                console.log(err);
            })
    },
    updateUserInfo: (req, res) => {
        let {
            firstName,
            lastName,
            phoneNumber,
            email,
            address,
            city,
            state,
            zipCode
        } = req.body;

        sequelize.query(`UPDATE cc_users
        SET first_name='${firstName}',
            last_name='${lastName}',
            email='${email}',
            phone_number=${phoneNumber}
        WHERE user_id=${userId};
        
        UPDATE cc_clients
        SET address='${address}',
            city='${city}',
            state='${state}',
            zip_code=${zipCode}
        WHERE user_id=${userId};`)
            // we used single quotes above (with ${}'s) because it's a string and we want to be sure it's formatted that way
            .then((dbResponse) => {
                res.status(200).send(dbResponse[0]);
            })
            .catch((err) => {
                console.log(err);
            })
    },
    getUserAppt: (req, res) => {
        sequelize.query(`SELECT * FROM cc_appointments
        WHERE client_id=${clientId}
        ORDER BY date DESC;`)
            .then((dbResponse) => {
                res.status(200).send(dbResponse[0]);
            })
            .catch ((err) => {
                console.log(err);
            })
    },
    requestAppointment: (req, res) => {
        // destructure stuff coming from the front end to be able to use as variables
        const {date, service} = req.body;

        sequelize.query(`INSERT INTO cc_appointments(client_id, date, service_type, notes, approved, completed)
        VALUES(${clientId}, '${date}', '${service}', 'Demo appointment', false, false)
        RETURNING *;`)
        // the above reads "returning splat", which returns everything we're inserting, since we never usually get anything returned when inserting stuff into a table
            .then((dbResponse) => {
                res.status(200).send(dbResponse[0]);
            })
            .catch ((err) => {
                console.log(err);
            })
    }
}