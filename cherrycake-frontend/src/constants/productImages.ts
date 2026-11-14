export const PRODUCT_IMAGES: Record<string, string> = {
  'Cherry Cake': '/images/5.jpg',
  'Chocolate Truffle Cake': '/images/4.jpg',
  'Red Velvet Cake': '/images/3.jpg',
  'Napoleon Cake': '/images/2.jpg',
  'Honey Cake': '/images/1.jpg',
  'Cherry Cheesecake': '/images/9.jpg',
  'Tiramisu': '/images/8.jpg',
  'Macarons Box': '/images/7.jpg',
  'Chocolate Eclair': '/images/6.jpg',
  'Cappuccino': '/images/12.jpg',
  'Latte': '/images/11.jpg',
  'Cherry Lemonade': '/images/10.jpg',
};

export function getProductImage(name: string): string {
  return PRODUCT_IMAGES[name] ?? '/favicon.svg';
}
