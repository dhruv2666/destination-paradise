# Remix of Destination Paradise

Add these features to the admin dashboard:

1. MANUAL DOCUMENT GENERATION

- On every booking (any status) add a "Generate document" button.

- Also add a "New booking" button so the owner can create a booking himself (for clients who book by phone or in person) with the same fields as /book, and mark it approved directly.

- The document is a PDF containing: company logo and details, invoice/contract number, client details, car, pickup and return date and time, number of days, price per day, total, deposit if any, and the full Terms and Conditions from Settings.

- Regenerate the PDF whenever the booking is edited, keeping the same document number.

2. SEND ON WHATSAPP

- Add a "Send on WhatsApp" button that opens https://wa.me/<client phone number without + or spaces>?text=<encoded message> with a pre-written message such as: "Hello [name], your booking for [car] from [date] to [date] is confirmed. Total: [amount]. Your invoice and terms & conditions: [PDF link]"

- On mobile, also use the Web Share API (navigator.share) so the owner can share the PDF file itself to WhatsApp when the device supports it.

- Add a "Download PDF" button as a fallback.

- Make the message template editable in Settings, with placeholders like {name}, {car}, {from}, {to}, {total}, {link}.

3. TERMS AND CONDITIONS EDITOR

- In Settings, a rich text editor for the T&C, with a default template covering: driver age and licence requirements, fuel policy, mileage limit, deposit, insurance and damage, late return fees, cancellation policy, and fines.

- The T&C version used is saved with each booking so older documents don't change when the T&C is edited.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://httpsparadise-booking-papertrail.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/27a0dca2-535a-4ff6-88d8-577d9039cf3d).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
