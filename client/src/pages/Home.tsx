import Button from '../components/ui/Button';

export default function Home() {
  return (
    <section style={{ display: 'grid', gap: 16 }}>
      <p className="cc-eyebrow">Cherry Cake</p>
      <h2>Welcome to Cherry Cake</h2>
      <p>Explore our menu and find something sweet for every occasion.</p>
      <Button type="button">View Menu</Button>
    </section>
  );
}
