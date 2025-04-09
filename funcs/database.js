const fs = require('fs');

// Function to read the database (JSON file) and parse it
function readDb(databaseName) {
  try {
    let data = fs.readFileSync(databaseName, 'utf8');
    return JSON.parse(data);  // Return parsed object
  } catch (err) {
    console.error("Error reading the database file:", err);
    return {};  // Return empty object if error occurs
  }
}

// Function to write the database (JSON object) back to the file
function writeDb(db, databaseName) {
  try {
    fs.writeFileSync(databaseName, JSON.stringify(db, null, 2), 'utf8');
  } catch (err) {
    console.error("Error writing to the database file:", err);
  }
}

// Function to add a new user to the database with default values
function addUserDb(userid, databaseName) {
  const db = readDb(databaseName);
  if (!db[userid]) {  // Check if user does not exist
    db[userid] = {
      fbnormal: '',
      fbhd: '',
      fbmp3: '',
      twhd: '',
      twsd: '',
      twaud: ''
    };
    writeDb(db, databaseName);  // Write the updated database back to file
  } else {
    console.log("User already exists in the database.");
  }
}

// Function to change a boolean field in the user's record (toggle the value)
function changeBoolDb(userid, name, databaseName) {
  const db = readDb(databaseName);
  if (db[userid]) {  // Check if user exists
    if (typeof db[userid][name] !== 'undefined') {
      db[userid][name] = !db[userid][name];  // Toggle boolean value
      writeDb(db, databaseName);  // Write updated data to file
    } else {
      console.log("Field name does not exist in the user's record.");
    }
  } else {
    console.log("User does not exist in the database.");
  }
}

module.exports = {
  readDb,
  writeDb,
  addUserDb,
  changeBoolDb
}
