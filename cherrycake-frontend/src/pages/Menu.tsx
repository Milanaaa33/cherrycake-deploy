import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';

import { api } from '../api/client';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Checkbox from '../components/ui/Checkbox';
import Modal from '../components/ui/Modal';
import Radio from '../components/ui/Radio';
import { getProductImage } from '../constants/productImages';
import {
  translateModifierGroupName,
  translateModifierName,
  translateProductDescription,
  translateProductName,
} from '../i18n/catalog';
import { useTranslation } from '../i18n/useTranslation';
import type { TranslateFn } from '../i18n/useTranslation';
import { addToCart, showToast } from '../store';
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

// Errors are stored as codes and turned into text at render time, so the message follows the current language.
type LoadError = '' | 'options' | 'categories' | 'products';

function loadErrorText(t: TranslateFn, error: LoadError): string {
  switch (error) {
    case 'options':
      return t('menu.loadOptionsError', 'Unable to load product options. Please try again.');
    case 'categories':
      return t('menu.loadCategoriesError', 'Unable to load categories. Please try again.');
    case 'products':
      return t('menu.loadProductsError', 'Unable to load products. Please try again.');
    default:
      return '';
  }
}

function translateCategoryName(t: TranslateFn, name: string): string {
  switch (name.trim().toLowerCase()) {
    case 'cakes':
      return t('catalog.cat.cakes', name);
    case 'desserts':
      return t('catalog.cat.desserts', name);
    case 'drinks':
      return t('catalog.cat.drinks', name);
    default:
      return name;
  }
}

const imageBoxStyle: CSSProperties = {
  width: '100%',
  aspectRatio: '4 / 3',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'var(--color-surface-soft)',
  borderRadius: 'var(--radius-md)',
  overflow: 'hidden',
  marginBottom: 14,
  border: '1px solid var(--cherry-border)',
};

