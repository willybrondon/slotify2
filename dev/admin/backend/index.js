require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();
const port = process.env.PORT || 6040;
const moment = require("moment");
const mongoose = require("mongoose");
require("./middleware/mongodb");
const fs = require("fs");
const iconv = require("iconv-lite");
iconv.encodingExists("foo"); 

var logger = require("morgan");
app.use(express.json());
app.use(cors());
app.use(logger("dev"));

const cron = require("node-cron");
const Salon = require("./models/salon.model");
const Expert = require("./models/expert.model");
const Booking = require("./models/booking.model");
const SalonSettlement = require("./models/salonSettlement.model");
const ExpertSettlement = require("./models/expertSettlement.model");
const Attendance = require("./models/attendance.model");
const Setting = require("./models/setting.model");

const settingJson = require("./setting");
//Declare global variable
global.settingJSON = {};

//handle global.settingJSON when pm2 restart
async function initializeSettings() {
  try {
    const setting = await Setting.findOne().sort({ createdAt: -1 });
    if (setting) {
      global.settingJSON = setting;
      console.log(
        "global-----------------------",
        global.settingJSON.isFlutterWave
      );
    } else {
      global.settingJSON = settingJson;
    }
  } catch (error) {
    console.error("Failed to initialize settings:", error);
  }
}

module.exports = initializeSettings();

//Declare the function as a global variable to update the setting.js file
global.updateSettingFile = (settingData) => {
  const settingJSON = JSON.stringify(settingData, null, 2);
  fs.writeFileSync("setting.js", `module.exports = ${settingJSON};`, "utf8");

  global.settingJSON = settingData; // Update global variable
  console.log("Settings file updated.");
};

const indexRoute = require("./route/index");
app.use(indexRoute);

async function updateAttendance(expertId, action) {
  try {
    const todayDate = moment().format("YYYY-MM-DD");

    let attendanceRecord = await Attendance.findOne({
      expertId,
      month: moment().format("YYYY-MM"),
    }).populate("expertId");

    let savedAttendance;

    if (!attendanceRecord) {
      attendanceRecord = new Attendance();
      attendanceRecord.expertId = expertId;
      attendanceRecord.month = moment().format("YYYY-MM");
    }

    const dateIndex = attendanceRecord.attendDates.indexOf(todayDate);
    const absentIndex = attendanceRecord.absentDates.indexOf(todayDate);

    if (action === "attend") {
      if (dateIndex !== -1) {
        console.log(
          `Attendance for today has already been marked for ${expertId}`
        );
        return;
      }

      if (absentIndex !== -1) {
        attendanceRecord.absentCount -= 1;
        attendanceRecord.absentDates.splice(absentIndex, 1);
      }

      attendanceRecord.attendCount += 1;
      attendanceRecord.attendDates.push(todayDate);
    } else if (action === "absent") {
      if (absentIndex !== -1 || dateIndex !== -1) {
        console.log(
          `Attendance for today has already been marked for ${expertId}`
        );
        return;
      }

      if (dateIndex !== -1) {
        attendanceRecord.attendCount -= 1;
        attendanceRecord.attendDates.splice(dateIndex, 1);
      }

      attendanceRecord.absentCount += 1;
      attendanceRecord.absentDates.push(todayDate);
    }

    attendanceRecord.totalDays =
      attendanceRecord.attendCount + attendanceRecord.absentCount;

    const expert = await Expert.findById(expertId);
    await expert.save();

    attendanceRecord.salonId = expert.salonId;
    savedAttendance = await attendanceRecord.save();

    console.log(
      `${
        action === "attend" ? "Attendance" : "Absent"
      } marked successfully for ${expertId}`
    );
  } catch (error) {
    console.log("error", error);
  }
}

// Expert who are not attend are count as absent for the day
cron.schedule("55 23 * * *", async () => {
  try {
    const allExperts = await Expert.find({ isDelete: false });

    // Iterate through each expertId and call the API with action 'absent'
    for (const expert of allExperts) {
      const expertId = expert._id;

      // Call the API for each expert with action 'absent'
      await updateAttendance(expertId, "absent");
    }

    const expert = await Expert.updateMany(
      { isDelete: false },
      { isAttend: false, showDialog: false }
    );
    console.log("expert", expert);
    console.log("Cron job executed successfully.");
  } catch (error) {
    console.error("Error executing cron job:", error);
  }
});

