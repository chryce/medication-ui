import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ColumnConfigurator } from "@/components/medication/column-configurator";

const baseProps = {
  isOpen: true,
  onClose: jest.fn(),
  activeColumns: ["contact"] as const,
  hiddenColumns: ["patientTags"] as const,
  onToggleColumn: jest.fn(),
  onReset: jest.fn(),
  saveForTeam: true,
  onToggleSave: jest.fn(),
};

describe("ColumnConfigurator", () => {
  it("renders visible and hidden columns", () => {
    render(<ColumnConfigurator {...baseProps} />);
    expect(screen.getByText("Available columns")).toBeInTheDocument();
    expect(screen.getByText("Patient tags")).toBeInTheDocument();
    expect(screen.getByText("Patient contact")).toBeInTheDocument();
  });

  it("handles interactions", async () => {
    const user = userEvent.setup();
    const onToggle = jest.fn();
    const onReset = jest.fn();
    render(
      <ColumnConfigurator
        {...baseProps}
        onToggleColumn={onToggle}
        onReset={onReset}
        saveForTeam={false}
      />,
    );
    await user.click(screen.getByText("Patient tags"));
    expect(onToggle).toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Reset to defaults" }));
    expect(onReset).toHaveBeenCalled();
  });
});
