import Button from "../components/ui/Button";

const selectedItems = [
  { name: "Cherry Cheesecake", quantity: 1, price: "$8.00" },
  { name: "Vanilla Cupcake", quantity: 2, price: "$6.00" },
];

export default function Cart() {
  return (
    <section style={{ display: "grid", gap: 20 }}>
      <h2>Your Cart</h2>

      <ul style={{ display: "grid", gap: 12, padding: 0, listStyle: "none" }}>
        {selectedItems.map((item) => (
          <li
            key={item.name}
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 16,
              padding: 16,
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
            }}
          >
            <span>
              {item.name} &times; {item.quantity}
            </span>
            <strong>{item.price}</strong>
          </li>
        ))}
      </ul>

      <Button type="button">Proceed to Checkout</Button>
    </section>
  );
}
