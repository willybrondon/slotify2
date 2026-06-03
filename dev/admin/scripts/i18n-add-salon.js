const fs = require("fs");
const path = require("path");

const p = path.join(__dirname, "..", "frontend", "src", "component", "tables", "salon", "AddSalon.js");
let c = fs.readFileSync(p, "utf8");

if (!c.includes("skedisyUiCopy")) {
  c = c.replace(
    /import Title from "\.\.\/\.\.\/extras\/Title";\n/,
    'import Title from "../../extras/Title";\nimport { SKEDISY_ADMIN_UI as ui } from "../../../constants/skedisyUiCopy";\nconst f = ui.salonForm;\n'
  );
}

const MAP = [
  ['if (!name) error.name = "Name is required"', "if (!name) error.name = f.nameRequired"],
  ['if (!about) error.about = "About is required"', "if (!about) error.about = f.aboutRequired"],
  ['if (!email) error.email = "Email is required"', "if (!email) error.email = f.emailRequired"],
  ['if (!password) error.password = "Password is required"', "if (!password) error.password = f.passwordRequired"],
  ['if (!platformFee) error.platformFee = "Plat form fee is required"', "if (!platformFee) error.platformFee = f.platformFeeRequired"],
  ['if (!mobile) error.mobile = "Mobile number is required"', "if (!mobile) error.mobile = f.mobileRequired"],
  ['if (!address) error.address = "Address is required"', "if (!address) error.address = f.addressRequired"],
  ['if (!landMark) error.landMark = "Land mark is required"', "if (!landMark) error.landMark = f.landmarkRequired"],
  ['if (!city) error.city = "City is required"', "if (!city) error.city = f.cityRequired"],
  ['if (!states) error.state = "State is required"', "if (!states) error.state = f.stateRequired"],
  ['if (!country) error.country = "Country is required"', "if (!country) error.country = f.countryRequired"],
  ['if (!latitude) error.latitude = "Latitude is required"', "if (!latitude) error.latitude = f.latitudeRequired"],
  ['if (!longitude) error.longitude = "Longitude is required"', "if (!longitude) error.longitude = f.longitudeRequired"],
  ['if (!images) error.images = "Images is required"', "if (!images) error.images = f.imagesRequired"],
  ['if (images?.length === 0) error.images = "Images is required"', "if (images?.length === 0) error.images = f.imagesRequired"],
  ['if (images?.length > 10) error.images = "Select max 10 images"', "if (images?.length > 10) error.images = f.imagesMax"],
  ["<Title name={`Add salon`} />", "<Title name={state?.row ? f.editTitle : f.addTitle} />"],
  ["label={`Name`}", "label={f.name}"],
  ["placeholder={`Name`}", "placeholder={f.name}"],
  ["name: ` Name is required`", "name: f.nameRequired"],
  ["label={`email`}", "label={f.email}"],
  ["placeholder={`email`}", "placeholder={f.email}"],
  ["email: `Email is required`", "email: f.emailRequired"],
  ["label={`Mobile number`}", "label={f.mobile}"],
  ["placeholder={`Mobile number`}", "placeholder={f.mobile}"],
  ["mobile: `Mobile number is required`", "mobile: f.mobileRequired"],
  ["label={`Password`}", "label={f.password}"],
  ["placeholder={`Password`}", "placeholder={f.password}"],
  ["password: `Password is required`", "password: f.passwordRequired"],
  ["label={`Platform fee (%)`}", "label={f.platformFee}"],
  ["placeholder={`Platform fee (%)`}", "placeholder={f.platformFee}"],
  ["platformFee: `Plat form fee is required`", "platformFee: f.platformFeeRequired"],
  ["label={`Address`}", "label={f.address}"],
  ["placeholder={`Address`}", "placeholder={f.address}"],
  ["address: `Address is required`", "address: f.addressRequired"],
  ["label={`Landmark`}", "label={f.landmark}"],
  ["placeholder={`Landmark`}", "placeholder={f.landmark}"],
  ["landMark: `Landmark is required`", "landMark: f.landmarkRequired"],
  ["label={`City`}", "label={f.city}"],
  ["placeholder={`City`}", "placeholder={f.city}"],
  ["city: ` City is required`", "city: f.cityRequired"],
  ["label={`State`}", "label={f.state}"],
  ["placeholder={`State`}", "placeholder={f.state}"],
  ["state: `State is required`", "state: f.stateRequired"],
  ["label={`Country`}", "label={f.country}"],
  ["placeholder={`Country`}", "placeholder={f.country}"],
  ["country: `Country is required`", "country: f.countryRequired"],
  ["label={`latitude`}", "label={f.latitude}"],
  ["placeholder={`latitude`}", "placeholder={f.latitude}"],
  ["latitude: `latitude is required`", "latitude: f.latitudeRequired"],
  ["label={`longitude`}", "label={f.longitude}"],
  ["placeholder={`longitude`}", "placeholder={f.longitude}"],
  ["longitude: `longitude is required`", "longitude: f.longitudeRequired"],
  ["label={`About`}", "label={f.about}"],
  ["placeholder={`about`}", "placeholder={f.about}"],
  ["about: `About is required`", "about: f.aboutRequired"],
  ["label={`Main Image`}", "label={f.mainImage}"],
  ["Select multiple image", "{f.gallery}"],
];

for (const [from, to] of MAP) {
  c = c.split(from).join(to);
}

fs.writeFileSync(p, c);
console.log("AddSalon.js patched");
