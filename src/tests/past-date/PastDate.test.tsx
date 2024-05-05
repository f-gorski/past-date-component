import { render, screen, act } from "@testing-library/react";
import PastDate from "../../lib/past-date/PastDate";

const TIMES = {
  seconds30ago: "2023-01-01T11:59:30.000+01:00",
  minutes15ago: "2023-01-01T11:45:00.000+01:00",
  hours2ago: "2023-01-01T10:00:00.000+01:00",
  hours1ago: "2023-01-01T11:00:00.000+01:00",
};

describe("PastDate", () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date("2023-01-01T12:00:00.000+01:00"));
  });

  it("renders 'N/A' when value is null", () => {
    render(<PastDate value={"foo"} />);
    expect(screen.getByText("N/A")).toBeInTheDocument();
  });

  it("renders the humanized duration when within an hour", () => {
    render(<PastDate value={TIMES.seconds30ago} />);
    expect(screen.getByText("30 sec ago")).toBeInTheDocument();

    render(<PastDate value={TIMES.minutes15ago} />);
    expect(screen.getByText("15 min ago")).toBeInTheDocument();
  });

  it("renders a static, formatted date when not within an hour", () => {
    render(<PastDate value={TIMES.hours2ago} />);
    expect(screen.getByText("1 Jan 2023 10:00")).toBeInTheDocument();
  });

  it("updates the displayed time every 15 seconds when within an hour", () => {
    render(<PastDate value={TIMES.seconds30ago} />);
    expect(screen.getByText("30 sec ago")).toBeInTheDocument();

    // Fast-forward by 15 seconds
    act(() => {
      jest.advanceTimersByTime(15_000);
    });

    expect(screen.getByText("45 sec ago")).toBeInTheDocument();
  });

  it("does not update the displayed time when not within an hour", () => {
    render(<PastDate value={TIMES.hours1ago} />);
    expect(screen.getByText("1 Jan 2023 11:00")).toBeInTheDocument();

    // Fast-forward by 15 seconds
    act(() => {
      jest.advanceTimersByTime(15_000);
    });

    expect(screen.getByText("1 Jan 2023 11:00")).toBeInTheDocument();
  });
});