const imageStyle: CSSProperties = {
  maxWidth: '100%',
  maxHeight: '100%',
  width: '100%',
  height: '100%',
  objectFit: 'cover',
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
    unitPrice: number;
    imageUrl: string;
  }) => void;
  onClose: () => void;
}) {
  const currency = useSelector((state: RootState) => state.region.currencyCode);
  const symbol = useSelector((state: RootState) => state.region.currencySymbol);
  const { t } = useTranslation();

  const [quantity, setQuantity] = useState(1);
  const [selectedModifiers, setSelectedModifiers] = useState<Record<number, number[]>>({});
  const [retryKey, setRetryKey] = useState(0);
  const requestKey = product && open ? `${product.id}:${currentRegion}:${retryKey}` : '';
  const [detailsResult, setDetailsResult] = useState<{
    key: string;
    data: ProductDetails | null;
    error: LoadError;
  } | null>(null);

  useEffect(() => {
    if (!product || !open) return;

    const controller = new AbortController();

    api
      .get<ProductDetails>(`/products/${product.id}`, {
        params: { region: currentRegion },
        signal: controller.signal,
        silent: true,
      })
      .then(({ data }) => {
        if (!controller.signal.aborted) {
          setDetailsResult({ key: requestKey, data, error: '' });
        }
      })
      .catch((err) => {
        if (!controller.signal.aborted && !axios.isCancel(err)) {
          setDetailsResult({ key: requestKey, data: null, error: 'options' });
        }
      });

    return () => {
      controller.abort();
    };
  }, [currentRegion, open, product, requestKey]);

  if (!product) return null;

  const activeResult = detailsResult?.key === requestKey ? detailsResult : null;
  const details = activeResult?.data ?? null;
  const loading = Boolean(requestKey) && activeResult === null;
  const error = activeResult?.error ?? '';

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
          ? checked
            ? [modifierId]
            : currentSelection.filter((id) => id !== modifierId)
          : checked
            ? [...currentSelection, modifierId]
            : currentSelection.filter((id) => id !== modifierId);

      return { ...current, [group.id]: nextSelection };
    });
  }

  const productImage = getProductImage(productDetails.name);
  const displayTitle = translateProductName(t, product.name);
  const displayDetailName = translateProductName(t, productDetails.name);
  const displayDescription = translateProductDescription(
    t,
    productDetails.name,
    productDetails.description,
  );

  return (
    <Modal open={open} title={displayTitle} onClose={onClose} closeLabel={t('common.close', 'Close')}>
      <div style={{ display: 'grid', gap: 18 }}>
        <div style={imageBoxStyle}>
          <img
            src={productImage}
            alt={displayDetailName}
            style={imageStyle}
          />
        </div>
        <p style={{ margin: 0, color: 'var(--text-dim)', lineHeight: 1.6 }}>
          {displayDescription}
        </p>

        <div style={{ display: 'grid', gap: 10 }}>
          <strong>{t('menu.quantity', 'Quantity')}</strong>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Button
              type="button"
              variant="secondary"
              aria-label={t('menu.decreaseQuantity', 'Decrease quantity')}
              onClick={() => setQuantity((value) => Math.max(1, value - 1))}
            >
              -
            </Button>
            <span aria-live="polite" style={{ minWidth: 24, textAlign: 'center', fontWeight: 700 }}>
              {quantity}
            </span>
            <Button
              type="button"
              variant="secondary"
              aria-label={t('menu.increaseQuantity', 'Increase quantity')}
              onClick={() => setQuantity((value) => value + 1)}
            >
              +
            </Button>
          </div>
        </div>

        {loading && (
          <p style={{ margin: 0, color: 'var(--text-dim)', fontSize: '0.92rem' }}>
            {t('menu.loadingOptions', 'Loading product options...')}
          </p>
        )}
        {error && (
          <div
            role="alert"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              flexWrap: 'wrap',
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-surface-soft)',
              border: '1px solid var(--cherry-border)',
              color: 'var(--raspberry-coulis)',
              fontSize: '0.92rem',
              fontWeight: 500,
            }}
          >
            <span>{loadErrorText(t, error)}</span>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setRetryKey((value) => value + 1)}
            >
              {t('common.retry', 'Try again')}
            </Button>
          </div>
        )}
        {details?.modifierGroups.map((group) => (
          <fieldset key={group.id} style={{ display: 'grid', gap: 8, border: 0, padding: 0 }}>
            <legend style={{ fontWeight: 700, marginBottom: 4 }}>
              {group.isRequired
                ? t('menu.groupRequired', '{name} (Required)', {
                    name: translateModifierGroupName(t, group.name),
                  })
                : t('menu.groupOptional', '{name} (Optional)', {
                    name: translateModifierGroupName(t, group.name),
                  })}
            </legend>
            {group.modifiers.map((modifier) => {
              const checked = selectedModifiers[group.id]?.includes(modifier.id) ?? false;
              const translatedModifierName = translateModifierName(t, modifier.name);
              const label =
                modifier.priceDelta > 0
                  ? t('menu.modifierWithPrice', '{name} (+{symbol} {price} {currency})', {
                      name: translatedModifierName,
                      symbol,
                      price: modifier.priceDelta.toLocaleString('en-US', {
                        maximumFractionDigits: 2,
                      }),
                      currency,
                    })
                  : translatedModifierName;

              return group.type === 'SINGLE' ? (
                <Radio
                  key={modifier.id}
                  name={`modifier-group-${group.id}`}
                  value={String(modifier.id)}
                  label={label}
                  checked={checked}
                  onChange={() => updateModifierSelection(group, modifier.id, true)}
                  onClick={
                    !group.isRequired
                      ? () => {
                          if (checked) {
                            updateModifierSelection(group, modifier.id, false);
                          }
                        }
                      : undefined
                  }
                  onKeyDown={
                    !group.isRequired
                      ? (event) => {
                          if (
                            checked &&
                            (event.key === ' ' || event.key === 'Backspace' || event.key === 'Delete')
                          ) {
                            event.preventDefault();
                            updateModifierSelection(group, modifier.id, false);
                          }
                        }
                      : undefined
                  }
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
              photoUrl: productImage,
              unitPrice: productDetails.price,
              imageUrl: productImage,
            });
            onClose();
          }}
        >
          {t('menu.addToCart', 'Add to Cart')}
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
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  const selectedCategoryId = categoryParam ? Number(categoryParam) : undefined;
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [categoriesResult, setCategoriesResult] = useState<{
    loaded: boolean;
    data: Category[];
    error: LoadError;
  }>({ loaded: false, data: [], error: '' });
  const productsKey = `${currentRegion}:${selectedCategoryId ?? 'all'}`;
  const [productsResult, setProductsResult] = useState<{
    key: string;
    data: Product[];
    error: LoadError;
  } | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    api
      .get<Category[]>('/categories', { signal: controller.signal })
      .then(({ data }) => {
        if (!controller.signal.aborted) {
          setCategoriesResult({ loaded: true, data, error: '' });
        }
      })
      .catch((err) => {
        if (!controller.signal.aborted && !axios.isCancel(err)) {
          setCategoriesResult({ loaded: true, data: [], error: 'categories' });
        }
      });

    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const params: { region: string; categoryId?: number } = { region: currentRegion };
    if (selectedCategoryId !== undefined && Number.isInteger(selectedCategoryId)) {
      params.categoryId = selectedCategoryId;
    }

    api
      .get<Product[]>('/products', { params, signal: controller.signal })
      .then(({ data }) => {
        if (!controller.signal.aborted) {
          setProductsResult({ key: productsKey, data, error: '' });
        }
      })
      .catch((err) => {
        if (!controller.signal.aborted && !axios.isCancel(err)) {
          setProductsResult({ key: productsKey, data: [], error: 'products' });
        }
      });

    return () => {
      controller.abort();
    };
  }, [currentRegion, selectedCategoryId, productsKey]);

  const activeProductsResult = productsResult?.key === productsKey ? productsResult : null;
  const categories = categoriesResult.data;
  const products = activeProductsResult?.data ?? [];
  const loadingCategories = !categoriesResult.loaded;
  const loadingProducts = activeProductsResult === null;
  const error = categoriesResult.error || activeProductsResult?.error || '';

  function selectCategory(categoryId?: number) {
    if (categoryId === undefined) {
      setSearchParams({});
      return;
    }

    setSearchParams({ category: String(categoryId) });
  }

  return (
    <section className="menu-page" style={{ display: 'grid', gap: 28, padding: '8px 0 32px' }}>
      <div>
        <p
          className="cc-eyebrow"
          style={{
            color: 'var(--sakura-pink)',
            textTransform: 'uppercase',
            letterSpacing: '0.18em',
            fontSize: '0.8rem',
            fontWeight: 700,
            margin: '0 0 6px 0',
          }}
        >
          {t('menu.eyebrow', 'Our selection')}
        </p>
        <h2
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(2rem, 4vw, 2.6rem)',
            color: 'var(--cheesecake-cream)',
            margin: 0,
          }}
        >
          {t('menu.title', 'Artisan Menu')}
        </h2>
      </div>

      <div
        role="tablist"
        aria-label={t('menu.categoriesAria', 'Product categories')}
        style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}
      >
        <button
          type="button"
          role="tab"
          aria-selected={selectedCategoryId === undefined}
          className="cc-menu-tab"
          onClick={() => selectCategory()}
          style={{
            border:
              selectedCategoryId === undefined
                ? '1.5px solid var(--raspberry-bright)'
                : '1.5px solid var(--cherry-border)',
            borderRadius: '9999px',
            padding: '10px 20px',
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: '0.9rem',
            color: selectedCategoryId === undefined ? '#ffffff' : 'var(--text-main)',
            background:
              selectedCategoryId === undefined
                ? 'linear-gradient(135deg, var(--raspberry-coulis), var(--raspberry-bright))'
                : 'var(--cherry-card)',
            boxShadow:
              selectedCategoryId === undefined ? '0 4px 16px rgba(230, 57, 96, 0.35)' : 'none',
            transition: 'all 0.2s ease',
          }}
        >
          {t('menu.allCategories', 'All')}
        </button>
        {categories.map((category) => {
          const active = selectedCategoryId === category.id;
          return (
            <button
              key={category.id}
              id={`tab-${category.id}`}
              type="button"
              role="tab"
              aria-selected={active}
              className="cc-menu-tab"
              onClick={() => selectCategory(category.id)}
              style={{
                border: active
                  ? '1.5px solid var(--raspberry-bright)'
                  : '1.5px solid var(--cherry-border)',
                borderRadius: '9999px',
                padding: '10px 20px',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '0.9rem',
                color: active ? '#ffffff' : 'var(--text-main)',
                background: active
                  ? 'linear-gradient(135deg, var(--raspberry-coulis), var(--raspberry-bright))'
                  : 'var(--cherry-card)',
                boxShadow: active ? '0 4px 16px rgba(230, 57, 96, 0.35)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              {translateCategoryName(t, category.name)}
            </button>
          );
        })}
      </div>

      <div
        id="product-grid"
        role="tabpanel"
        aria-labelledby={selectedCategoryId ? `tab-${selectedCategoryId}` : undefined}
        style={{
          display: 'grid',
          gap: 20,
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        }}
      >
        {loadingCategories || loadingProducts ? (
          <p>{t('menu.loadingProducts', 'Loading products...')}</p>
        ) : error ? (
          <p role="alert">{loadErrorText(t, error)}</p>
        ) : products.length === 0 ? (
          <p>{t('menu.noProducts', 'No products are available for this selection.')}</p>
        ) : (
          products.map((product, index) => {
            const displayProductName = translateProductName(t, product.name);
            const displayProductDesc = translateProductDescription(
              t,
              product.name,
              product.description,
            );

            return (
              <Card
                key={product.id}
                title={displayProductName}
                className="cc-menu-card"
                onClick={() => setSelectedProduct(product)}
                style={{
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderRadius: '20px',
                  '--stagger-index': Math.min(index, 8),
                } as CSSProperties & Record<string, string | number>}
              >
                <div>
                  <div style={imageBoxStyle}>
                    <img
                      src={getProductImage(product.name)}
                      alt={displayProductName}
                      className="cc-menu-card-img"
                      style={imageStyle}
                    />
                  </div>
                  <p style={{ color: 'var(--text-dim)', fontSize: '0.92rem', lineHeight: 1.55, margin: '0 0 16px 0' }}>
                    {displayProductDesc}
                  </p>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 12,
                    flexWrap: 'wrap',
                    paddingTop: 12,
                    borderTop: '1px solid var(--cherry-border)',
                  }}
                >
                  <div style={{ display: 'grid', gap: 2 }}>
                    <strong style={{ whiteSpace: 'nowrap', color: 'var(--crust-gold)', fontSize: '1.05rem' }}>
                      {symbol}{' '}
                      {product.price.toLocaleString('en-US', {
                        maximumFractionDigits: 2,
                      })}{' '}
                      {currency}
                    </strong>
                    {product.inStock && (
                      <span style={{ whiteSpace: 'nowrap', fontSize: '0.78rem', color: 'var(--mint-fresh)', fontWeight: 700 }}>
                        {t('menu.inStock', 'In Stock')}
                      </span>
                    )}
                  </div>
                  <Button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setSelectedProduct(product);
                    }}
                  >
                    {t('menu.addToCart', 'Add to Cart')}
                  </Button>
                </div>
              </Card>
            );
          })
        )}
      </div>

      <ProductModal
        key={selectedProduct ? `${selectedProduct.id}-${currentRegion}` : 'closed'}
        product={selectedProduct}
        open={selectedProduct !== null}
        currentRegion={currentRegion}
        onAdd={(item) => {
          dispatch(addToCart(item));
          dispatch(
            showToast({
              type: 'success',
              message: t('menu.addedToBag', '{name} added to your bag!', {
                name: translateProductName(t, item.name),
              }),
            }),
          );
        }}
        onClose={() => setSelectedProduct(null)}
      />
    </section>
  );
}
