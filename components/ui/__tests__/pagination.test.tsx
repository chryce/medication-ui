import { fireEvent, render, screen } from "@testing-library/react";
import { Pagination } from "@/components/ui/pagination";

describe("Pagination component", () => {
  it("renders pages with ellipsis", () => {
    render(<Pagination currentPage={5} totalPages={20} onPageChange={jest.fn()} />);
    expect(screen.getByRole("button", { name: "Previous page" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next page" })).toBeInTheDocument();
    expect(screen.getAllByText("...")).toHaveLength(2);
  });

  it("invokes onPageChange when page clicked", () => {
    const handleChange = jest.fn();
    render(<Pagination currentPage={2} totalPages={5} onPageChange={handleChange} />);
    fireEvent.click(screen.getByRole("button", { name: "3" }));
    expect(handleChange).toHaveBeenCalledWith(3);
  });
});
