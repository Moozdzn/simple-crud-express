import request from "supertest";
import app from "../../../server";
import getDatabaseConnection from "../../../db";
import sqlite3 from "sqlite3";
import { type Database, open } from "sqlite";

jest.mock("../../../db");

const MockedDatabase = getDatabaseConnection as jest.MockedFunction<typeof getDatabaseConnection>;
let mockedDb: Database;

const server = request(app);

describe("Products API Endpoint", () => {

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

    describe("GET /products", () => {
        describe("product list" , () => {
            it("Should return a list of products", async () => {
				const response = await server.get("/api/v1/products");
				expect(response.status).toBe(200);
				expect(response.headers["content-type"]).toEqual(expect.stringContaining("json"));
				expect(response.body).toHaveProperty("products");
			});
        })

        describe("paginated meta", () => {
            it("Should return have general metadata", async () => {
				const response = await server.get("/api/v1/products");
				expect(response.status).toBe(200);
				expect(response.headers["content-type"]).toEqual(expect.stringContaining("json"));
				expect(response.body).toHaveProperty("meta");
                expect(response.body).toHaveProperty("meta.total");
                expect(response.body).toHaveProperty("meta.current_page");
                expect(response.body).toHaveProperty("meta.per_page");
			});

            it("Should have previous and next page url metadata", async () => {
				const response = await server.get("/api/v1/products?page=2&per_page=20");
				expect(response.status).toBe(200);
				expect(response.headers["content-type"]).toEqual(expect.stringContaining("json"));

				expect(response.body).toHaveProperty("meta");
                expect(response.body).toHaveProperty("meta.previous_page_link");
                expect(response.body).toHaveProperty("meta.next_page_link");
			});

            it("Should only have previous page url metadata", async () => {
				const response = await server.get("/api/v1/products?page=3&per_page=20");
				expect(response.status).toBe(200);

				expect(response.headers["content-type"]).toEqual(expect.stringContaining("json"));
				expect(response.body).toHaveProperty("meta");
                expect(response.body).toHaveProperty("meta.previous_page_link");
				expect(response.body).not.toHaveProperty("meta.next_page_link");
			});

            it("Should only have next page url metadata", async () => {
				const response = await server.get("/api/v1/products?page=1&per_page=20");
				expect(response.status).toBe(200);
                
				expect(response.headers["content-type"]).toEqual(expect.stringContaining("json"));
				expect(response.body).toHaveProperty("meta");
                expect(response.body).not.toHaveProperty("meta.previous_page_link");
				expect(response.body).toHaveProperty("meta.next_page_link");
			});
        });
    })

    describe("POST /products", () => {
		it("Should creates a new product", async () => {
            const response = await server.post("/api/v1/products").send({ id: "camera-12", name: "Camera 12", description: "This is a brand new camera", category: "image" });
            expect(response.status).toBe(201);
            expect(response.headers["content-type"]).toEqual(expect.stringContaining("json"));
            expect(response.body).toHaveProperty("id");
            expect(response.body).toHaveProperty("message");
        });

		it("Should return invalid input", async () => {
            const response = await server.post("/api/v1/products").send({ name: "Camera 12", description: "This is a brand new camera", category: "image" });
            expect(response.status).toBe(400);
            expect(response.headers["content-type"]).toEqual(expect.stringContaining("json"));
            expect(response.body).toHaveProperty("error");
        });

		it("Should return that product already exists", async () => {
            const response = await server.post("/api/v1/products").send({ id: "ID1", name: "Camera 12", description: "This is a brand new camera", category: "image" });
            expect(response.status).toBe(409);
            expect(response.headers["content-type"]).toEqual(expect.stringContaining("json"));
            expect(response.body).toHaveProperty("error");
        });

	});

    describe("GET /products/:id", () => {
		it("Should return a product", async () => {
            const response = await server.get("/api/v1/products/id1");
            expect(response.status).toBe(200);
            expect(response.headers["content-type"]).toEqual(expect.stringContaining("json"));
            expect(response.body).toHaveProperty("id");
            expect(response.body).toHaveProperty("name");
            expect(response.body).toHaveProperty("description");
            expect(response.body).toHaveProperty("category");
        });

		it("Should fail to find the product", async () => {
            const response = await server.get("/api/v1/products/camera-12");
            expect(response.status).toBe(404);
            expect(response.headers["content-type"]).toEqual(expect.stringContaining("json"));
            expect(response.body).toHaveProperty("error");
        });
	});

    describe("PUT /products/:id", () => {
		it("Should update the product", async () => {
            const response = await server.put("/api/v1/products/id1").send({ name: "Camera 12", description: "This is an updated camera description", category: "photo" });
            expect(response.status).toBe(200);
            expect(response.headers["content-type"]).toEqual(expect.stringContaining("json"));
            expect(response.body).toHaveProperty("message");
        });

		it("Should fail with empty body", async () => {
            const response = await server.put("/api/v1/products/id1").send({});
            expect(response.status).toBe(400);
            expect(response.headers["content-type"]).toEqual(expect.stringContaining("json"));
            expect(response.body).toHaveProperty("error");
        });

        it("Should fail when product id is not found", async () => {
            const response = await server.put("/api/v1/products/camera-13").send({ name: "Camera 13", description: "This is an updated camera description", category: "photo" });
            expect(response.status).toBe(404);
            expect(response.headers["content-type"]).toEqual(expect.stringContaining("json"));
            expect(response.body).toHaveProperty("error");
        });
	});

    describe("DELETE /products/:id", () => {
		it("Should delete the product", async () => {
            const response = await server.delete("/api/v1/products/id1");
            expect(response.status).toBe(200);
            expect(response.headers["content-type"]).toEqual(expect.stringContaining("json"));
            expect(response.body).toHaveProperty("message");
        });

		it("Should fail when product id is not found", async () => {
            const response = await server.delete("/api/v1/products/camera-13");
            expect(response.status).toBe(404);
            expect(response.headers["content-type"]).toEqual(expect.stringContaining("json"));
            expect(response.body).toHaveProperty("error");
        });
	});
})