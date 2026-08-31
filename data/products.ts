export interface CoffeeProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  rating: number;
  image: string;
  features: string[];
}

export const coffeeProducts: CoffeeProduct[] = [
  {
    id: 'cappuccino-signature',
    name: 'Cappuccino',
    description: 'Rich espresso topped with equal parts steamed milk and velvety foam, finished with a fine dust of dark cocoa powder.',
    price: 280,
    rating: 4.9,
    image: '/coffee/cappuccino.jpg',
    features: ['Espresso', 'Steamed Milk', 'Velvety Foam']
  },
  {
    id: 'latte-signature',
    name: 'Latte',
    description: 'Smooth, creamy espresso infused with silky steamed milk and a delicate layer of micro-foam.',
    price: 300,
    rating: 5.0,
    image: '/coffee/latte.jpg',
    features: ['Espresso', 'Steamed Milk', 'Light Foam']
  },
  {
    id: 'mocha-signature',
    name: 'Mocha',
    description: 'Decadent dark espresso meeting luxurious Dutch cocoa, steamed milk, and whipped cream.',
    price: 320,
    rating: 4.7,
    image: '/coffee/mocha.jpg',
    features: ['Espresso', 'Chocolate', 'Steamed Milk']
  }
];

export interface FeatureHighlight {
  title: string;
  description: string;
  position: 'left' | 'right';
}

export const features: FeatureHighlight[] = [
  {
    title: 'High-Quality Beans',
    description: 'High-quality beans are a single told story about craft, dedication, and the culinary journey where every sip is unique.',
    position: 'left'
  },
  {
    title: 'Individual Approach',
    description: 'Most visitors expect coffee culture today is meticulously designed and economically managed. Individual approach.',
    position: 'right'
  },
  {
    title: 'Atmosphere of Inspiration',
    description: 'Immerse yourself in a warm, welcoming ambience designed to spark creativity, conversation, and memorable coffee moments.',
    position: 'left'
  },
  {
    title: 'Professional Baristas',
    description: 'Professional Baristas are server professional and deliver rich experiences with every custom coffee crafted perfectly.',
    position: 'right'
  }
];
