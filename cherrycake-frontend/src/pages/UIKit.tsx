import { useState } from 'react';

import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import Toast from '../components/ui/Toast';
import Loader from '../components/ui/Loader';
import Checkbox from '../components/ui/Checkbox';
import Radio from '../components/ui/Radio';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';

import './UIKit.css';
import '../components/ui/ExtraComponents.css';

type ToastType = 'success' | 'error' | 'warning';

const regionOptions = [
  { value: 'tashkent', label: 'Tashkent' },
  { value: 'samarkand', label: 'Samarkand' },
  { value: 'bukhara', label: 'Bukhara' },
];

const cakeSizeOptions = [
  { value: 'small', label: 'Small cake' },
  { value: 'medium', label: 'Medium cake' },
  { value: 'large', label: 'Large cake' },
];

export default function UIKit() {
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [toastType, setToastType] = useState<ToastType>('success');
  const [name, setName] = useState('');
  const [region, setRegion] = useState('tashkent');
  const [extraCream, setExtraCream] = useState(false);
  const [cakeSize, setCakeSize] = useState('medium');
  const [extraCherries, setExtraCherries] = useState(false);

  function showNotification(message: string, type: ToastType) {
    setToast(message);
    setToastType(type);
  }

  return (
    <section className="cc-ui-kit">
      <h2>Cherry Cake — UI Kit</h2>

      <Card title="Buttons">
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Button onClick={() => showNotification('Button clicked!', 'success')}>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button disabled>Disabled</Button>
          <Button loading>Loading</Button>
        </div>
      </Card>

      <Card title="Inputs">
        <div style={{ display: 'grid', gap: 16 }}>
          <Input
            label="Your name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Enter your name"
          />
          <Input label="Email" error="Invalid email" placeholder="Enter email" />
          <Input label="Disabled input" disabled placeholder="Unavailable" />
        </div>
      </Card>

      <Card title="Select">
        <div style={{ display: 'grid', gap: 16 }}>
          <Select
            label="Choose your region"
            value={region}
            onChange={(event) => setRegion(event.target.value)}
            options={regionOptions}
          />
          <Select
            label="Select with error"
            options={regionOptions}
            error="Please select a valid region"
          />
          <Select label="Disabled select" options={regionOptions} disabled />
        </div>
      </Card>

      <Card title="Modal">
        <Button onClick={() => setModalOpen(true)}>Open Modal</Button>
        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Cherry Cake Modal">
          <p>This is a reusable modal component.</p>
        </Modal>
      </Card>

      <Card title="Toast">
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Button onClick={() => showNotification('Success notification!', 'success')}>
            Success Toast
          </Button>
          <Button onClick={() => showNotification('Error notification!', 'error')}>
            Error Toast
          </Button>
          <Button onClick={() => showNotification('Warning notification!', 'warning')}>
            Warning Toast
          </Button>
        </div>
      </Card>

      <Card title="Loader">
        <Loader />
      </Card>

      <Card title="Checkbox">
        <div style={{ display: 'grid', gap: 12 }}>
          <Checkbox
            label="Extra cream"
            checked={extraCream}
            onChange={(event) => setExtraCream(event.target.checked)}
          />
          <Checkbox
            label="Extra cherries"
            checked={extraCherries}
            onChange={(event) => setExtraCherries(event.target.checked)}
          />
          <Checkbox label="Unavailable option" disabled />
        </div>
      </Card>

      <Card title="Radio">
        <div style={{ display: 'grid', gap: 12 }}>
          {cakeSizeOptions.map((option) => (
            <Radio
              key={option.value}
              name="cake-size"
              label={option.label}
              value={option.value}
              checked={cakeSize === option.value}
              onChange={() => setCakeSize(option.value)}
            />
          ))}
        </div>
      </Card>

      <Card title="Badge">
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Badge variant="success">In stock</Badge>
          <Badge variant="warning">Low stock</Badge>
          <Badge variant="error">Out of stock</Badge>
          <Badge>New</Badge>
        </div>
      </Card>

      <Card title="Empty State">
        <EmptyState
          title="Your cart is empty"
          description="Explore our delicious cakes and add something sweet."
          action={
            <Button onClick={() => showNotification('Explore our menu!', 'success')}>
              Explore Menu
            </Button>
          }
        />
      </Card>

      <Card title="Error State">
        <ErrorState
          message="We couldn't load the products. Please try again."
          onRetry={() => showNotification('Retry requested!', 'warning')}
        />
      </Card>

      <Toast message={toast} type={toastType} onClose={() => setToast('')} />
    </section>
  );
}
