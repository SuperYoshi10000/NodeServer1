"use strict";

const _ = require("lodash");
const http = require("http");
const Datastore = require("nedb");

class Database {
    static db(name) {
        const datastore = new Datastore(`nedb/${name}.db`);
        datastore.loadDatabase();
        return datastore;
    }

    users = db("users");
}

const port = process.env.PORT || 1337;

http.createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Hello World\n");
}).listen(port);
