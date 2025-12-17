# Amount Calculation Test - Cash Service With/Without Coupon

## Test Scenario 1: Cash Service WITHOUT Coupon

### Frontend Calculation:
```
withOutTaxRupee = 100.50
tax = 10%
finalTaxRupee = (100.50 * 10) / 100 = 10.05
withTaxAmount = 10.05 + 100.50 = 110.55
totalPrice = 110.55 (no discount)
```

### Backend Calculation:
```
req.body.withoutTax = 100.50
taxAmount = (100.50 * 10) / 100 = 10.05
withTaxAmount = (10.05 + 100.50).toFixed(2) = "110.55"
totalAmount = "110.55" (no coupon)
totalAmountString = parseFloat("110.55").toFixed(2) = "110.55"
bookingAmountString = parseFloat(110.55).toFixed(2) = "110.55"
✅ MATCH: "110.55" === "110.55"
```

## Test Scenario 2: Cash Service WITH Coupon (Type 1 - Fixed Discount)

### Frontend Calculation:
```
withOutTaxRupee = 100.50
tax = 10%
finalTaxRupee = (100.50 * 10) / 100 = 10.05
withTaxAmount = 10.05 + 100.50 = 110.55
couponDiscountAmount = 10.00 (from validateCoupon API)
totalPrice = 110.55 - 10.00 = 100.55
```

### Backend Calculation:
```
req.body.withoutTax = 100.50
taxAmount = (100.50 * 10) / 100 = 10.05
withTaxAmount = (10.05 + 100.50).toFixed(2) = "110.55"
discountAmount = coupon.maxDiscount = 10.00
totalAmount = "110.55" - 10.00 = 100.55 (string - number = number)
totalAmountString = parseFloat(100.55).toFixed(2) = "100.55"
bookingAmountString = parseFloat(100.55).toFixed(2) = "100.55"
✅ MATCH: "100.55" === "100.55"
```

## Test Scenario 3: Cash Service WITH Coupon (Type 2 - Percentage Discount) ⚠️ PROBLEM!

### Frontend Calculation:
```
withOutTaxRupee = 100.50
tax = 10%
finalTaxRupee = (100.50 * 10) / 100 = 10.05
withTaxAmount = 10.05 + 100.50 = 110.55
validateCoupon API: discount = (100.50 * 10) / 100 = 10.05
couponDiscountAmount = 10.05
totalPrice = 110.55 - 10.05 = 100.50
```

### Backend Calculation:
```
req.body.withoutTax = 100.50
taxAmount = (100.50 * 10) / 100 = 10.05
withTaxAmount = (10.05 + 100.50).toFixed(2) = "110.55"
discount = (parseInt(100.50) * 10) / 100 = (100 * 10) / 100 = 10.00 ⚠️
formatedDiscount = parseFloat(10.00.toFixed(2)) = 10.00
discountAmount = 10.00
totalAmount = "110.55" - 10.00 = 100.55
totalAmountString = parseFloat(100.55).toFixed(2) = "100.55"
bookingAmountString = parseFloat(100.50).toFixed(2) = "100.50"
❌ MISMATCH: "100.55" !== "100.50"
```

## ROOT CAUSE IDENTIFIED:

### Issue 1: parseInt() Truncates Decimals
**Backend line 303:**
```javascript
const discount = (parseInt(req.body.withoutTax) * coupon.discountPercent) / 100;
```

**Problem:**
- `parseInt(100.50)` = `100` (truncates decimal)
- Should be: `parseFloat(req.body.withoutTax)` or just use `req.body.withoutTax` directly

### Issue 2: Type Conversion in Subtraction
**Backend line 316:**
```javascript
totalAmount = withTaxAmount - discountAmount;
```

**Problem:**
- `withTaxAmount` is STRING ("110.55")
- `discountAmount` is NUMBER (10.00)
- JavaScript: "110.55" - 10.00 = 100.55 (converts string to number)
- But precision might be lost in conversion

### Issue 3: Frontend Uses Pre-calculated Discount
**Frontend:**
- Uses `couponDiscountAmount` from validateCoupon API
- This is calculated with full precision: `(100.50 * 10) / 100 = 10.05`
- Backend recalculates with `parseInt()`: `(100 * 10) / 100 = 10.00`
- **Mismatch: 10.05 vs 10.00**

## SOLUTION:

1. **Fix Backend parseInt() Issue:**
   - Change `parseInt(req.body.withoutTax)` to `parseFloat(req.body.withoutTax)` or use `req.body.withoutTax` directly
   
2. **Ensure Consistent Calculation:**
   - Backend should use same calculation as validateCoupon API
   - Both should use `parseFloat()` or direct number, not `parseInt()`

3. **Frontend Should Match Backend:**
   - Frontend calculation is correct
   - Backend needs to be fixed to match

