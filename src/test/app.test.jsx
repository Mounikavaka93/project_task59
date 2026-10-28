import { render, screen, fireEvent, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, expect, test } from "vitest";
import App from "../App";
import { getHotelById } from "../data/hotels";
import { DEMO_ACCOUNT, STORAGE_KEY } from "../utils/constants";
import { addDaysISO, todayISO } from "../utils/dates";
import { formatINR } from "../utils/format";
import { calculateQuote } from "../utils/pricing";

function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>
  );
}

function setDate(label, value) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

beforeEach(() => {
  localStorage.clear();
});

test("asks for dates before searching", async () => {
  const user = userEvent.setup();
  renderAt("/");
  await user.click(screen.getByRole("button", { name: /search stays/i }));
  expect(screen.getByText(/choose a check-in date/i)).toBeInTheDocument();
  expect(screen.getByText(/choose a check-out date/i)).toBeInTheDocument();
});

test("rejects a check-out before check-in and a past check-in", async () => {
  const user = userEvent.setup();
  renderAt("/");
  const today = todayISO();
  setDate("Check-in", addDaysISO(today, 10));
  setDate("Check-out", addDaysISO(today, 8));
  await user.click(screen.getByRole("button", { name: /search stays/i }));
  expect(screen.getByText(/after check-in/i)).toBeInTheDocument();

  setDate("Check-in", addDaysISO(today, -2));
  setDate("Check-out", addDaysISO(today, 3));
  await user.click(screen.getByRole("button", { name: /search stays/i }));
  expect(screen.getByText(/cannot be in the past/i)).toBeInTheDocument();
});

test("filters, sorts, and clears the hotel list", async () => {
  const user = userEvent.setup();
  const today = todayISO();
  renderAt(`/hotels?location=Goa&checkIn=${addDaysISO(today, 5)}&checkOut=${addDaysISO(today, 8)}&guests=2`);

  expect(screen.getByRole("heading", { name: /stays in goa/i })).toBeInTheDocument();
  let list = screen.getByRole("list", { name: "Hotel results" });
  expect(within(list).getByRole("link", { name: /casa mar/i })).toBeInTheDocument();
  expect(within(list).getByRole("link", { name: /salt house/i })).toBeInTheDocument();
  expect(within(list).queryByRole("link", { name: /harbour/i })).not.toBeInTheDocument();

  fireEvent.change(screen.getByLabelText(/minimum rating/i), { target: { value: "4.5" } });
  list = screen.getByRole("list", { name: "Hotel results" });
  expect(within(list).queryByRole("link", { name: /salt house/i })).not.toBeInTheDocument();
  expect(within(list).getByRole("link", { name: /casa mar/i })).toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: /clear filters/i }));
  expect(within(screen.getByRole("list", { name: "Hotel results" })).getByRole("link", { name: /salt house/i })).toBeInTheDocument();
});

test("sorts by price and hides stays above the nightly maximum", () => {
  const today = todayISO();
  renderAt(`/hotels?checkIn=${addDaysISO(today, 5)}&checkOut=${addDaysISO(today, 8)}&guests=2`);
  fireEvent.change(screen.getByLabelText(/maximum nightly rate/i), { target: { value: "6000" } });
  const priced = within(screen.getByRole("list", { name: "Hotel results" }));
  expect(priced.getByRole("link", { name: /salt house/i })).toBeInTheDocument();
  expect(priced.queryByRole("link", { name: /casa mar/i })).not.toBeInTheDocument();

  fireEvent.change(screen.getByLabelText(/sort by/i), { target: { value: "price-desc" } });
  fireEvent.change(screen.getByLabelText(/maximum nightly rate/i), { target: { value: "20000" } });
  const sorted = within(screen.getByRole("list", { name: "Hotel results" })).getAllByRole("link");
  expect(sorted[0]).toHaveTextContent(/lakeleaf/i);
});

