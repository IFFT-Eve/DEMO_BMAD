import { db } from "../src/server/db";

const products = [
  {
    slug: "classic-tee",
    name: "Classic Tee",
    description:
      "A timeless cotton crew-neck tee that fits every wardrobe. Relaxed fit, pre-washed for softness.",
    imageUrl: "/products/classic-tee.jpg",
    priceCents: 1999,
    stock: 50,
  },
  {
    slug: "canvas-tote-bag",
    name: "Canvas Tote Bag",
    description:
      "A sturdy, heavyweight canvas tote with reinforced handles. Fits a laptop, books, and everything else.",
    imageUrl: "/products/canvas-tote-bag.jpg",
    priceCents: 2499,
    stock: 30,
  },
  {
    slug: "crew-sweatshirt",
    name: "Crew Sweatshirt",
    description:
      "Heavyweight 400gsm fleece in a boxy silhouette. Brushed interior for warmth without bulk.",
    imageUrl: "/products/crew-sweatshirt.jpg",
    priceCents: 4999,
    stock: 20,
  },
  {
    slug: "slim-chinos",
    name: "Slim Chinos",
    description:
      "Stretch-twill chinos with a tapered leg. Moves with you, looks sharp all day.",
    imageUrl: "/products/slim-chinos.jpg",
    priceCents: 7999,
    stock: 15,
  },
  {
    slug: "wool-beanie",
    name: "Wool Beanie",
    description:
      "100% merino wool, double-knit for extra warmth. One size fits most; naturally odour-resistant.",
    imageUrl: "/products/wool-beanie.jpg",
    priceCents: 1499,
    stock: 40,
  },
  {
    slug: "leather-belt",
    name: "Leather Belt",
    description:
      "Full-grain leather belt with a brushed brass buckle. Hardens and softens with wear to fit your form.",
    imageUrl: "/products/leather-belt.jpg",
    priceCents: 3499,
    stock: 25,
  },
];

async function seed() {
  console.log("Seeding products…");

  for (const product of products) {
    await db.product.upsert({
      where: { slug: product.slug },
      update: product,
      create: product,
    });
    console.log(`  ✓ ${product.slug}`);
  }

  console.log(`Seeding complete — ${products.length} products.`);
}

seed()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(() => {
    void db.$disconnect();
  });
