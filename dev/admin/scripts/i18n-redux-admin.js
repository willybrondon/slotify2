const fs = require("fs");
const path = require("path");

const map = [
  ['Success("Login successfully")', "Success(ui.toast.loginOk)"],
  ['Success("Admin Create Successfully")', "Success(ui.toast.adminCreated)"],
  ['Success("Code Update Successfully")', "Success(ui.toast.codeUpdated)"],
  ['Success("Admin Updated Successfully")', "Success(ui.toast.adminUpdated)"],
  ['Success("Expert Create Successfully")', "Success(ui.toast.expertCreated)"],
  ['Success("Expert Update Successfully")', "Success(ui.toast.expertUpdated)"],
  ['Success("Expert Delete Successfully")', "Success(ui.toast.expertDeleted)"],
  ['Success("Expert attendance Updated Successfully")', "Success(ui.toast.attendanceUpdated)"],
  ['Success("Booking Cancel Successfully")', "Success(ui.toast.bookingCancelled)"],
  ['Success("Category Add Successfully")', "Success(ui.toast.categoryAdded)"],
  ['Success("Category Update Successfully")', "Success(ui.toast.categoryUpdated)"],
  ['Success("Category Status Update Successfully")', "Success(ui.toast.categoryStatus)"],
  ['Success("Category Delete Successfully")', "Success(ui.toast.categoryDeleted)"],
  ['Success("Service Add Successfully")', "Success(ui.toast.serviceAdded)"],
  ['Success("Service Update Successfully")', "Success(ui.toast.serviceUpdated)"],
  ['Success("Service Delete Successfully")', "Success(ui.toast.serviceDeleted)"],
  ['Success("Salon Create Successfully")', "Success(ui.toast.salonCreated)"],
  ['Success("salon Update Successfully")', "Success(ui.toast.salonUpdated)"],
  ['Success("Salon Update Successfully")', "Success(ui.toast.salonUpdated)"],
  ['Success("Salon Delete Successfully")', "Success(ui.toast.salonDeleted)"],
  ['Success("Time Update Successfully")', "Success(ui.toast.updated)"],
  ['Success("Holiday Added Successfully")', "Success(ui.toast.holidayAdded)"],
  ['Success("Holiday Delete Successfully")', "Success(ui.toast.holidayDeleted)"],
  ['Success("Review Deleted Successfully")', "Success(ui.toast.reviewDeleted)"],
  ['Success("Notification Send SuccessFully")', "Success(ui.toast.notificationSent)"],
  ['Success("Complain Solved Succefully")', "Success(ui.toast.complainSolved)"],
  ['Success("Coupon Created Successfully")', "Success(ui.toast.couponCreated)"],
  ['Success("Coupon Deleted Successfully")', "Success(ui.toast.couponDeleted)"],
  ['Success("Setting Updated Successfully")', "Success(ui.toast.settingUpdated)"],
  ['Success("Maintenance Mode Updated Successfully")', "Success(ui.toast.maintenanceUpdated)"],
  ['Success("Updated Successfully")', "Success(ui.toast.updated)"],
  ['Success("Bonus-Penalty Update Successfully")', "Success(ui.toast.bonusUpdated)"],
  ['Success("Salary Paid Successfully")', "Success(ui.toast.salaryPaid)"],
  ['Success("Invoice downloaded successfully")', "Success(ui.toast.invoiceDownloaded)"],
  ['Success("ProductCategory Add Successfully")', "Success(ui.toast.productCategoryAdded)"],
  ['Success("Product Deleted Successfully")', "Success(ui.toast.productDeleted)"],
];

const sliceDir = path.join(__dirname, "..", "frontend", "src", "redux", "slice");
const importLine =
  'import { SKEDISY_ADMIN_UI as ui } from "../../constants/skedisyUiCopy";\n';

for (const file of fs.readdirSync(sliceDir)) {
  if (!file.endsWith(".js")) continue;
  const p = path.join(sliceDir, file);
  let c = fs.readFileSync(p, "utf8");
  if (file === "authSlice.js" && c.includes("skedisyUiCopy")) continue;
  if (!c.includes("skedisyUiCopy") && c.includes("toastServices")) {
    c = c.replace(
      /(import \{[^}]+\} from "\.\.\/\.\.\/component\/api\/toastServices";)\n/,
      `$1\n${importLine}`
    );
  }
  let n = c;
  for (const [from, to] of map) {
    n = n.split(from).join(to);
  }
  if (n !== c) fs.writeFileSync(p, n);
}
console.log("admin redux toasts updated");