test("updates the total when the room or room count changes", async () => {
  const user = userEvent.setup();
  const today = todayISO();
  const checkIn = addDaysISO(today, 9);
  const checkOut = addDaysISO(checkIn, 2);
  const hotel = getHotelById("casa-mare");
  const sea = hotel.rooms.find((room) => room.id === "sea-suite");
  renderAt(`/hotels/casa-mare?checkIn=${checkIn}&checkOut=${checkOut}&guests=2`);

  expect(screen.getByTestId("stay-total")).toHaveTextContent(
    formatINR(calculateQuote({ pricePerNight: hotel.rooms[0].price, nights: 2, rooms: 1 }).total)
  );
  await user.click(screen.getByRole("button", { name: /sea suite/i }));
  expect(screen.getByTestId("stay-total")).toHaveTextContent(
    formatINR(calculateQuote({ pricePerNight: sea.price, nights: 2, rooms: 1 }).total)
  );

  const secondPhoto = screen.getByRole("button", { name: "Show photo 2" });
  expect(secondPhoto).toHaveAttribute("aria-pressed", "false");
  await user.click(secondPhoto);
  expect(secondPhoto).toHaveAttribute("aria-pressed", "true");

  await user.click(screen.getByRole("button", { name: /continue to booking/i }));
  await user.click(screen.getByRole("button", { name: "Add a room" }));
  expect(screen.getByTestId("stay-total")).toHaveTextContent(
    formatINR(calculateQuote({ pricePerNight: sea.price, nights: 2, rooms: 2 }).total)
  );
});

test("requires enough rooms for the guest count", () => {
  const today = todayISO();
  const checkIn = addDaysISO(today, 4);
  const checkOut = addDaysISO(checkIn, 2);
  const room = getHotelById("casa-mare").rooms[0];
  renderAt(`/book/casa-mare?checkIn=${checkIn}&checkOut=${checkOut}&guests=5&room=${room.id}&rooms=1`);

  expect(screen.getByRole("group", { name: "Number of rooms" })).toHaveTextContent("3");
  expect(screen.getByRole("button", { name: "Remove a room" })).toBeDisabled();
  expect(screen.getByTestId("stay-total")).toHaveTextContent(
    formatINR(calculateQuote({ pricePerNight: room.price, nights: 2, rooms: 3 }).total)
  );
});

