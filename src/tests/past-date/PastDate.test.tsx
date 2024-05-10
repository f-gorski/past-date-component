import { render, screen, act } from "@testing-library/react";
import PastDate from "../../lib/past-date/PastDate";

const TIMES = {
  seconds30ago: "2023-01-01T11:59:30.000+01:00",
  minutes15ago: "2023-01-01T11:45:00.000+01:00",
  hours2ago: "2023-01-01T10:00:00.000+01:00",
  hours1ago: "2023-01-01T11:00:00.000+01:00",
  hoursMoreThan24ago: "2023-01-02T11:00:00.000+01:00",
};

const updateIntervalInSeconds = 20;
const updateIntervalInMiliseconds = updateIntervalInSeconds * 1000;

describe("PastDate", () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date("2023-01-01T12:00:00.000+01:00"));
  });

  afterAll(() => {
    jest.useRealTimers();
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

  it("renders a static, formatted date when not within 24 hours", () => {
    render(<PastDate value={TIMES.hoursMoreThan24ago} />);
    expect(screen.getByText("2 Jan 2023 11:00")).toBeInTheDocument();
  });

  it("updates the displayed time every N seconds when within an hour", () => {
    render(<PastDate value={TIMES.seconds30ago} updateInterval={updateIntervalInMiliseconds} />);
    expect(screen.getByText("30 sec ago")).toBeInTheDocument();

    // Fast-forward by N seconds
    act(() => {
      jest.advanceTimersByTime(updateIntervalInMiliseconds);
    });

    expect(screen.getByText(`${30 + updateIntervalInSeconds} sec ago`)).toBeInTheDocument();
  });

  it("does not update the displayed time when not within 24 hours", () => {
    render(<PastDate value={TIMES.hoursMoreThan24ago} />);
    expect(screen.getByText("2 Jan 2023 11:00")).toBeInTheDocument();

    // Fast-forward by 1 hour
    act(() => {
      jest.advanceTimersByTime(60_000 * 60);
    });

    expect(screen.getByText("2 Jan 2023 11:00")).toBeInTheDocument();
    expect(jest.getTimerCount()).toEqual(0);
  });

  it("leaves no running timers when component unmounts", () => {
    const { unmount: componentUnmount } = render(<PastDate value={TIMES.seconds30ago} />);

    componentUnmount();
    expect(jest.getTimerCount()).toEqual(0);
  });
});
