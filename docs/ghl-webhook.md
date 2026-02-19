# GHL (GoHighLevel) webhook

When a booking is created, the app sends a **single flat JSON** object to the GHL webhook (no wrapper keys).

## Setup

1. Set the webhook URL in your environment:
   ```bash
   GHL_WEBHOOK_URL=https://services.leadconnectorhq.com/hooks/uEiPrLD68HrLx2bQjrqH/webhook-trigger/f444d7e7-6e80-4e87-9fbd-4998e5efaf16
   ```
2. Restart the app. New bookings will POST this payload to the URL (fire-and-forget; response is still 201).

## Payload

- **Method:** POST  
- **Header:** `Content-Type: application/json`  
- **Body:** One flat object (see `docs/booking-confirmation-data.json` or `docs/sample_booking.json`).

Required in payload: `bookingId`, `visibleId`, `fullName`, `phone` or `email`, `startDate`, `endDate` (ISO 8601), `totalPrice`, `status`.  
If `deliveryRequired` is true, `deliveryAddress` must be present.

## Quick test (from repo root)

Replace `YOUR_GHL_WEBHOOK_URL` with the actual URL, then:

```bash
curl -X POST "YOUR_GHL_WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '@docs/sample_booking.json'
```

Expected from GHL: **200 OK** with body e.g. `{ "status": "ok" }`.
