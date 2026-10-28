import { mkdir } from "node:fs/promises";
import puppeteer from "puppeteer-core";

function isoDaysFromToday(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

const baseUrl = process.env.APP_URL || "http://127.0.0.1:4173";
const chromePath = "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe";
const checkIn = isoDaysFromToday(12);
const checkOut = isoDaysFromToday(15);
const oneRoomTotal = "56448";
const twoRoomTotal = "112896";

const browser = await puppeteer.launch({
  executablePath: chromePath,
  headless: true,
  args: ["--disable-gpu", "--no-first-run"],
});

const page = await browser.newPage();
const pageErrors = [];
page.on("pageerror", (error) => pageErrors.push(String(error)));

async function shot(name) {
  await page.screenshot({ path: `test-results/${name}.png`, fullPage: true });
}

async function setValue(selector, value) {
  await page.$eval(
    selector,
    (element, next) => {
      const prototype = Object.getPrototypeOf(element);
      const descriptor = Object.getOwnPropertyDescriptor(prototype, "value");
      const tracker = element._valueTracker;
      if (tracker) tracker.setValue("");
      descriptor.set.call(element, next);
      element.dispatchEvent(new Event("input", { bubbles: true }));
      element.dispatchEvent(new Event("change", { bubbles: true }));
    },
    value
  );
}

async function clickText(text) {
  const clicked = await page.evaluate((label) => {
    const nodes = [...document.querySelectorAll("button, a")];
    const node = nodes.find((item) => item.textContent.replace(/\s+/g, " ").includes(label));
    if (!node) return false;
    node.click();
    return true;
  }, text);
  if (!clicked) throw new Error(`Could not click "${text}"`);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

try {
  await mkdir("test-results", { recursive: true });
  await page.setViewport({ width: 1280, height: 900 });
  await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("h1");
  await shot("01-home-desktop");
  assert(!(await overflows()), "Home page overflows horizontally on desktop");

  await setValue("#stay-location", "Goa");
  await setValue("#stay-check-in", checkIn);
  await setValue("#stay-check-out", checkOut);
  await setValue("#stay-guests", "2");
  await clickText("Search stays");
  await page.waitForFunction(() => document.querySelector("h1")?.textContent.includes("Stays in Goa"));
  await shot("02-listing");
  assert(await bodyHas("Salt House"), "Salt House should be listed in Goa");
  assert(!(await overflows()), "Listing overflows horizontally");

  await page.evaluate(() => {
    const label = [...document.querySelectorAll("label")].find((item) => item.textContent.includes("Minimum rating"));
    const select = label.querySelector("select");
    const descriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(select), "value");
    descriptor.set.call(select, "4.5");
    select.dispatchEvent(new Event("change", { bubbles: true }));
  });
  await page.waitForFunction(() => !document.body.textContent.includes("Salt House"));
  assert(await bodyHas("Casa"), "Casa Maré should remain after the rating filter");

  await clickText("Clear filters");
  await page.waitForFunction(() => document.body.textContent.includes("Salt House"));
  await clickText("Casa Mar");
  await page.waitForFunction(() => document.querySelector("h1")?.textContent.includes("Casa"));
  await shot("03-details");

  await clickText("Sea Suite");
  await page.waitForFunction(
    (digits) => (document.querySelector("[data-testid='stay-total']")?.textContent || "").replace(/\D/g, "") === digits,
    {},
    oneRoomTotal
  );
  await clickText("Continue to booking");
  await page.waitForFunction(() => document.querySelector("h1")?.textContent.includes("Guest details"));
  await shot("04-booking");
  await page.click("[aria-label='Add a room']");
  await page.waitForFunction(
    (digits) => (document.querySelector("[data-testid='stay-total']")?.textContent || "").replace(/\D/g, "") === digits,
    {},
    twoRoomTotal
  );

  await setValue("#name", "Asha Menon");
  await setValue("#email", "asha@example.com");
  await setValue("#phone", "9876543210");
  await clickText("Continue to payment");
  await page.waitForFunction(() => document.querySelector("h1")?.textContent.includes("Sign in"));
  assert(await bodyHas("asha@marrowlane.demo"), "Demo sign-in email should be visible");
  assert(await bodyHas("Marrowlane1"), "Demo sign-in password should be visible");
  await clickText("Use demo account");
  await page.waitForFunction(() => document.querySelector("h1")?.textContent.includes("Payment"));
  await clickText("Use demo card");
  await clickText("Pay and confirm");
  await page.waitForFunction(() => document.querySelector("h1")?.textContent.includes("Booking is made"));
  await shot("05-success");

  await clickText("View my bookings");
  await page.waitForFunction(() => document.querySelector("h1")?.textContent.includes("My bookings"));
  assert(await bodyHas("Asha Menon"), "Saved booking should show the guest");
  assert(await bodyHas("Casa"), "Saved booking should show the hotel");
  await shot("06-bookings");
  await clickText("Cancel booking");
  await page.waitForSelector("[role='dialog']");
  await clickText("Yes, cancel stay");
  await page.waitForFunction(() => !document.body.innerText.includes("Cancel booking"));
  assert(await bodyHas("Cancelled"), "Cancelled status should be visible");
  await shot("07-cancelled");

  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
  await shot("08-home-mobile");
  assert(!(await overflows()), "Home page overflows horizontally on a phone");
  await page.goto(`${baseUrl}/hotels?location=Goa&checkIn=${checkIn}&checkOut=${checkOut}&guests=2`, {
    waitUntil: "domcontentloaded",
  });
  await shot("09-listing-mobile");
  assert(!(await overflows()), "Listing overflows horizontally on a phone");

  assert(pageErrors.length === 0, `Page errors:\n${pageErrors.join("\n")}`);
  console.log("Browser checks passed.");
} finally {
  await browser.close();
}

async function bodyHas(text) {
  return page.evaluate((value) => document.body.innerText.includes(value), text);
}

async function overflows() {
  return page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
}
