/**
 * Test script to verify cash service with coupon calculation
 * Run with: node dev/test_cash_coupon_calculation.js
 */

// Test configuration
const testCases = [
  {
    name: "Test 1: Basic coupon (10% discount, 100.00)",
    withoutTax: 100.00,
    tax: 10,
    couponDiscountPercent: 10,
    couponMaxDiscount: 50,
    expectedTotal: 99.00
  },
  {
    name: "Test 2: Decimal withoutTax (100.50)",
    withoutTax: 100.50,
    tax: 10,
    couponDiscountPercent: 10,
    couponMaxDiscount: 50,
    expectedTotal: 100.55
  },
  {
    name: "Test 3: High precision (99.99)",
    withoutTax: 99.99,
    tax: 10,
    couponDiscountPercent: 10,
    couponMaxDiscount: 50,
    expectedTotal: 98.99
  },
  {
    name: "Test 4: Max discount limit (1000.00)",
    withoutTax: 1000.00,
    tax: 10,
    couponDiscountPercent: 10,
    couponMaxDiscount: 50,
    expectedTotal: 1050.00
  },
  {
    name: "Test 5: Small amount (50.00)",
    withoutTax: 50.00,
    tax: 10,
    couponDiscountPercent: 10,
    couponMaxDiscount: 50,
    expectedTotal: 49.50
  }
];

// Simulate backend calculation
function calculateBackendTotal(withoutTax, tax, couponDiscountPercent, couponMaxDiscount) {
  // Step 1: Calculate tax
  const taxAmount = (withoutTax * tax) / 100;
  
  // Step 2: Calculate withTaxAmount (as string, like backend)
  const withTaxAmount = (taxAmount + withoutTax).toFixed(2);
  
  // Step 3: Calculate discount (using integer part, like backend)
  const withoutTaxInt = Math.floor(parseFloat(withoutTax));
  const discount = (withoutTaxInt * couponDiscountPercent) / 100;
  const formatedDiscount = parseFloat(discount.toFixed(2));
  const discountAmount = formatedDiscount > couponMaxDiscount ? couponMaxDiscount : formatedDiscount;
  
  // Step 4: Calculate total (convert string to number, like backend)
  const totalAmount = parseFloat(withTaxAmount) - discountAmount;
  
  return {
    taxAmount,
    withTaxAmount,
    withoutTaxInt,
    discountAmount,
    totalAmount,
    totalAmountString: totalAmount.toFixed(2)
  };
}

// Simulate frontend calculation
function calculateFrontendTotal(withoutTax, tax, couponDiscountAmount) {
  // Step 1: Calculate tax
  const finalTaxRupee = (withoutTax * tax) / 100;
  
  // Step 2: Calculate withTaxAmount
  const withTaxAmountNum = finalTaxRupee + withoutTax;
  const withTaxAmountStr = withTaxAmountNum.toFixed(2); // JavaScript uses toFixed, not toStringAsFixed
  const withTaxAmount = parseFloat(withTaxAmountStr);
  
  // Step 3: Apply discount
  const calculatedTotalAmount = withTaxAmount - couponDiscountAmount;
  const totalPrice = calculatedTotalAmount < 0 ? 0 : calculatedTotalAmount;
  
  return {
    finalTaxRupee,
    withTaxAmount,
    totalPrice,
    finalAmount: parseFloat(totalPrice.toFixed(2)),
    finalAmountString: totalPrice.toFixed(2)
  };
}

// Simulate validateCoupon API (what frontend calls)
function validateCoupon(withoutTax, couponDiscountPercent, couponMaxDiscount) {
  // Frontend sends integer
  const amount = Math.floor(withoutTax);
  
  // Backend calculates discount
  const discount = (amount * couponDiscountPercent) / 100;
  const formatedDiscount = parseFloat(discount.toFixed(2));
  const discountAmount = formatedDiscount > couponMaxDiscount ? couponMaxDiscount : formatedDiscount;
  
  return discountAmount;
}

// Run tests
console.log("=".repeat(80));
console.log("CASH SERVICE WITH COUPON - CALCULATION TEST");
console.log("=".repeat(80));
console.log();

