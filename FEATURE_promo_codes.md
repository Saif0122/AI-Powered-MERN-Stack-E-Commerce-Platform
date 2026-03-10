# FEATURE: Promo Codes (Hardened)

The promotional engine has been updated to align the frontend administration panel with the backend Mongoose schema. This fix resolves the 500 error during coupon creation.

## 🛠️ How to Create Promos

1. Log in as an **Admin**.
2. Navigate to the **Admin Dashboard**.
3. Go to **Coupon Management** (PROMOTIONAL_ENGINE_LOCK).
4. Click **NEW_PROMO_CODE**.
5. Fill in the fields:
   - **Code**: Must be unique (e.g., `SAVE20`).
   - **Type**: 
     - `Percentage`: Discount is a % of cart total (max 90%).
     - `Fixed`: Discount is a flat dollar amount.
   - **Value**: Positive number (magnitude of discount).
   - **Expiry**: (Optional) Date after which the coupon is invalid.
   - **Usage Limit**: Number of times the coupon can be used globally (default 100).

## 📋 Field Explanation

| Field | Description | Rules |
|---|---|---|
| `code` | Unique uppercase string | Required, must be unique. |
| `type` | `percentage` or `fixed` | Required. |
| `value` | Discount magnitude | Must be `> 0`, if percentage must be `<= 90`. |
| `expiresAt` | Expiration date | Optional. |
| `usageLimit`| Usage quota | Required (backend defaults to 100 if omitted). |

## 🧪 How to Test

1. Create a coupon `DISCOUNT10` with Type: `Percentage` and Value: `10`.
2. Add items to your cart as a regular user.
3. In the Checkout page, enter `DISCOUNT10` in the promo code field.
4. Verify that the total is reduced by 10%.
5. Verify you cannot create `DISCOUNT10` again (duplicate check).
6. Verify you cannot create a coupon with value `0` or negative.

## ⚙️ Backend Hardening

- **Validation**: Added manual checks in controller before hitting the DB.
- **Duplicate Handling**: Express now catches MongoDB error code `11000` and returns a friendly message.
- **Model Fix**: `expiresAt` is now optional, and percentage validation is strictly `0-90%`.
