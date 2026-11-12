import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Checkbox from '../components/ui/Checkbox';
import Modal from '../components/ui/Modal';
import Radio from '../components/ui/Radio';

type Category = 'all' | 'cakes' | 'cupcakes' | 'tarts';

type Product = {
  id: number;
  name: string;
  category: Exclude<Category, 'all'>;
  description: string;
  price: number;
  image: string;
};

const categories: ReadonlyArray<{ value: Category; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'cakes', label: 'Cakes' },
  { value: 'cupcakes', label: 'Cupcakes' },
  { value: 'tarts', label: 'Tarts' },
];

const products: Product[] = [
  {
    id: 1,
    name: 'Cherry Cheesecake',
    category: 'cakes',
    description: 'Creamy cheesecake with a bright cherry topping.',
    price: 8,
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=640&q=80',
  },
  {
    id: 2,
    name: 'Chocolate Cake',
    category: 'cakes',
    description: 'Rich chocolate cake with smooth chocolate frosting.',
    price: 7.5,
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=640&q=80',
  },
  {
    id: 3,
    name: 'Vanilla Cupcake',
    category: 'cupcakes',
    description: 'Soft vanilla cupcake finished with buttercream.',
    price: 3,
    image: 'https://images.unsplash.com/photo-1587668178277-295251f900ce?auto=format&fit=crop&w=640&q=80',
  },
  {
    id: 4,
    name: 'Berry Fruit Tart',
    category: 'tarts',
    description: 'A crisp tart filled with custard and fresh berries.',
    price: 6.5,
    image: 'https://images.unsplash.com/photo-1519915028121-7d3463d20b13?auto=format&fit=crop&w=640&q=80',
  },
];

function isCategory(value: string | null): value is Category {
  return categories.some((category) => category.value === value);
}

function ProductModal({
  product,
  open,
  onClose,
}: {
  product: Product | null;
  open: boolean;
  onClose: () => void;
}) {
  const [quantity, setQuantity] = useState(1);
  const [topping, setTopping] = useState('classic');
  const [addSprinkles, setAddSprinkles] = useState(false);

  if (!product) return null;

  const total = product.price * quantity + (addSprinkles ? 0.5 * quantity : 0);

  return (
    <Modal open={open} title={product.name} onClose={onClose}>
      <div style={{ display: 'grid', gap: 20 }}>
        <img
          src={product.image}
          alt=""
          style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 'var(--radius-md)' }}
        />
        <p>{product.description}</p>

        <div style={{ display: 'grid', gap: 10 }}>
          <strong>Quantity</strong>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Button
              type="button"
              variant="secondary"
              aria-label="Decrease quantity"
              onClick={() => setQuantity((value) => Math.max(1, value - 1))}
            >
              -
            </Button>
            <span aria-live="polite">{quantity}</span>
            <Button
              type="button"
              variant="secondary"
              aria-label="Increase quantity"
              onClick={() => setQuantity((value) => value + 1)}
            >
              +
            </Button>
          </div>
        </div>

        <fieldset style={{ display: 'grid', gap: 8, border: 0, padding: 0 }}>
          <legend style={{ fontWeight: 700 }}>Topping</legend>
          <Radio
            name="topping"
            value="classic"
            label="Classic cream"
            checked={topping === 'classic'}
            onChange={(event) => setTopping(event.target.value)}
          />
          <Radio
            name="topping"
            value="chocolate"
            label="Chocolate cream (+$1.00)"
            checked={topping === 'chocolate'}
            onChange={(event) => setTopping(event.target.value)}
          />
        </fieldset>

        <Checkbox
          label="Add sprinkles (+$0.50)"
          checked={addSprinkles}
          onChange={(event) => setAddSprinkles(event.target.checked)}
        />

        <Button type="button" onClick={onClose}>
          Add · ${total.toFixed(2)}
        </Button>
      </div>
    </Modal>
  );
}

export default function Menu() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  const activeCategory: Category = isCategory(categoryParam) ? categoryParam : 'all';
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const visibleProducts =
    activeCategory === 'all'
      ? products
      : products.filter((product) => product.category === activeCategory);

  function selectCategory(category: Category) {
    if (category === 'all') {
      setSearchParams({});
      return;
    }

    setSearchParams({ category });
  }

  return (
    <section style={{ display: 'grid', gap: 24 }}>
      <div>
        <p className="cc-eyebrow">Our selection</p>
        <h2>Menu</h2>
      </div>

      <div role="tablist" aria-label="Product categories" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {categories.map((category) => (
          <button
            key={category.value}
            id={`tab-${category.value}`}
            type="button"
            role="tab"
            aria-selected={activeCategory === category.value}
            aria-controls="product-grid"
            tabIndex={activeCategory === category.value ? 0 : -1}
            onClick={() => selectCategory(category.value)}
            style={{
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 16px',
              cursor: 'pointer',
              color: activeCategory === category.value ? 'white' : 'var(--color-text)',
              background: activeCategory === category.value ? 'var(--color-primary)' : 'var(--color-surface)',
            }}
          >
            {category.label}
          </button>
        ))}
      </div>

      <div
        id="product-grid"
        role="tabpanel"
        aria-labelledby={`tab-${activeCategory}`}
        style={{
          display: 'grid',
          gap: 16,
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        }}
      >
        {visibleProducts.map((product) => (
          <Card key={product.id} title={product.name} onClick={() => setSelectedProduct(product)} style={{ cursor: 'pointer' }}>
            <img
              src={product.image}
              alt={product.name}
              style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 'var(--radius-md)', marginBottom: 12 }}
            />
            <p>{product.description}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <strong>${product.price.toFixed(2)}</strong>
              <Button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setSelectedProduct(product);
                }}
              >
                Add to Cart
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <ProductModal
        product={selectedProduct}
        open={selectedProduct !== null}
        onClose={() => setSelectedProduct(null)}
      />
    </section>
  );
}
