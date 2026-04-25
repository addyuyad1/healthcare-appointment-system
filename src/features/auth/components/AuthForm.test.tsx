import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { AuthForm } from "./AuthForm";

describe("AuthForm", () => {
  it("shows validation errors for an invalid doctor signup", async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();

    render(
      <MemoryRouter>
        <AuthForm error={null} isLoading={false} mode="signup" onSubmit={onSubmit} />
      </MemoryRouter>,
    );

    await user.clear(screen.getByLabelText("Full name"));
    await user.type(screen.getByLabelText("Full name"), "A");
    await user.selectOptions(screen.getByLabelText("Account role"), "doctor");
    await user.clear(screen.getByLabelText("Email address"));
    await user.type(screen.getByLabelText("Email address"), "invalid-email");
    await user.clear(screen.getByLabelText("Password"));
    await user.type(screen.getByLabelText("Password"), "123");
    await user.selectOptions(screen.getByLabelText("Specialization"), "");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(await screen.findByText("Please enter your full name.")).toBeInTheDocument();
    expect(screen.getByText("Enter a valid email address.")).toBeInTheDocument();
    expect(screen.getByText("Password should be at least 6 characters.")).toBeInTheDocument();
    expect(screen.getByText("Please choose a specialization.")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
