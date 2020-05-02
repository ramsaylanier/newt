const { Database, aql } = require("arangojs");
const db = new Database({ url: "http://localhost:8529" });
db.useDatabase("nkg");
db.useBasicAuth("root", "");

module.exports = db;
