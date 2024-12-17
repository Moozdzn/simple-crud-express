import type { Product } from "../../../../shared/schemas";
import getDatabaseConnection from "../../db";

export async function getProduct(id: string) {
	const db = await getDatabaseConnection();
	const product = await db.get<Product>("SELECT id, name, description, category FROM products WHERE id = ?", [id]);

	return product;
}

export async function deleteProduct(id: string): Promise<boolean> {
	const db = await getDatabaseConnection();
	const result = await db.run("DELETE FROM products WHERE id = ?", [id]);

	return result && result.changes === 1;
}

export async function updateProduct(mail: string, id: string, data: Partial<Product>): Promise<boolean> {
	const params = [];
	const values = [];

	for (const [key, value] of Object.entries(data)) {
		params.push(`${key} = ?`);
		values.push(value);
	}

	values.push(mail, id);

	const db = await getDatabaseConnection();
	const result = await db.run(`UPDATE products SET ${params.join(", ")}, updatedBy = ?, updatedAt = CURRENT_TIMESTAMP  WHERE id = ?`, values);

	return result && result.changes === 1;
}

export async function getProducts(page: number, per_page: number) {
	const db = await getDatabaseConnection();
	const response = await db.get<{ total: number }>("SELECT COUNT(id) as total FROM products");
	if (!response) {
		return {
			products: [],
			total: 0,
		};
	}

	const { total } = response;
	const products = await db.all<Product[]>("SELECT id, name, description, category FROM products LIMIT ? OFFSET ?", [per_page, (page - 1) * per_page]);

	return {
		products,
		total,
	};
}

export async function createProduct(email: string, data: Product): Promise<string | null> {
	const { id, name, description, category } = data;
	const db = await getDatabaseConnection();
	const response = await db.run(
		`
        INSERT INTO products 
            (id, name, description, category, createdBy) 
        VALUES 
            (?, ?, ?, ?, ?)`,
		[id, name, description, category, email]
	);

	return response && id;
}
