import Datastore from "@seald-io/nedb";
class Database {
    static db(name: string): Datastore {
        const datastore = new Datastore(`nedb/${name}.db`);
        datastore.loadDatabase();
        return datastore;
    }

    users: Datastore = Database.db("users");
}

export default Database;