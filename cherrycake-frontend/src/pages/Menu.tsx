import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { api } from '../api/client';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Checkbox from '../components/ui/Checkbox';
import Modal from '../components/ui/Modal';
import Radio from '../components/ui/Radio';
import { getProductImage } from '../constants/productImages';
import { addToCart } from '../store';
import type { AppDispatch, RootState } from '../store';

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

type Modifier = {
  id: number;
  name: string;
  priceDelta: number;
};

type ModifierGroup = {
  id: number;
  name: string;
  type: 'SINGLE' | 'MULTI';
  isRequired: boolean;
  modifiers: Modifier[];
};

type ProductDetails = Product & {
  modifierGroups: ModifierGroup[];
};

function ProductModal({
  product,
  open,
  currentRegion,
  onAdd,
  onClose,
}: {
  product: Product | null;
  open: boolean;
  currentRegion: string;
  onAdd: (item: {
    productId: number;
    name: string;
    quantity: number;
    modifierIds: number[];
    photoUrl: string | null;
  }) => void;
  onClose: () => void;
}) {
  const currency = useSelector(
    (state: RootState) => state.region.currencyCode
  );
  const symbol = useSelector(
    (state: RootState) => state.region.currencySymbol
  );

  const [quantity, setQuantity] = useState(1);
  const [details, setDetails] = useState<ProductDetails | null>(null);
  const [selectedModifiers, setSelectedModifiers] = useState<Record<number, number[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!product || !open) return;

    let active = true;
    setLoading(true);
    setError('');
    setDetails(null);
    setQuantity(1);
    setSelectedModifiers({});

    api
      .get<ProductDetails>(`/products/${product.id}`, {
        params: { region: currentRegion },
      })
      .then(({ data }) => {
        if (active) setDetails(data);
      })
      .catch(() => {
        if (active) setError('Unable to load product options. Please try again.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [currentRegion, open, product]);

  if (!product) return null;

  const productDetails = details ?? product;
  const requiredGroupsComplete =
    details?.modifierGroups
      .filter((group) => group.isRequired)
      .every((group) => (selectedModifiers[group.id]?.length ?? 0) > 0) ?? false;

  function updateModifierSelection(group: ModifierGroup, modifierId: number, checked: boolean) {
    setSelectedModifiers((current) => {
      const currentSelection = current[group.id] ?? [];
      const nextSelection =
        group.type === 'SINGLE'
          ? [modifierId]
          : checked
            ? [...currentSelection, modifierId]
            : currentSelection.filter((id) => id !== modifierId);

      return { ...current, [group.id]: nextSelection };
    });
  }

  return (
    <Modal open={open} title={product.name} onClose={onClose}>
      <div style={{ display: 'grid', gap: 20 }}>
        <img
          src={getProductImage(productDetails.name)}
          alt={productDetails.name}
          style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 'var(--radius-md)' }}
        />
        <p>{productDetails.description}</p>

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

        {loading && <p>Loading product options...</p>}
        {error && <p role="alert">{error}</p>}
        {details?.modifierGroups.map((group) => (
          <fieldset key={group.id} style={{ display: 'grid', gap: 8, border: 0, padding: 0 }}>
            <legend style={{ fontWeight: 700 }}>
              {group.name}
              {group.isRequired ? ' (Required)' : ' (Optional)'}
            </legend>
            {group.modifiers.map((modifier) => {
              const checked = selectedModifiers[group.id]?.includes(modifier.id) ?? false;
              const label = `${modifier.name}${
                modifier.priceDelta > 0
                  ? ` (+${symbol} ${modifier.priceDelta.toLocaleString('en-US', {
                      maximumFractionDigits: 2,
                    })} ${currency})`
                  : ''
              }`;

              return group.type === 'SINGLE' ? (
                <Radio
                  key={modifier.id}
                  name={`modifier-group-${group.id}`}
                  value={String(modifier.id)}
                  label={label}
                  checked={checked}
                  onChange={() => updateModifierSelection(group, modifier.id, true)}
                />
              ) : (
                <Checkbox
                  key={modifier.id}
                  label={label}
                  checked={checked}
                  onChange={(event) =>
                    updateModifierSelection(group, modifier.id, event.target.checked)
                  }
                />
              );
            })}
          </fieldset>
        ))}

        <Button
          type="button"
          disabled={loading || Boolean(error) || !requiredGroupsComplete}
          onClick={() => {
            onAdd({
              productId: productDetails.id,
              name: productDetails.name,
              quantity,
              modifierIds: Object.values(selectedModifiers).flat(),
              photoUrl: getProductImage(productDetails.name),
            });
            onClose();
          }}
        >
          Add to Cart
        </Button>
      </div>
    </Modal>
  );
}

export default function Menu() {
  const dispatch = useDispatch<AppDispatch>();
  const currentRegion = useSelector((state: RootState) => state.region.code);
  const currency = useSelector((state: RootState) => state.region.currencyCode);
  const symbol = useSelector((state: RootState) => state.region.currencySymbol);
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
              src={getProductImage(product.name)}
              alt={product.name}
              style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 'var(--radius-md)', marginBottom: 12 }}
            />
            <p>{product.description}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <strong>
                {symbol} {product.price.toLocaleString('en-US', {
                  maximumFractionDigits: 2,
                })} {currency}
              </strong>
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
        currentRegion={currentRegion}
        onAdd={(item) => dispatch(addToCart(item))}
        onClose={() => setSelectedProduct(null)}
      />
    </section>
  );
}
