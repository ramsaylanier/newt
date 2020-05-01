import { Database, aql } from "arangojs";
const db = new Database({ url: "http://localhost:8529" });
db.useDatabase("nkg");
db.useBasicAuth("root", "");

export default db;
