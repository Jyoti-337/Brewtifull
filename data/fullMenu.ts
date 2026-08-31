export interface FullMenuProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  rating: number;
  image: string;
  category: 'Hot Coffee' | 'Cold Drinks' | 'Pastries' | 'Seasonal';
  isPopular?: boolean;
  isNew?: boolean;
  features: string[];
}

export const fullMenu: FullMenuProduct[] = [
  // Hot Coffee
  { id: "cappuccino-signature", name: "Cappuccino", description: "Rich espresso topped with equal parts steamed milk and velvety foam, finished with a fine dust of dark cocoa powder.", price: 280, rating: 4.9, image: "/coffee/cappuccino.jpg", category: "Hot Coffee", isPopular: true, features: ["Espresso", "Steamed Milk", "Velvety Foam"] },
  { id: "latte-signature", name: "Latte", description: "Smooth, creamy espresso infused with silky steamed milk and a delicate layer of micro-foam.", price: 300, rating: 5.0, image: "/coffee/latte.jpg", category: "Hot Coffee", isPopular: true, features: ["Espresso", "Steamed Milk", "Light Foam"] },
  { id: "mocha-signature", name: "Mocha", description: "Decadent dark espresso meeting luxurious Dutch cocoa, steamed milk, and whipped cream.", price: 320, rating: 4.7, image: "/coffee/mocha.jpg", category: "Hot Coffee", isPopular: true, features: ["Espresso", "Chocolate", "Steamed Milk"] },
  { id: "espresso-classic", name: "Espresso", description: "Pure, intense double shot of our single-origin artisanal coffee beans.", price: 200, rating: 4.8, image: "/coffee/latte.jpg", category: "Hot Coffee", features: ["Strong", "Single Origin"] },
  { id: "flat-white", name: "Flat White", description: "Double ristretto blended with micro-foamed milk for a velvety finish.", price: 280, rating: 4.9, image: "/coffee/latte.jpg", category: "Hot Coffee", isPopular: true, features: ["Smooth", "Micro-foam"] },

  // Cold Drinks
  { id: "cold-brew-nitro", name: "Nitro Cold Brew", description: "Signature cold brew coffee steeped for 18 hours and infused with nitrogen draft.", price: 420, rating: 4.9, image: "/coffee/nitro_cold_brew_1775555494236.png", category: "Cold Drinks", isPopular: true, features: ["Nitrogen Draft", "18hr Steep"] },
  { id: "iced-matcha-latte", name: "Iced Matcha Latte", description: "Ceremonial grade Uji matcha whisked with fresh oat milk over ice.", price: 360, rating: 4.9, image: "/coffee/iced_matcha_1775555672609.png", category: "Cold Drinks", isPopular: true, isNew: true, features: ["Ceremonial Matcha", "Antioxidant Rich"] },

  // Pastries
  { id: "butter-croissant", name: "French Butter Croissant", description: "Flaky, multi-layered French butter pastry baked fresh every morning.", price: 180, rating: 4.8, image: "/coffee/croissant_1775555590339.png", category: "Pastries", isPopular: true, features: ["Freshly Baked", "Pure Butter"] },
  { id: "chocolate-muffin", name: "Dark Chocolate Muffin", description: "Rich Belgian chocolate muffin stuffed with melted chocolate chips.", price: 160, rating: 4.6, image: "/coffee/chocolate_muffin_1775555639813.png", category: "Pastries", features: ["Belgian Cocoa", "Double Choc"] },

  // Seasonal
  { id: "pumpkin-spice-latte", name: "Pumpkin Spice Latte", description: "Signature espresso blended with warm autumn spices, pumpkin puree, and steamed milk.", price: 380, rating: 4.8, image: "/coffee/cappuccino.jpg", category: "Seasonal", isNew: true, features: ["Seasonal Spice", "Limited Edition"] }
];
