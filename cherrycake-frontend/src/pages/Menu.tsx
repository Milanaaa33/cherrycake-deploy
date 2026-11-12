import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { api } from '../api/client';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Checkbox from '../components/ui/Checkbox';
import Modal from '../components/ui/Modal';
import Radio from '../components/ui/Radio';
import type { RootState } from '../store';

type Category = {
  id: number;
  name: string;
};

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  photoUrl: string | null;
  inStock: boolean;
};

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
          src={product.photoUrl ?? '/favicon.svg'}
          alt={product.name}
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
          <Radio name="topping" value="classic" label="Classic cream" checked={topping === 'classic'} onChange={(event) => setTopping(event.target.value)} />
          <Radio name="topping" value="chocolate" label="Chocolate cream (+$1.00)" checked={topping === 'chocolate'} onChange={(event) => setTopping(event.target.value)} />
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
  const currentRegion = useSelector((state: RootState) => state.region.code);
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  const selectedCategoryId = categoryParam ? Number(categoryParam) : undefined;
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoadingCategories(true);

    api.get<Category[]>('/categories')
      .then(({ data }) => {
        if (active) setCategories(data);
      })
      .catch(() => {
        if (active) setError('Unable to load categories. Please try again.');
      })
      .finally(() => {
        if (active) setLoadingCategories(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    const params: { region: string; categoryId?: number } = { region: currentRegion };
    if (selectedCategoryId !== undefined && Number.isInteger(selectedCategoryId)) {
      params.categoryId = selectedCategoryId;
    }

    setLoadingProducts(true);
    setError('');

    api.get<Product[]>('/products', { params })
      .then(({ data }) => {
        if (active) setProducts(data);
      })
      .catch(() => {
        if (active) setError('Unable to load products. Please try again.');
      })
      .finally(() => {
        if (active) setLoadingProducts(false);
      });

    return () => {
      active = false;
    };
  }, [currentRegion, selectedCategoryId]);

  function selectCategory(categoryId?: number) {
    if (categoryId === undefined) {
      setSearchParams({});
      return;
    }

    setSearchParams({ category: String(categoryId) });
  }

  return (
    <section style={{ display: 'grid', gap: 24 }}>
      <div>
        <p className="cc-eyebrow">Our selection</p>
        <h2>Menu</h2>
      </div>

      <div role="tablist" aria-label="Product categories" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button
          type="button"
          role="tab"
          aria-selected={selectedCategoryId === undefined}
          onClick={() => selectCategory()}
          style={{
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 16px',
            cursor: 'pointer',
            color: selectedCategoryId === undefined ? 'white' : 'var(--color-text)',
            background: selectedCategoryId === undefined ? 'var(--color-primary)' : 'var(--color-surface)',
          }}
        >
          All
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            id={`tab-${category.id}`}
            type="button"
            role="tab"
            aria-selected={selectedCategoryId === category.id}
            onClick={() => selectCategory(category.id)}
            style={{
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 16px',
              cursor: 'pointer',
              color: selectedCategoryId === category.id ? 'white' : 'var(--color-text)',
              background: selectedCategoryId === category.id ? 'var(--color-primary)' : 'var(--color-surface)',
            }}
          >
            {category.name}
          </button>
        ))}
      </div>

      <div
        id="product-grid"
        role="tabpanel"
        aria-labelledby={selectedCategoryId ? `tab-${selectedCategoryId}` : undefined}
        style={{
          display: 'grid',
          gap: 16,
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        }}
      >
        {loadingCategories || loadingProducts ? (
          <p>Loading products...</p>
        ) : error ? (
          <p role="alert">{error}</p>
        ) : products.length === 0 ? (
          <p>No products are available for this selection.</p>
        ) : products.map((product) => (
          <Card key={product.id} title={product.name} onClick={() => setSelectedProduct(product)} style={{ cursor: 'pointer' }}>
            <img
              src={product.photoUrl ?? '/favicon.svg'}
              alt={product.name}
              style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 'var(--radius-md)', marginBottom: 12 }}
            />
            <p>{product.description}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <strong>{product.price.toFixed(2)} {currentRegion}</strong>
              {product.inStock && <span>In Stock</span>}
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
