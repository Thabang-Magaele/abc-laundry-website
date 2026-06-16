# ABC Laundry & Dry Cleaners — Website

A responsive marketing + booking website for **A B C Laundry & Dry Cleaners**
(Mpumalanga, South Africa).

## Files

| File           | Purpose                                                            |
|----------------|-------------------------------------------------------------------|
| `index.html`   | Landing page: hero, services, pricing, how-it-works, about, reviews, contact + map |
| `booking.html` | Booking page with live price estimate and form validation         |
| `style.css`    | All styling (responsive, mobile-first breakpoints)                |
| `main.js`      | Mobile nav, footer year, booking estimate + validation            |

## Running locally

It's plain static HTML/CSS/JS — just open `index.html` in a browser, or serve it:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Business details (live in the site)

- **Address:** Parkville Centre, Cnr Danie Joubert & Impala St, White River, 1240
- **Phone / WhatsApp:** 083 278 9040
- **Hours:** Mon–Fri 7:30–17:00 · Sat 7:30–13:00 · Sun closed
- **Map:** points to the real coordinates (-25.3244914, 31.0057344)

## How bookings work

The booking form does **not** post to a server. On submit it validates the
fields, then opens **WhatsApp** (`https://wa.me/27832789040`) pre-filled with a
receipt-style message listing the customer, collection details, itemised
services, and estimated total. The customer just presses send.

To change the WhatsApp number, edit `WHATSAPP_NUMBER` in `main.js`
(international format, no `+` or spaces — e.g. `27832789040`).

## ⚠️ Still to confirm

- **Prices** are estimates. Update them in `index.html` (pricing cards) and in
  `booking.html` (`data-price` attributes on each service). Keep them in sync.