let passedTests = 0;
let failedTests = 0;

testCases.forEach((testCase, index) => {
  console.log(`${index + 1}. ${testCase.name}`);
  console.log("-".repeat(80));
  
  // Simulate validateCoupon (frontend gets discount amount)
  const couponDiscountAmount = validateCoupon(
    testCase.withoutTax,
    testCase.couponDiscountPercent,
    testCase.couponMaxDiscount
  );
  
  // Frontend calculation
  const frontendResult = calculateFrontendTotal(
    testCase.withoutTax,
    testCase.tax,
    couponDiscountAmount
  );
  
  // Backend calculation
  const backendResult = calculateBackendTotal(
    testCase.withoutTax,
    testCase.tax,
    testCase.couponDiscountPercent,
    testCase.couponMaxDiscount
  );
  
  // Compare results
  const difference = Math.abs(frontendResult.finalAmount - backendResult.totalAmount);
  const tolerance = 0.01;
  const match = difference <= tolerance;
  
  console.log(`Input:`);
  console.log(`  withoutTax: ${testCase.withoutTax}`);
  console.log(`  tax: ${testCase.tax}%`);
  console.log(`  couponDiscountPercent: ${testCase.couponDiscountPercent}%`);
  console.log(`  couponMaxDiscount: ${testCase.couponMaxDiscount}`);
  console.log();
  
  console.log(`Frontend Calculation:`);
  console.log(`  couponDiscountAmount (from validateCoupon): ${couponDiscountAmount}`);
  console.log(`  finalTaxRupee: ${frontendResult.finalTaxRupee.toFixed(2)}`);
  console.log(`  withTaxAmount: ${frontendResult.withTaxAmount.toFixed(2)}`);
  console.log(`  totalPrice: ${frontendResult.totalPrice.toFixed(2)}`);
  console.log(`  finalAmount: ${frontendResult.finalAmount.toFixed(2)}`);
  console.log();
  
  console.log(`Backend Calculation:`);
  console.log(`  taxAmount: ${backendResult.taxAmount.toFixed(2)}`);
  console.log(`  withTaxAmount: ${backendResult.withTaxAmount}`);
  console.log(`  withoutTaxInt (for discount): ${backendResult.withoutTaxInt}`);
  console.log(`  discountAmount: ${backendResult.discountAmount.toFixed(2)}`);
  console.log(`  totalAmount: ${backendResult.totalAmount.toFixed(2)}`);
  console.log(`  totalAmountString: "${backendResult.totalAmountString}"`);
  console.log();
  
  console.log(`Comparison:`);
  console.log(`  Frontend sends: ${frontendResult.finalAmountString}`);
  console.log(`  Backend expects: ${backendResult.totalAmountString}`);
  console.log(`  Difference: ${difference.toFixed(4)}`);
  console.log(`  Tolerance: ${tolerance}`);
  console.log(`  Match: ${match ? "✅ PASS" : "❌ FAIL"}`);
  console.log();
  
  if (match) {
    passedTests++;
  } else {
    failedTests++;
    console.log(`  ⚠️  Expected: ${testCase.expectedTotal.toFixed(2)}`);
    console.log(`  ⚠️  Frontend: ${frontendResult.finalAmount.toFixed(2)}`);
    console.log(`  ⚠️  Backend: ${backendResult.totalAmount.toFixed(2)}`);
    console.log();
  }
  
  console.log("=".repeat(80));
  console.log();
});

// Summary
console.log("TEST SUMMARY");
console.log("=".repeat(80));
console.log(`Total Tests: ${testCases.length}`);
console.log(`Passed: ${passedTests} ✅`);
console.log(`Failed: ${failedTests} ${failedTests > 0 ? "❌" : ""}`);
console.log(`Success Rate: ${((passedTests / testCases.length) * 100).toFixed(1)}%`);
console.log("=".repeat(80));

if (failedTests === 0) {
  console.log("🎉 All tests passed! Calculations match between frontend and backend.");
} else {
  console.log("⚠️  Some tests failed. Please review the calculations.");
  process.exit(1);
}

