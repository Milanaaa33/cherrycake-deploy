import { useState } from "react";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Card from "../components/ui/Card";
import Modal from "../components/ui/Modal";
import Toast from "../components/ui/Toast";
import Loader from "../components/ui/Loader";
import "./UIKit.css";

type ToastType = "success" | "error" | "warning";

const regionOptions = [
  { value: "tashkent", label: "Tashkent" },
  { value: "samarkand", label: "Samarkand" },
  { value: "bukhara", label: "Bukhara" },
];

export default function UIKit() {
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [toastType, setToastType] = useState<ToastType>("success");
  const [name, setName] = useState("");
  const [region, setRegion] = useState("tashkent");

  function showNotification(message: string, type: ToastType) {
    setToast(message);
    setToastType(type);
  }

  return (
    <section className="cc-ui-kit">
      <h2>Cherry Cake — UI Kit</h2>

      <Card title="Buttons">
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Button
            onClick={() => showNotification("Button clicked!", "success")}
          >
            Primary
          </Button>
          <Button variant="secondary">Secondary</Button>
          <Button disabled>Disabled</Button>
          <Button loading>Loading</Button>
        </div>
      </Card>

      <Card title="Inputs">
        <div style={{ display: "grid", gap: 16 }}>
          <Input
            label="Your name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Enter your name"
          />
          <Input
            label="Email"
            error="Invalid email"
            placeholder="Enter email"
          />
          <Input label="Disabled input" disabled placeholder="Unavailable" />
        </div>
      </Card>

      <Card title="Select">
        <div style={{ display: "grid", gap: 16 }}>
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
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Cherry Cake Modal"
        >
          <p>This is a reusable modal component.</p>
        </Modal>
      </Card>

      <Card title="Toast">
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Button
            onClick={() => showNotification("Success notification!", "success")}
          >
            Success Toast
          </Button>
          <Button
            onClick={() => showNotification("Error notification!", "error")}
          >
            Error Toast
          </Button>
          <Button
            onClick={() => showNotification("Warning notification!", "warning")}
          >
            Warning Toast
          </Button>
        </div>
      </Card>

      <Card title="Loader">
        <Loader />
      </Card>

      <Toast message={toast} type={toastType} onClose={() => setToast("")} />
    </section>
  );
}
