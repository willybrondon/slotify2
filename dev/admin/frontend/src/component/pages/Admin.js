/* eslint-disable eqeqeq */
import {
  Outlet,
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
import Category from "../tables/category/Category";
import Service from "../tables/services/Service";
import { Review } from "../tables/review/Review";
import { User } from "../tables/User/User";
import Setting from "../tables/setting/Setting";
import ExpertProfile from "../tables/expert/ExpertProfile";
import { useDispatch, useSelector } from "react-redux";
import UpcomingBooking from "../tables/booking/UpcomingBooking";
import StaffEarning from "../tables/StaffEarning";
import SalonPayout from "../tables/SalonPayout";
import Attendance from "../tables/Attendance";
import AttendanceTable from "../tables/AttendanceTable";
import UserProfile from "../tables/User/UserProfile";
import DailyBooking from "../tables/booking/DailyBooking";
import ExpertHistory from "../tables/expert/ExpertHistory";
import MonthlyReport from "../../component/tables/booking/MonthlyReport";
import Complain from "../tables/complain/Complain";
import AllPaymentHistory from "../tables/payment/AllPaymentHistory";
import ExpertPaymentHistory from "../tables/payment/ExpertWiseHistory";
import YearlyPayment from "../tables/payment/YearlyPayment";
import Holiday from "../tables/timeSlot/Holiday";
import { Salon } from "../tables/salon/Salon";
import SalonSchedule from "../tables/salon/SalonSchedule";
import ExpertBooking from "../tables/expert/ExpertBooking";
import SalonBooking from "../tables/salon/SalonBooking";
import UserBooking from "../tables/User/UserBooking";
import SalonProfile from "../tables/salon/SalonProfile";
import SalonHistory from "../tables/salon/SalonHistory";
import ParticularExpertEarnings from "../tables/expert/ParticularExpertEarnings";
import ParticularSalonSettlementInfo from "../tables/salon/ParticularSalonSettlementInfo";
import AddSalon from "../tables/salon/AddSalon";
import { ExpertDialogue } from "../tables/expert/ExpertDialogue";
import Appointment from "../tables/appointment/Appointment";
import { SalonRequest } from "../tables/salonRequest/SalonRequest";

const Admin = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (
      location.pathname == "/" ||
      location.pathname == "/admin" ||
      location.pathname == "/admin/" ||
      location.pathname == ""
    ) {
      navigate("/admin/adminDashboard");
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
            <Route path="/adminDashboard" element={<DashBoard />} />
            <Route path="/bookingTable" element={<Booking />} />
            <Route path="/adminProfile" element={<AdminProfile />} />
            <Route path="/allExperts" element={<Expert />} />
            <Route path="/expert/addExpert" element={<ExpertDialogue />} />
            <Route path="/expert/bookings" element={<ExpertBooking />} />
            <Route path="/categoryTable" element={<Category />} />
            <Route path="/serviceTable" element={<Service />} />
            <Route path="/reviewTable" element={<Review />} />
            <Route path="/userTable" element={<User />} />
            <Route path="/user/bookings" element={<UserBooking />} />
            <Route path="/settingPage" element={<Setting />} />
            <Route
              path="/expert/getExpertProfile"
              element={<ExpertProfile />}
            />
            <Route path="/staffEarning" element={<StaffEarning />} />
            <Route path="/salonPayment" element={<SalonPayout />} />
            <Route path="/holiday" element={<Holiday />} />
            <Route path="/futureBooking" element={<UpcomingBooking />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/attendanceTable" element={<AttendanceTable />} />
            <Route path="/user/userProfile" element={<UserProfile />} />
            <Route path="/dailyBookingTable" element={<DailyBooking />} />
            <Route path="/expert/income" element={<ExpertHistory />} />
            <Route
              path="/particularExpert/income"
              element={<ParticularExpertEarnings />}
            />
            <Route path="/monthlyReport" element={<MonthlyReport />} />
            <Route path="/complainTable" element={<Complain />} />
            <Route path="/paymentHistory" element={<AllPaymentHistory />} />
            <Route path="/salonRequest" element={<SalonRequest />} />
            <Route
              path="/expert/paymentHistory"
              element={<ExpertPaymentHistory />}
            />
            <Route path="/yearlyPayment" element={<YearlyPayment />} />

            <Route path="/allSalon" element={<Salon />} />
            <Route path="/salon/addSalon" element={<AddSalon />} />
            <Route path="/salon/salonProfile" element={<SalonProfile />} />
            <Route path="/salon/bookings" element={<SalonBooking />} />
            <Route path="/salon/income" element={<SalonHistory />} />
            <Route path="/allSalon/schedule" element={<SalonSchedule />} />
            <Route
              path="/salon/particularSettlement"
              element={<ParticularSalonSettlementInfo />}
            />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default Admin;
