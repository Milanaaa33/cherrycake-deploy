import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';

import {
  adminApi,
  type AdminCategory,
  type AdminProduct,
  type AdminRegion,
  type ProductInput,
  type UserRole,
} from '../api/admin';
import { useAuthRole } from '../hooks/useAuthRole';
import { useTranslation } from '../i18n/useTranslation';
import type { TranslateFn } from '../i18n/useTranslation';
import { ROLES, type Role } from '../utils/auth';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Badge from '../components/ui/Badge';
import Loader from '../components/ui/Loader';
import ErrorState from '../components/ui/ErrorState';

import './Admin.css';

type Tab = 'catalog' | 'prices' | 'regions' | 'users';

type ApiError = { response?: { status?: number; data?: { message?: string } } };

function errorText(error: unknown, fallback: string): string {
  const message = (error as ApiError)?.response?.data?.message;
  return typeof message === 'string' && message ? message : fallback;
}

function formatMoney(value: number, currencyCode: string): string {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: currencyCode }).format(value);
  } catch {
    return `${value.toFixed(2)} ${currencyCode}`;
  }
}

function roleLabel(t: TranslateFn, role: Role): string {
  switch (role) {
    case 'ADMIN':
      return t('admin.roleAdmin', 'Admin');
    case 'STAFF':
      return t('admin.roleStaff', 'Staff');
    case 'VIEWER':
      return t('admin.roleViewer', 'Viewer');
    default:
      return t('admin.roleCustomer', 'Customer');
  }
}

/**
 * Admin panel: catalog, prices and availability per region, region rates and user roles.
 * VIEWER sees everything read-only, STAFF edits prices and stock, ADMIN edits everything.
 */
