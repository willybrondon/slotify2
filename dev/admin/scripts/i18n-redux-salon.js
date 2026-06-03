const fs = require("fs");
const path = require("path");

const map = [
  ['Success("Expert Create Successfully")', "Success(ui.toast.expertCreated)"],
  ['Success("Expert Update Successfully")', "Success(ui.toast.expertUpdated)"],
  ['Success("Expert Delete Successfully")', "Success(ui.toast.expertDeleted)"],
  ["Success('Expert attendance Updated Successfully')", "Success(ui.toast.attendanceUpdated)"],
  ['Success("Expert attendance Updated Successfully")', "Success(ui.toast.attendanceUpdated)"],
  ['Success("Booking Cancel Successfully")', "Success(ui.toast.bookingCancelled)"],
  ['Success("Category Add Successfully")', "Success(ui.toast.categoryAdded)"],
  ['Success("Category Update Successfully")', "Success(ui.toast.categoryUpdated)"],
  ['Success("Category Status Update Successfully")', "Success(ui.toast.categoryStatus)"],
  ['Success("Category Delete Successfully")', "Success(ui.toast.categoryDeleted)"],
  ['Success("Service Add Successfully")', "Success(ui.toast.serviceAdded)"],
  ['Success("Service Delete Successfully")', "Success(ui.toast.serviceDeleted)"],
  ['Success("City added Successfully")', "Success(ui.toast.cityAdded)"],
  ['Success("City blocked Successfully")', "Success(ui.toast.cityBlocked)"],
  ['Success("Holiday Added Successfully")', "Success(ui.toast.holidayAdded)"],
  ['Success("Holiday Delete Successfully")', "Success(ui.toast.holidayDeleted)"],
  ['Success("Updated Successfully")', "Success(ui.toast.updated)"],
  ['Success("Salon Break Time Updated Successfully")', "Success(ui.toast.breakUpdated)"],
  ['Success("Review Deleted Successfully")', "Success(ui.toast.reviewDeleted)"],
  ['Success("Notification Send SuccessFully")', "Success(ui.toast.notificationSent)"],
  ['Success("Bonus-Penalty Update Successfully")', "Success(ui.toast.bonusUpdated)"],
  ['Success("Expert Paid  Successfully")', "Success(ui.toast.expertPaid)"],
  ['Success("Salary Paid Successfully")', "Success(ui.toast.salaryPaid)"],
  ['Success("Tax Added Successfully")', "Success(ui.toast.taxAdded)"],
  ['Success("Tax Updated Successfully")', "Success(ui.toast.taxUpdated)"],
  ['Success("Tax Status Updated Successfully")', "Success(ui.toast.taxStatus)"],
  ['Success("Tax  Successfully")', "Success(ui.toast.updated)"],
  ['Success("Salon Create Successfully")', "Success(ui.toast.salonCreated)"],
  ['Success("salon Update Successfully")', "Success(ui.toast.salonUpdated)"],
  ['Success("Salon Update Successfully")', "Success(ui.toast.salonUpdated)"],
  ['Success("Salon Delete Successfully")', "Success(ui.toast.salonDeleted)"],
  ['Success("Time Update Successfully")', "Success(ui.toast.timeUpdated)"],
  ['Success("ProductCategory Add Successfully")', "Success(ui.toast.productCategoryAdded)"],
  ['Success("Cities updated successfully")', "Success(ui.toast.citiesUpdated)"],
];

const sliceDir = path.join(__dirname, "..", "salon", "src", "redux", "slice");
const importLine =
  'import { SKEDISY_SALON_UI as ui } from "../../constants/skedisyUiCopy";\n';

for (const file of fs.readdirSync(sliceDir)) {
  if (!file.endsWith(".js")) continue;
  const p = path.join(sliceDir, file);
  let c = fs.readFileSync(p, "utf8");
  if (!c.includes("skedisyUiCopy") && c.includes('toastServices')) {
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
console.log("salon redux toasts updated");
