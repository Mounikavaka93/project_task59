function luhn(digits) {
  let sum = 0;
  let alt = false;
  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let digit = Number(digits[index]);
    if (alt) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    alt = !alt;
  }
  return sum % 10 === 0;
}

export function cardDigits(value) {
  return String(value || "").replace(/\D/g, "").slice(0, 16);
}

export function formatCardNumber(value) {
  return cardDigits(value).replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}

export function formatExpiry(value) {
  const digits = String(value || "").replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function validatePayment({ name, number, expiry, cvv }, today = new Date()) {
  const errors = {};
  if (!name || name.trim().length < 2) errors.cardName = "Enter the name on the card.";

  const digits = cardDigits(number);
  if (digits.length !== 16 || !luhn(digits)) {
    errors.number = "Enter a valid 16-digit card. The demo card is 4242 4242 4242 4242.";
  }

  if (!/^\d{2}\/\d{2}$/.test(expiry)) errors.expiry = "Use MM/YY.";
  else {
    const month = Number(expiry.slice(0, 2));
    const year = 2000 + Number(expiry.slice(3));
    if (month < 1 || month > 12) errors.expiry = "Enter a valid month.";
    else {
      const expires = new Date(year, month, 0, 23, 59, 59);
      if (expires < today) errors.expiry = "This card has expired.";
    }
  }

  if (!/^\d{3}$/.test(String(cvv || ""))) errors.cvv = "Enter the 3-digit CVV.";
  return errors;
}
