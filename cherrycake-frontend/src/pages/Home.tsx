import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";

export default function Home() {
  const navigate = useNavigate();

  return (
    <section style={{ display: "grid", gap: 16 }}>
      <p className="cc-eyebrow">Cherry Cake</p>
      <h2>Welcome to Cherry Cake</h2>
      <p>Explore our menu and find something sweet for every occasion.</p>

      <Button type="button" onClick={() => navigate("/menu")}>
        View Menu
      </Button>
    </section>
  );
}
