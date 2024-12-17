import { getProduct, deleteProduct, updateProduct, getProducts, createProduct } from "../productModel";
import getDatabaseConnection from "../../../db";
import sqlite3 from "sqlite3";
import { type Database, open } from "sqlite";

jest.mock("../../../db");

const MockedDatabase = getDatabaseConnection as jest.MockedFunction<typeof getDatabaseConnection>;
let mockedDb: Database;

describe("Products Controller", () => {

    beforeAll(() => {
        MockedDatabase.mockImplementation(async () => {
			mockedDb = await open({
				filename: ":memory:",
				driver: sqlite3.Database,
			});

            await mockedDb.exec(`CREATE TABLE products (
                id varchar(55) PRIMARY KEY,
                name VARCHAR(55),
                description VARCHAR(255),
                category TEXT,
                createdBy TEXT,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updatedBy TEXT DEFAULT NULL,
                updatedAt TIMESTAMP DEFAULT NULL
            )`);

			let query = "BEGIN TRANSACTION;";

			for (let i = 0; i < 60; i++) {
				query += `INSERT INTO products 
                    (id, name, description, category, createdBy)
                VALUES
                    ("id${i}", "Name ${i}", "Description ${i}", "electronics", "John Doe");`;
			}

			query += "COMMIT;";

			await mockedDb.exec(query);

			return mockedDb;
		});
    });

	afterAll(async () => {
		await mockedDb.close();
	});

    describe("getProduct", () => {
        it("Should return a product", async () => {
			const result = await getProduct("id1");
			expect(result).toMatchObject({
				id: "id1",
				name: "Name 1",
				description: "Description 1",
				category: "electronics"
			});
		});

		it("Should not return a product", async () => {
			const result = await getProduct("non-existing-id");
			expect(result).not.toBeInstanceOf(Object);
		});
    })

    describe("deleteProduct", () => {
		it("Should delete a product", async () => {
			const result = await deleteProduct("id1");
			expect(result).toBe(true);
		});

		it("Should not delete a product", async () => {
			const result = await deleteProduct("non-existing-id");
			expect(result).toBeFalsy();
		});
	});

    describe("updateProduct", () => {
		it("Should update a product", async () => {
			const result = await updateProduct("johndoe@example.com", "id1", {
                name: "Updated Name",
                description: "Updated Description",
                category: "electronics",
            });
			expect(result).toBe(true);
		});

        it("Should not update a product", async () => {
			const result = await updateProduct("johndoe@example.com", "non-existing-id", {
				name: "Updated Name",
				description: "Updated Description",
				category: "electronics",
			});
			expect(result).toBeFalsy();
		});
	});

    describe("getProducts", () => {
		it("Should return a list of products", async () => {
			const result = await getProducts(1, 20);
			expect(result).toHaveProperty("products");
			expect(result).toHaveProperty("total");
		});
	});

    describe("createProduct", () => {
        it("Should create a product", async () => {
            const result = await createProduct("johndoe@example.com", {
                id: "camera-12",
                name: "Camera 12",
                description: "This is a brand new camera",
                category: "photo"
            });
            expect(result).toBe("camera-12");
        });
    });
});