import { render, screen } from "@testing-library/react";
import Modal from ".";

describe("Modal component", () => {
  it("should render nothing if isOpen is false", () => {
    render(<Modal isOpen={false} onClose={vi.fn()} children={undefined} />);
    expect(screen.queryByText("Modal Content")).toBeNull();
  });

  it("should render the modal if isOpen is true", () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()}>
        <div>Modal Content</div>
      </Modal>
    );
    expect(screen.getByText("Modal Content")).toBeInTheDocument();
  });

  it("should render the children passed to it", () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()}>
        <div>Modal Content</div>
      </Modal>
    );
    expect(screen.getByText("Modal Content")).toBeInTheDocument();
  });
});
