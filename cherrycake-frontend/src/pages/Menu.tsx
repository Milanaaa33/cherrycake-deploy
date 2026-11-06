import Card from "../components/ui/Card";

const products = [
  {
    name: "Cherry Cheesecake",
    description: "Creamy cheesecake with a cherry topping.",
    price: "$8.00",
  },
  {
    name: "Chocolate Cake",
    description: "Rich chocolate cake with smooth frosting.",
    price: "$7.50",
  },
  {
    name: "Vanilla Cupcake",
    description: "Soft vanilla cupcake with buttercream.",
    price: "$3.00",
  },
  {
    name: "Fruit Tart",
    description: "A crisp tart filled with fresh seasonal fruit.",
    price: "$6.50",
  },
];

export default function Menu() {
  return (
    <section style={{ display: "grid", gap: 24 }}>
      <div>
        <p className="cc-eyebrow">Our selection</p>
        <h2>Menu</h2>
      </div>

      <div
        style={{
          display: "grid",
          gap: 16,
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        }}
      >
        {products.map((product) => (
          <Card key={product.name} title={product.name}>
            <p>{product.description}</p>
            <strong>{product.price}</strong>
          </Card>
        ))}
      </div>
    </section>
  );
}
