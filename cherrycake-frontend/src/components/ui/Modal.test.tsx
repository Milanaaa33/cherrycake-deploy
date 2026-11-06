import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { afterEach } from "vitest";
import Modal from "./Modal";

<<<<<<< HEAD
describe('Modal component', () => {
  afterEach(() => {
    cleanup();
  });
  it('does not render when closed', () => {
=======
afterEach(() => {
  cleanup();
});

describe("Modal component", () => {
  it("does not render when closed", () => {
>>>>>>> e7cd84a (CC-15: Add page skeletons and update App router)
    render(
      <Modal open={false} title="Test Modal" onClose={() => {}}>
        <p>Modal content</p>
      </Modal>,
    );

    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("renders title and content when open", () => {
    render(
      <Modal open={true} title="Cherry Cake Modal" onClose={() => {}}>
        <p>Welcome to Cherry Cake</p>
      </Modal>,
    );

    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.getByText("Cherry Cake Modal")).toBeTruthy();
    expect(screen.getByText("Welcome to Cherry Cake")).toBeTruthy();
  });

  it("calls onClose when Close button is clicked", () => {
    const handleClose = vi.fn();

    render(
      <Modal open={true} title="Test Modal" onClose={handleClose}>
        <p>Content</p>
      </Modal>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Close" }));

    expect(handleClose).toHaveBeenCalledOnce();
  });

  it("calls onClose when Escape is pressed", () => {
    const handleClose = vi.fn();

    render(
      <Modal open={true} title="Test Modal" onClose={handleClose}>
        <p>Content</p>
      </Modal>,
    );

    fireEvent.keyDown(document, { key: "Escape" });

    expect(handleClose).toHaveBeenCalledOnce();
  });
});