test("blocks an incomplete guest form", async () => {
  const user = userEvent.setup();
  const today = todayISO();
  const checkIn = addDaysISO(today, 3);
  renderAt(`/book/casa-mare?checkIn=${checkIn}&checkOut=${addDaysISO(checkIn, 2)}&guests=2&room=garden-deluxe&rooms=1`);
  await user.click(screen.getByRole("button", { name: /continue to payment/i }));
  expect(screen.getByText(/enter the guest's full name/i)).toBeInTheDocument();
  expect(screen.getByText(/valid email/i)).toBeInTheDocument();
  expect(screen.getByText(/10-digit/i)).toBeInTheDocument();
  expect(JSON.parse(localStorage.getItem(STORAGE_KEY))).toEqual([]);
});

test("books a stay, reloads it, and cancels it", async () => {
  const user = userEvent.setup();
  const today = todayISO();
  const checkIn = addDaysISO(today, 10);
  const checkOut = addDaysISO(today, 13);
  const room = getHotelById("casa-mare").rooms[0];
  const expected = calculateQuote({ pricePerNight: room.price, nights: 3, rooms: 1 });
  const view = renderAt("/");

  fireEvent.change(screen.getByLabelText(/destination/i), { target: { value: "Goa" } });
  setDate("Check-in", checkIn);
  setDate("Check-out", checkOut);
  fireEvent.change(screen.getByLabelText(/^guests$/i), { target: { value: "2" } });
  await user.click(screen.getByRole("button", { name: /search stays/i }));

  expect(await screen.findByRole("heading", { name: /stays in goa/i })).toBeInTheDocument();
  await user.click(screen.getByRole("link", { name: /casa mar/i }));
  expect(await screen.findByRole("heading", { name: /casa mar/i })).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: /continue to booking/i }));

  fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: "Asha Menon" } });
  fireEvent.change(screen.getByLabelText(/^email$/i), { target: { value: "asha@example.com" } });
  fireEvent.change(screen.getByLabelText(/mobile number/i), { target: { value: "9876543210" } });
  await user.click(screen.getByRole("button", { name: /continue to payment/i }));

  expect(await screen.findByRole("heading", { name: /sign in/i })).toBeInTheDocument();
  expect(screen.getByText(DEMO_ACCOUNT.email)).toBeInTheDocument();
  expect(screen.getByText(DEMO_ACCOUNT.password)).toBeInTheDocument();
  expect(JSON.parse(localStorage.getItem(STORAGE_KEY))).toEqual([]);
  await user.click(screen.getByRole("button", { name: /use demo account/i }));

  expect(await screen.findByRole("heading", { name: /^payment$/i })).toBeInTheDocument();
  expect(screen.getByText("4242 4242 4242 4242")).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: /use demo card/i }));
  await user.click(screen.getByRole("button", { name: /pay and confirm/i }));

  expect(await screen.findByRole("heading", { name: /booking is made/i })).toBeInTheDocument();
  expect(screen.getByTestId("stay-total")).toHaveTextContent(formatINR(expected.total));
  const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
  expect(stored).toHaveLength(1);
  expect(stored[0]).toMatchObject({
    hotelName: "Casa Maré",
    guestName: "Asha Menon",
    email: DEMO_ACCOUNT.email,
    phone: "9876543210",
    nights: 3,
    rooms: 1,
    total: expected.total,
    status: "confirmed",
    payment: { last4: "4242" },
  });

  view.unmount();
  renderAt("/bookings");
  const card = await screen.findByRole("article", { name: /casa mar/i });
  expect(within(card).getByText("Confirmed")).toBeInTheDocument();
  expect(within(card).getByText(/Asha Menon/)).toBeInTheDocument();
  expect(within(card).getByText(formatINR(expected.total))).toBeInTheDocument();

  await user.click(within(card).getByRole("button", { name: "Cancel booking" }));
  await user.click(screen.getByRole("button", { name: "Keep booking" }));
  expect(within(screen.getByRole("article", { name: /casa mar/i })).getByText("Confirmed")).toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "Cancel booking" }));
  await user.click(screen.getByRole("button", { name: "Yes, cancel stay" }));
  expect(within(screen.getByRole("article", { name: /casa mar/i })).getByText("Cancelled")).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Cancel booking" })).not.toBeInTheDocument();
  expect(JSON.parse(localStorage.getItem(STORAGE_KEY))[0].status).toBe("cancelled");

  await user.click(screen.getByRole("button", { name: "Confirmed" }));
  expect(screen.getByText(/no confirmed stays/i)).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Cancelled" }));
  expect(screen.getByRole("article", { name: /casa mar/i })).toBeInTheDocument();
});

test("starts with an empty bookings list", async () => {
  const user = userEvent.setup();
  renderAt("/bookings");
  expect(screen.getByText(/sign in to see your stays/i)).toBeInTheDocument();
  await user.click(screen.getAllByRole("link", { name: /^sign in$/i })[0]);
  await user.click(screen.getByRole("button", { name: /use demo account/i }));
  expect(await screen.findByText(/no bookings yet/i)).toBeInTheDocument();
});

test("creates an account and signs in", async () => {
  const user = userEvent.setup();
  renderAt("/create-account");
  fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: "Rhea Kapoor" } });
  fireEvent.change(screen.getByLabelText(/^email$/i), { target: { value: "rhea@example.com" } });
  fireEvent.change(screen.getByLabelText(/mobile number/i), { target: { value: "9123456780" } });
  fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: "Riverlane1" } });
  fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: "Riverlane1" } });
  await user.click(screen.getByRole("button", { name: /create account/i }));
  expect(await screen.findByRole("link", { name: /^rhea$/i })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: /my bookings/i })).toBeInTheDocument();
});

test("sends an unfinished booking back to the hotel", async () => {
  renderAt("/book/casa-mare");
  expect(await screen.findByRole("heading", { name: /casa mar/i })).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: /continue to payment/i })).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: /continue to booking/i })).toBeDisabled();
});

test("shows a not-found message for an unknown stay or page", () => {
  renderAt("/hotels/missing-hotel");
  expect(screen.getByRole("heading", { name: /couldn't find that stay/i })).toBeInTheDocument();
  renderAt("/no-such-page");
  expect(screen.getByRole("heading", { name: /not on the map/i })).toBeInTheDocument();
});
