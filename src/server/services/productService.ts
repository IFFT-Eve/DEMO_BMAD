import { db } from "../db";

export async function list() {
  return db.product.findMany({ orderBy: { name: "asc" } });
}

export async function byId(id: string) {
  return db.product.findUnique({ where: { id } });
}