// Booking cancel
cron.schedule("55 23 * * *", async () => {
  try {
    const todayDate = moment().format("YYYY-MM-DD");
    console.log("todayDate", todayDate);
    const bookingsToUpdate = await Booking.find({
      status: { $in: ["pending", "confirm"] },
      date: todayDate,
    });

    console.log("bookingsToUpdate", bookingsToUpdate);

    for (const booking of bookingsToUpdate) {
      booking.status = "cancel";
      booking.cancel.reason = "autoCancel by system";
      booking.cancel.person = "admin";
      booking.cancel.time = moment().format("hh:mm A");
      booking.cancel.date = moment().format("YYYY-MM-DD");
      await booking.save();
    }

    console.log(`${bookingsToUpdate.length} bookings updated successfully.`);
  } catch (error) {
    console.error("Error executing cron job:", error);
  }
});

// Define a cron job to run monthly
cron.schedule("55 23 28-31 * *", async () => {
  // cron.schedule("* * * * *", async () => {
  try {
    const salons = await Salon.find();
    const today = moment().format("YYYY-MM-DD");

    for (const salon of salons) {
      const completedBookings = await Booking.find({
        salonId: salon._id,
        status: "completed",
        isSettle: false,
        isDelete: false,
      });

      let salonEarning = 0;
      let salonCommission = 0;

      for (const booking of completedBookings) {
        salonEarning += booking.salonEarning;
        salonCommission += booking.salonCommission;

        await SalonSettlement.findOneAndUpdate(
          { salonId: salon._id },
          {
            salonId: salon._id,
            $addToSet: { bookingId: booking._id },
            salonEarning,
            salonCommission,
            salonCommissionPercent: booking.platformFeePercent,
            finalAmount: salonEarning,
            date: today,
          },
          { upsert: true }
        );
      }
    }

    const experts = await Expert.find({ isDelete: false });
    for (const expert of experts) {
      const completedBookings = await Booking.find({
        expertId: expert._id,
        status: "completed",
        isSettle: false,
        isDelete: false,
      });

      let expertEarning = 0;
      for (const booking of completedBookings) {
        expertEarning += booking.expertEarning;

        await ExpertSettlement.findOneAndUpdate(
          { expertId: expert._id },
          {
            salonId: expert.salonId,
            $addToSet: { bookingId: booking._id },
            expertEarning: expertEarning,
            finalAmount: expertEarning,
            date: today,
          },
          { upsert: true }
        );

        await Booking.findByIdAndUpdate(booking._id, { isSettle: true });
      }
    }

    console.log("Monthly settlement completed successfully.");
  } catch (error) {
    console.error("Error occurred during monthly settlement:", error);
  }
});



//schedule session for create demo user's booking with status "pending"

app.use("/storage", express.static(path.join(__dirname, "storage")));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "salon")));

// Serve static files for salonportal : for solon portal new edited 22/07/2025
app.use("/salonportal", express.static(path.join(__dirname, "salonportal")));

// Direct route for salonportal index.html edited 22/07/2025
app.get("/salonportal/:param?", function (req, res) {
  res.status(200).sendFile(path.join(__dirname, "salonportal", "index.html"));
});

app.get("/SalonPanel/:param?", function (req, res) {
  res.status(200).sendFile(path.join(__dirname, "salon", "index.html"));
});

app.get("/*", function (req, res) {
  res.status(200).sendFile(path.join(__dirname, "public", "index.html"));
});

const nodemailer = require('nodemailer');

app.post('/api/send-demo-request', express.json(), async (req, res) => {
  const { name, phone, email, salonType } = req.body;
  if (!name || !phone || !email) {
    return res.status(400).json({ success: false, error: 'Missing required fields.' });
  }

  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'your_email@gmail.com', // Replace with your sender email
      pass: 'your_email_password'   // Replace with your sender email password or app password
    }
  });

  let mailOptions = {
    from: 'your_email@gmail.com', // Replace with your sender email
    to: 'brondonwilly@gmail.com',
    subject: 'New Salon Demo Request',
    text: `Name: ${name}\nPhone: ${phone}\nEmail: ${email}\nSalon Type: ${salonType}`
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(port, () => {
  console.log(`magic happen on ${port}`);
});
