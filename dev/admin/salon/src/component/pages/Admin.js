/* eslint-disable eqeqeq */
import {
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import $ from "jquery";
import { useEffect } from "react";
import DashBoard from "../tables/Dashboard/DashBoard";
import Booking from "../tables/booking/Booking";
import { AdminProfile } from "./AdminProfile";
import { Expert } from "../tables/expert/Expert";
import Service from "../tables/services/Service";
import { Review } from "../tables/review/Review";
import ExpertProfile from "../tables/expert/ExpertProfile";
import WeekTime from "../tables/timeSlot/WeekTime";
import { useDispatch, useSelector } from "react-redux";
import UpcomingBooking from "../tables/booking/UpcomingBooking";
import StaffEarning from "../tables/StaffEarning";
import SalonEarnings from "../tables/SalonEarnings";
import Attendance from "../tables/Attendance";
import AttendanceTable from "../tables/AttendanceTable";
import DailyBooking from "../tables/booking/DailyBooking";
import ExpertHistory from "../tables/expert/ExpertHistory";
import MonthlyReport from "../tables/MonthlyReport";
import Complain from "../tables/complain/Complain";
import ExpertIncome from "../tables/expert/ExpertIncome";
import Holiday from "../tables/timeSlot/Holiday";
import ExpertBooking from "../tables/expert/ExpertBooking";
import ParticularSalonSettlementInfo from "../tables/ParticularSalonSettlementInfo";
import ParticularExpertSettlementInfo from "../tables/expert/ParticularExpertSettlementInfo";
import { ExpertDialogue } from "../tables/expert/ExpertDialogue";
import Products from "../tables/products/Products";
import ProductDialogue from "../tables/products/ProductDialogue";
import ProductDetails from "../tables/products/ProductDetails";
import Order from "../tables/order/Order";
import WithDrawMoney from "../tables/WithDrawMoney";
import WalletHistory from "../WalletHistory";
import OrderDetails from "../tables/order/OrderDetails";
import Attribute from "../tables/attributes/Attribute";



const Admin = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {

    if (
      location.pathname == "/" ||
      location.pathname == "/salonPanel" ||
      location.pathname == "/salonPanel/salonDashboard" ||
      location.pathname == ""
    ) {

      navigate("/salonPanel/salonDashboard");
    }
  }, []);
  var webSize = $(window).width();

  return (
    <div className={`mainAdminGrid  ${webSize < 991 && "webAdminGrid"}`}>
      <Sidebar />

      <div className={`mainAdmin`}>
        <Navbar />
        <div className="adminStart">
          <Routes>
            <Route path="/salonDashboard" element={<DashBoard />} />
            <Route path="/bookingTable" element={<Booking />} />
            <Route path="/profile" element={<AdminProfile />} />
            <Route path="/allExperts" element={<Expert />} />
            <Route path="/addExpert" element={<ExpertDialogue />} />
            <Route path="/productsTable" element={<Products />} />
            <Route path="/orderTable" element={<Order />} />
            <Route path="/orderDetails" element={<OrderDetails />} />
            <Route path="/addProduct" element={<ProductDialogue />} />
            <Route path="/productDetails" element={<ProductDetails />} />
            <Route path="/expertBooking" element={<ExpertBooking />} />
            <Route path="/serviceTable" element={<Service />} />
            <Route path="/reviewTable" element={<Review />} />
            <Route
              path="allExpert/getExpertProfile"
              element={<ExpertProfile />}
            />
            <Route path="/timeTable" element={<WeekTime />} />
            <Route path="/staffEarning" element={<StaffEarning />} />
            <Route path="/salonEarning" element={<SalonEarnings />} />
            <Route path="/withdrawMoney" element={<WithDrawMoney />} />
            <Route path="/walletHistory" element={<WalletHistory />} />
            <Route path="/holiday" element={<Holiday />} />
            <Route path="/futureBooking" element={<UpcomingBooking />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/attendanceTable" element={<AttendanceTable />} />
            <Route path="/dailyBookingTable" element={<DailyBooking />} />
            <Route path="/expertHistory" element={<ExpertHistory />} />
            <Route path="/expertIncome" element={<ExpertIncome />} />
            <Route path="/monthlyReport" element={<MonthlyReport />} />
            <Route path="/complainTable" element={<Complain />} />
            <Route path="/settlementInfo" element={<ParticularSalonSettlementInfo />} />
            <Route path="/expertSettlementInfo" element={<ParticularExpertSettlementInfo />} />
            <Route path="/attribute" element={<Attribute />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default Admin;
