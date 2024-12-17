import sqlite3 from "sqlite3";
import { type Database, open } from "sqlite";
import { join } from "node:path"

/* Singleton */
let db: Database;

export default async function getDatabaseConnection() {
	if (!db) {
		db = await open({
			filename: join(__dirname, "products.db"),
			driver: sqlite3.Database,
		});

		const exists = await db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='products'");
		if (!exists) {

			/* Generate 100 products for easier API testing */
			await db.exec(`CREATE TABLE products (
				id varchar(55) PRIMARY KEY,
				name VARCHAR(55),
				description VARCHAR(255),
				category VARCHAR(100),
				createdBy TEXT,
				createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
				updatedBy TEXT DEFAULT NULL,
				updatedAt TIMESTAMP DEFAULT NULL
			)`);

			let query = "BEGIN TRANSACTION;";

			for (let i = 0; i < 100; i++) {
				query += `INSERT INTO products 
                    (id, name, description, category, createdBy)
                VALUES
                    ("ID${i}", "Name ${i}", "Description ${i}", "electronics", "John Doe");`;
			}

			query += "COMMIT;";

			await db.exec(query);
		}
	}
	return db;
}