export default function Admin() {
  const { t } = useTranslation();
  const { role, email, canEditPrices, isAdmin } = useAuthRole();

  const [tab, setTab] = useState<Tab>('catalog');
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [regions, setRegions] = useState<AdminRegion[]>([]);
  const [users, setUsers] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [notice, setNotice] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError('');
    Promise.all([adminApi.categories(), adminApi.products(), adminApi.regions(), adminApi.users()])
      .then(([nextCategories, nextProducts, nextRegions, nextUsers]) => {
        if (!active) return;
        setCategories(nextCategories);
        setProducts(nextProducts);
        setRegions(nextRegions);
        setUsers(nextUsers);
      })
      .catch((error: ApiError) => {
        if (!active) return;
        const status = error.response?.status;
        setLoadError(
          status === 403
            ? t('admin.noAccess', 'Your account has no access to the admin panel.')
            : status === 401
              ? t('admin.sessionExpired', 'Your session has expired. Please sign in again.')
              : t('admin.loadError', 'Unable to load the admin data. Please try again.'),
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
    // The texts only change with the language; data is reloaded through reloadKey.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadKey]);

  const replaceProduct = (updated: AdminProduct) =>
    setProducts((current) => current.map((product) => (product.id === updated.id ? updated : product)));

  const flash = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 3500);
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'catalog', label: t('admin.tabCatalog', 'Catalog') },
    { key: 'prices', label: t('admin.tabPrices', 'Prices & availability') },
    { key: 'regions', label: t('admin.tabRegions', 'Regions & VAT') },
    { key: 'users', label: t('admin.tabUsers', 'Users & roles') },
  ];

  return (
    <div className="admin-page" data-testid="admin-page">
      <header className="admin-head">
        <div>
          <p className="admin-eyebrow">{t('admin.eyebrow', 'Cherry Cake · Administration')}</p>
          <h1>{t('admin.title', 'Admin panel')}</h1>
          <p className="admin-whoami">
            {t('admin.signedInAs', 'Signed in as {email}', { email: email ?? '' })} ·{' '}
            <Badge variant={isAdmin ? 'success' : canEditPrices ? 'warning' : 'neutral'}>{roleLabel(t, role)}</Badge>
          </p>
        </div>
        {!canEditPrices && (
          <p className="admin-readonly" role="status">
            {t('admin.readOnly', 'Read-only access: ask an administrator for the STAFF or ADMIN role to edit.')}
          </p>
        )}
      </header>

      <nav className="admin-tabs" aria-label={t('admin.tabsAria', 'Admin sections')}>
        {tabs.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`admin-tab${tab === item.key ? ' admin-tab--active' : ''}`}
            aria-current={tab === item.key ? 'page' : undefined}
            onClick={() => setTab(item.key)}
            data-testid={`admin-tab-${item.key}`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {notice && (
        <p className="admin-notice" role="status">
          {notice}
        </p>
      )}

      {loading ? (
        <Loader label={t('common.loading', 'Loading…')} />
      ) : loadError ? (
        <ErrorState
          title={t('ui.errorTitle', 'Something went wrong')}
          message={loadError}
          onRetry={reload}
          retryLabel={t('common.retry', 'Try again')}
        />
      ) : (
        <>
          {tab === 'catalog' && (
            <CatalogTab
              t={t}
              categories={categories}
              products={products}
              canEdit={isAdmin}
              onChanged={reload}
              onFlash={flash}
            />
          )}
          {tab === 'prices' && (
            <PricesTab
              t={t}
              products={products}
              regions={regions}
              canEdit={canEditPrices}
              onProduct={replaceProduct}
              onFlash={flash}
            />
          )}
          {tab === 'regions' && (
            <RegionsTab t={t} regions={regions} canEdit={isAdmin} onChanged={reload} onFlash={flash} />
          )}
          {tab === 'users' && (
            <UsersTab t={t} users={users} canEdit={isAdmin} selfEmail={email} onChanged={reload} onFlash={flash} />
          )}
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------------------------- catalog

type CatalogTabProps = {
  t: TranslateFn;
  categories: AdminCategory[];
  products: AdminProduct[];
  canEdit: boolean;
  onChanged: () => void;
  onFlash: (message: string) => void;
};

const emptyProduct = (categoryId: number): ProductInput => ({
  categoryId,
  name: '',
  description: '',
  photoUrl: '',
  price: 10,
});

function CatalogTab({ t, categories, products, canEdit, onChanged, onFlash }: CatalogTabProps) {
  const [categoryName, setCategoryName] = useState('');
  const [categoryOrder, setCategoryOrder] = useState(String(categories.length + 1));
  const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(null);
  const [productForm, setProductForm] = useState<ProductInput>(emptyProduct(categories[0]?.id ?? 0));
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const categoryOptions = categories.map((category) => ({ value: String(category.id), label: category.name }));

  const run = async (action: () => Promise<unknown>, success: string) => {
    setBusy(true);
    setError('');
    try {
      await action();
      onFlash(success);
      onChanged();
      return true;
    } catch (err) {
      setError(errorText(err, t('common.error', 'Something went wrong. Please try again.')));
      return false;
    } finally {
      setBusy(false);
    }
  };

  const submitCategory = async (event: FormEvent) => {
    event.preventDefault();
    const body = { name: categoryName.trim(), sortOrder: Number(categoryOrder) || 0 };
    if (!body.name) {
      setError(t('admin.errorCategoryName', 'Enter a category name.'));
      return;
    }
    const ok = await run(
      () => (editingCategory ? adminApi.updateCategory(editingCategory.id, body) : adminApi.createCategory(body)),
      t('admin.categorySaved', 'Category saved.'),
    );
    if (ok) {
      setCategoryName('');
      setEditingCategory(null);
    }
  };

  const submitProduct = async (event: FormEvent) => {
    event.preventDefault();
    const body: ProductInput = {
      ...productForm,
      name: productForm.name.trim(),
      description: productForm.description.trim(),
      photoUrl: productForm.photoUrl.trim(),
    };
    if (!body.name) {
      setError(t('admin.errorProductName', 'Enter a product name.'));
      return;
    }
    if (!body.categoryId) {
      setError(t('admin.errorProductCategory', 'Choose a category.'));
      return;
    }
    if (!editingProduct && (body.price === undefined || Number.isNaN(body.price) || body.price < 0)) {
      setError(t('admin.errorProductPrice', 'Enter a starting price of 0 or more.'));
      return;
    }
    const ok = await run(
      () => (editingProduct ? adminApi.updateProduct(editingProduct.id, body) : adminApi.createProduct(body)),
      t('admin.productSaved', 'Product saved.'),
    );
    if (ok) {
      setProductForm(emptyProduct(categories[0]?.id ?? 0));
      setEditingProduct(null);
    }
  };

  const startEditProduct = (product: AdminProduct) => {
    setEditingProduct(product);
    setProductForm({
      categoryId: product.categoryId,
      name: product.name,
      description: product.description ?? '',
      photoUrl: product.photoUrl ?? '',
    });
  };

  const removeProduct = async (product: AdminProduct) => {
    if (!window.confirm(t('admin.confirmDeleteProduct', 'Delete "{name}"? A product that was ever ordered is hidden instead of deleted.', { name: product.name }))) {
      return;
    }
    await run(
      async () => {
        const result = await adminApi.deleteProduct(product.id);
        if (!result.deleted) {
          onFlash(t('admin.productHidden', '"{name}" has orders, so it was hidden (out of stock everywhere) instead of deleted.', { name: product.name }));
        }
      },
      t('admin.productDeleted', 'Product removed.'),
    );
  };

  const removeCategory = async (category: AdminCategory) => {
    if (!window.confirm(t('admin.confirmDeleteCategory', 'Delete category "{name}"?', { name: category.name }))) return;
    await run(() => adminApi.deleteCategory(category.id), t('admin.categoryDeleted', 'Category removed.'));
  };

  return (
    <div className="admin-grid admin-grid--catalog">
      <section className="admin-card">
        <h2>{t('admin.categoriesTitle', 'Categories')}</h2>
        <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th scope="col">{t('admin.colName', 'Name')}</th>
              <th scope="col">{t('admin.colOrder', 'Order')}</th>
              <th scope="col">{t('admin.colProducts', 'Products')}</th>
              {canEdit && <th scope="col">{t('admin.colActions', 'Actions')}</th>}
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id}>
                <td>{category.name}</td>
                <td>{category.sortOrder}</td>
                <td>{category.productCount}</td>
                {canEdit && (
                  <td className="admin-actions">
                    <button
                      type="button"
                      className="admin-link"
                      onClick={() => {
                        setEditingCategory(category);
                        setCategoryName(category.name);
                        setCategoryOrder(String(category.sortOrder));
                      }}
                    >
                      {t('common.edit', 'Edit')}
                    </button>
                    <button
                      type="button"
                      className="admin-link admin-link--danger"
                      disabled={category.productCount > 0}
                      title={
                        category.productCount > 0
                          ? t('admin.categoryNotEmpty', 'Move or delete its products first')
                          : undefined
                      }
                      onClick={() => removeCategory(category)}
                    >
                      {t('common.delete', 'Delete')}
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        </div>

        {canEdit && (
          <form className="admin-form" onSubmit={submitCategory}>
            <h3>
              {editingCategory
                ? t('admin.editCategory', 'Edit category "{name}"', { name: editingCategory.name })
                : t('admin.newCategory', 'New category')}
            </h3>
            <Input
              id="admin-category-name"
              label={t('admin.colName', 'Name')}
              value={categoryName}
              onChange={(event) => setCategoryName(event.target.value)}
              maxLength={100}
              required
            />
            <Input
              id="admin-category-order"
              label={t('admin.colOrder', 'Order')}
              type="number"
              inputMode="numeric"
              value={categoryOrder}
              onChange={(event) => setCategoryOrder(event.target.value)}
            />
            <div className="admin-form-actions">
              <Button type="submit" loading={busy}>
                {t('common.save', 'Save')}
              </Button>
              {editingCategory && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setEditingCategory(null);
                    setCategoryName('');
                  }}
                >
                  {t('common.cancel', 'Cancel')}
                </Button>
              )}
            </div>
          </form>
        )}
      </section>

      <section className="admin-card">
        <h2>{t('admin.productsTitle', 'Products')}</h2>
        <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th scope="col">{t('admin.colProduct', 'Product')}</th>
              <th scope="col">{t('admin.colCategory', 'Category')}</th>
              <th scope="col">{t('admin.colAvailableIn', 'Available in')}</th>
              {canEdit && <th scope="col">{t('admin.colActions', 'Actions')}</th>}
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const available = product.prices.filter((price) => price.inStock).length;
              return (
                <tr key={product.id}>
                  <td>
                    <strong>{product.name}</strong>
                    {product.description && <div className="admin-muted">{product.description}</div>}
                  </td>
                  <td>{product.categoryName}</td>
                  <td>
                    {t('admin.availableCount', '{available} of {total} regions', {
                      available,
                      total: product.prices.length,
                    })}
                  </td>
                  {canEdit && (
                    <td className="admin-actions">
                      <button type="button" className="admin-link" onClick={() => startEditProduct(product)}>
                        {t('common.edit', 'Edit')}
                      </button>
                      <button
                        type="button"
                        className="admin-link admin-link--danger"
                        onClick={() => removeProduct(product)}
                      >
                        {t('common.delete', 'Delete')}
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>

        {canEdit && (
          <form className="admin-form" onSubmit={submitProduct}>
            <h3>
              {editingProduct
                ? t('admin.editProduct', 'Edit "{name}"', { name: editingProduct.name })
                : t('admin.newProduct', 'New product')}
            </h3>
            <Select
              id="admin-product-category"
              label={t('admin.colCategory', 'Category')}
              options={categoryOptions}
              value={String(productForm.categoryId)}
              onChange={(event) => setProductForm({ ...productForm, categoryId: Number(event.target.value) })}
            />
            <Input
              id="admin-product-name"
              label={t('admin.colName', 'Name')}
              value={productForm.name}
              onChange={(event) => setProductForm({ ...productForm, name: event.target.value })}
              maxLength={150}
              required
            />
            <Input
              id="admin-product-description"
              label={t('admin.colDescription', 'Description')}
              value={productForm.description}
              onChange={(event) => setProductForm({ ...productForm, description: event.target.value })}
              maxLength={1000}
            />
            <Input
              id="admin-product-photo"
              label={t('admin.colPhotoUrl', 'Photo URL')}
              value={productForm.photoUrl}
              onChange={(event) => setProductForm({ ...productForm, photoUrl: event.target.value })}
              maxLength={500}
              placeholder="/images/1.jpg"
            />
            {!editingProduct && (
              <Input
                id="admin-product-price"
                label={t('admin.startingPrice', 'Starting price (conventional units, used in every region)')}
                type="number"
                inputMode="decimal"
                min={0}
                step="0.01"
                value={productForm.price ?? ''}
                onChange={(event) => setProductForm({ ...productForm, price: Number(event.target.value) })}
              />
            )}
            <div className="admin-form-actions">
              <Button type="submit" loading={busy}>
                {t('common.save', 'Save')}
              </Button>
              {editingProduct && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setEditingProduct(null);
                    setProductForm(emptyProduct(categories[0]?.id ?? 0));
                  }}
                >
                  {t('common.cancel', 'Cancel')}
                </Button>
              )}
            </div>
          </form>
        )}
        {error && (
          <p className="admin-error" role="alert">
            {error}
          </p>
        )}
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------------------------- prices

type PricesTabProps = {
  t: TranslateFn;
  products: AdminProduct[];
  regions: AdminRegion[];
  canEdit: boolean;
  onProduct: (product: AdminProduct) => void;
  onFlash: (message: string) => void;
};

function PricesTab({ t, products, regions, canEdit, onProduct, onFlash }: PricesTabProps) {
  const [regionCode, setRegionCode] = useState(regions[0]?.code ?? '');
  const [drafts, setDrafts] = useState<Record<number, string>>({});
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState('');

  const region = useMemo(() => regions.find((item) => item.code === regionCode), [regions, regionCode]);

  const regionOptions = regions.map((item) => ({
    value: item.code,
    label: `${item.code} · ${item.name} (${item.currencyCode}, ${t('admin.vatShort', 'VAT')} ${Math.round(item.vatRate * 100)}%)`,
  }));

  const savePrice = async (product: AdminProduct, current: { price: number; inStock: boolean }) => {
    const draft = drafts[product.id];
    const price = draft === undefined ? current.price : Number(draft);
    if (Number.isNaN(price) || price < 0) {
      setError(t('admin.errorPrice', 'Enter a price of 0 or more.'));
      return;
    }
    setBusyId(product.id);
    setError('');
    try {
      onProduct(await adminApi.updatePrice(product.id, regionCode, { price, inStock: current.inStock }));
      setDrafts((all) => {
        const next = { ...all };
        delete next[product.id];
        return next;
      });
      onFlash(t('admin.priceSaved', 'Price of "{name}" in {region} saved.', { name: product.name, region: regionCode }));
    } catch (err) {
      setError(errorText(err, t('common.error', 'Something went wrong. Please try again.')));
    } finally {
      setBusyId(null);
    }
  };

  const toggleStock = async (product: AdminProduct, inStock: boolean) => {
    setBusyId(product.id);
    setError('');
    try {
      onProduct(await adminApi.updateAvailability(product.id, regionCode, inStock));
      onFlash(
        inStock
          ? t('admin.markedInStock', '"{name}" is now in stock in {region}.', { name: product.name, region: regionCode })
          : t('admin.markedOutOfStock', '"{name}" is now out of stock in {region}.', { name: product.name, region: regionCode }),
      );
    } catch (err) {
      setError(errorText(err, t('common.error', 'Something went wrong. Please try again.')));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section className="admin-card">
      <div className="admin-card-head">
        <h2>{t('admin.pricesTitle', 'Prices and availability by region')}</h2>
        <div className="admin-region-select">
          <Select
            id="admin-price-region"
            label={t('admin.region', 'Region')}
            options={regionOptions}
            value={regionCode}
            onChange={(event) => {
              setRegionCode(event.target.value);
              setDrafts({});
            }}
          />
        </div>
      </div>
      <p className="admin-muted">
        {t(
          'admin.pricesHint',
          'Prices are stored in conventional units (CU) and converted with the region exchange rate; the customer sees the local price.',
        )}
      </p>
      {error && (
        <p className="admin-error" role="alert">
          {error}
        </p>
      )}
      <div className="admin-table-wrap">
        <table className="admin-table" data-testid="admin-prices-table">
          <thead>
            <tr>
              <th scope="col">{t('admin.colProduct', 'Product')}</th>
              <th scope="col">{t('admin.colPriceCu', 'Price (CU)')}</th>
              <th scope="col">{t('admin.colLocalPrice', 'Customer price')}</th>
              <th scope="col">{t('admin.colInStock', 'In stock')}</th>
              {canEdit && <th scope="col">{t('admin.colActions', 'Actions')}</th>}
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const current = product.prices.find((price) => price.regionCode === regionCode);
              if (!current) {
                return (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td colSpan={canEdit ? 4 : 3} className="admin-muted">
                      {t('admin.noPriceInRegion', 'Not sold in this region')}
                    </td>
                  </tr>
                );
              }
              const draft = drafts[product.id];
              const busy = busyId === product.id;
              return (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td>
                    {canEdit ? (
                      <input
                        className="admin-price-input"
                        type="number"
                        inputMode="decimal"
                        min={0}
                        step="0.01"
                        aria-label={t('admin.priceInputAria', 'Price of {name} in conventional units', { name: product.name })}
                        value={draft ?? String(current.price)}
                        onChange={(event) => setDrafts({ ...drafts, [product.id]: event.target.value })}
                        disabled={busy}
                      />
                    ) : (
                      current.price.toFixed(2)
                    )}
                  </td>
                  <td>{region ? formatMoney(current.localPrice, region.currencyCode) : current.localPrice.toFixed(2)}</td>
                  <td>
                    {canEdit ? (
                      <label className="admin-switch">
                        <input
                          type="checkbox"
                          checked={current.inStock}
                          disabled={busy}
                          onChange={(event) => toggleStock(product, event.target.checked)}
                          aria-label={t('admin.stockToggleAria', '{name} in stock in {region}', { name: product.name, region: regionCode })}
                        />
                        <span>{current.inStock ? t('admin.inStock', 'Yes') : t('admin.outOfStock', 'No')}</span>
                      </label>
                    ) : (
                      <Badge variant={current.inStock ? 'success' : 'error'}>
                        {current.inStock ? t('admin.inStock', 'Yes') : t('admin.outOfStock', 'No')}
                      </Badge>
                    )}
                  </td>
                  {canEdit && (
                    <td className="admin-actions">
                      <Button
                        type="button"
                        variant="secondary"
                        loading={busy}
                        disabled={draft === undefined || draft === String(current.price)}
                        onClick={() => savePrice(product, current)}
                      >
                        {t('common.save', 'Save')}
                      </Button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------------------------- regions

type RegionsTabProps = {
  t: TranslateFn;
  regions: AdminRegion[];
  canEdit: boolean;
  onChanged: () => void;
  onFlash: (message: string) => void;
};

function RegionsTab({ t, regions, canEdit, onChanged, onFlash }: RegionsTabProps) {
  const [editing, setEditing] = useState<AdminRegion | null>(null);
  const [vatPercent, setVatPercent] = useState('');
  const [exchangeRate, setExchangeRate] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const startEdit = (region: AdminRegion) => {
    setEditing(region);
    setVatPercent(String(Math.round(region.vatRate * 10000) / 100));
    setExchangeRate(String(region.exchangeRate));
    setError('');
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!editing) return;
    const vat = Number(vatPercent);
    const rate = Number(exchangeRate);
    if (Number.isNaN(vat) || vat < 0 || vat >= 100) {
      setError(t('admin.errorVat', 'VAT must be between 0 and 99.99 percent.'));
      return;
    }
    if (Number.isNaN(rate) || rate <= 0) {
      setError(t('admin.errorExchangeRate', 'The exchange rate must be greater than 0.'));
      return;
    }
    setBusy(true);
    setError('');
    try {
      await adminApi.updateRegion(editing.code, {
        vatRate: Math.round(vat * 100) / 10000,
        exchangeRate: Math.round(rate * 10000) / 10000,
      });
      onFlash(t('admin.regionSaved', 'Region {code} saved.', { code: editing.code }));
      setEditing(null);
      onChanged();
    } catch (err) {
      setError(errorText(err, t('common.error', 'Something went wrong. Please try again.')));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="admin-card">
      <h2>{t('admin.regionsTitle', 'Regions, VAT and exchange rates')}</h2>
      <p className="admin-muted">
        {t('admin.regionsHint', 'The exchange rate says how much local currency one conventional unit (CU) is worth. Changes apply to the menu and the cart immediately; placed orders keep their totals.')}
      </p>
      <div className="admin-table-wrap">
        <table className="admin-table" data-testid="admin-regions-table">
          <thead>
            <tr>
              <th scope="col">{t('admin.colCode', 'Code')}</th>
              <th scope="col">{t('admin.colCountry', 'Country')}</th>
              <th scope="col">{t('admin.colCurrency', 'Currency')}</th>
              <th scope="col">{t('admin.colVat', 'VAT')}</th>
              <th scope="col">{t('admin.colExchangeRate', 'Rate per CU')}</th>
              {canEdit && <th scope="col">{t('admin.colActions', 'Actions')}</th>}
            </tr>
          </thead>
          <tbody>
            {regions.map((region) => (
              <tr key={region.code}>
                <td>
                  <strong>{region.code}</strong>
                </td>
                <td>{region.name}</td>
                <td>
                  {region.currencyCode} ({region.currencySymbol})
                </td>
                <td>{(region.vatRate * 100).toFixed(2)}%</td>
                <td>{region.exchangeRate}</td>
                {canEdit && (
                  <td className="admin-actions">
                    <button type="button" className="admin-link" onClick={() => startEdit(region)}>
                      {t('common.edit', 'Edit')}
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {canEdit && editing && (
        <form className="admin-form" onSubmit={submit}>
          <h3>{t('admin.editRegion', 'Edit {name} ({code})', { name: editing.name, code: editing.code })}</h3>
          <Input
            id="admin-region-vat"
            label={t('admin.vatPercent', 'VAT, %')}
            type="number"
            inputMode="decimal"
            min={0}
            max={99.99}
            step="0.01"
            value={vatPercent}
            onChange={(event) => setVatPercent(event.target.value)}
          />
          <Input
            id="admin-region-rate"
            label={t('admin.exchangeRate', 'Local currency per CU')}
            type="number"
            inputMode="decimal"
            min={0.0001}
            step="0.0001"
            value={exchangeRate}
            onChange={(event) => setExchangeRate(event.target.value)}
          />
          {error && (
            <p className="admin-error" role="alert">
              {error}
            </p>
          )}
          <div className="admin-form-actions">
            <Button type="submit" loading={busy}>
              {t('common.save', 'Save')}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setEditing(null)}>
              {t('common.cancel', 'Cancel')}
            </Button>
          </div>
        </form>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------------------------- users

type UsersTabProps = {
  t: TranslateFn;
  users: UserRole[];
  canEdit: boolean;
  selfEmail: string | null;
  onChanged: () => void;
  onFlash: (message: string) => void;
};

function UsersTab({ t, users, canEdit, selfEmail, onChanged, onFlash }: UsersTabProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('STAFF');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const grantable = ROLES.filter((item) => item !== 'CUSTOMER');

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const value = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setError(t('admin.errorEmail', 'Enter a valid email address.'));
      return;
    }
    setBusy(true);
    setError('');
    try {
      await adminApi.setUserRole(value, role);
      onFlash(t('admin.roleSaved', '{email} is now {role}.', { email: value, role: roleLabel(t, role) }));
      setEmail('');
      onChanged();
    } catch (err) {
      setError(errorText(err, t('common.error', 'Something went wrong. Please try again.')));
    } finally {
      setBusy(false);
    }
  };

  const revoke = async (user: UserRole) => {
    if (!window.confirm(t('admin.confirmRevoke', 'Remove the role of {email}? They become a regular customer.', { email: user.email }))) {
      return;
    }
    setBusy(true);
    setError('');
    try {
      await adminApi.deleteUserRole(user.email);
      onFlash(t('admin.roleRevoked', 'Role of {email} removed.', { email: user.email }));
      onChanged();
    } catch (err) {
      setError(errorText(err, t('common.error', 'Something went wrong. Please try again.')));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="admin-card">
      <h2>{t('admin.usersTitle', 'Users and roles')}</h2>
      <p className="admin-muted">
        {t('admin.usersHint', 'Anyone signs in with an email code. ADMIN manages everything, STAFF changes prices and stock, VIEWER only reads. Emails without a role are regular customers. Bootstrap administrators come from the ADMIN_EMAILS setting of the server.')}
      </p>
      <div className="admin-table-wrap">
        <table className="admin-table" data-testid="admin-users-table">
          <thead>
            <tr>
              <th scope="col">{t('admin.colEmail', 'Email')}</th>
              <th scope="col">{t('admin.colRole', 'Role')}</th>
              <th scope="col">{t('admin.colGrantedBy', 'Granted by')}</th>
              {canEdit && <th scope="col">{t('admin.colActions', 'Actions')}</th>}
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && (
              <tr>
                <td colSpan={canEdit ? 4 : 3} className="admin-muted">
                  {t('admin.noUsers', 'No roles assigned yet.')}
                </td>
              </tr>
            )}
            {users.map((user) => (
              <tr key={user.email}>
                <td>
                  {user.email}
                  {user.email === selfEmail && <span className="admin-muted"> · {t('admin.you', 'you')}</span>}
                </td>
                <td>
                  <Badge variant={user.role === 'ADMIN' ? 'success' : user.role === 'STAFF' ? 'warning' : 'neutral'}>
                    {roleLabel(t, user.role)}
                  </Badge>
                  {user.bootstrap && <span className="admin-muted"> · {t('admin.bootstrap', 'from ADMIN_EMAILS')}</span>}
                </td>
                <td className="admin-muted">{user.grantedBy ?? '—'}</td>
                {canEdit && (
                  <td className="admin-actions">
                    <button
                      type="button"
                      className="admin-link admin-link--danger"
                      disabled={busy || user.bootstrap || user.email === selfEmail}
                      onClick={() => revoke(user)}
                    >
                      {t('admin.revoke', 'Remove role')}
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {canEdit && (
        <form className="admin-form" onSubmit={submit}>
          <h3>{t('admin.grantRole', 'Grant a role')}</h3>
          <Input
            id="admin-user-email"
            label={t('admin.colEmail', 'Email')}
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="staff@example.com"
            required
          />
          <Select
            id="admin-user-role"
            label={t('admin.colRole', 'Role')}
            options={grantable.map((item) => ({ value: item, label: roleLabel(t, item) }))}
            value={role}
            onChange={(event) => setRole(event.target.value as Role)}
          />
          {error && (
            <p className="admin-error" role="alert">
              {error}
            </p>
          )}
          <div className="admin-form-actions">
            <Button type="submit" loading={busy}>
              {t('common.save', 'Save')}
            </Button>
          </div>
        </form>
      )}
    </section>
  );
}
