const Category = require("../../models/category.model");
const Salon = require("../../models/salon.model");
const Service = require("../../models/service.model");
const Expert = require("../../models/expert.model");
const Booking = require("../../models/booking.model");
const mongoose = require("mongoose");
const geolib = require("geolib");
const {
  getWebCopy,
  resolveLang,
  idfBannerHtml,
  skedisyFooterHtml,
} = require("../../lib/webPageCopy");
const { authUrls } = require("../../lib/publicAuthPage");

// Generate slug from name
const generateSlug = (name) => {
  if (!name) return "";
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
};

// Find category by short ID (first 6 characters of ObjectId)
const findCategoryByShortId = async (shortId) => {
  try {
    // Get all active categories and find one where ObjectId starts with shortId
    const categories = await Category.find({
      isDelete: false,
      status: true,
    }).select("_id");
    
    // Find category where _id starts with shortId
    const category = categories.find(c => c._id.toString().toLowerCase().startsWith(shortId.toLowerCase()));
    return category ? category._id : null;
  } catch (error) {
    console.error("Error finding category by short ID:", error);
    return null;
  }
};

// Helper function to get translated name
const getTranslatedName = (category, language = 'en') => {
  if (!category) return '';
  
  // Map language codes to field names
  const translationMap = {
    'en': category.nameEn || category.name,
    'fr': category.nameFr || category.nameEn || category.name,
    'pt': category.namePt || category.nameEn || category.name,
  };
  
  // Default to English if language not found
  return translationMap[language] || category.name || '';
};

// Helper function to get translated service name
const getTranslatedServiceName = (service, language = 'en') => {
  if (!service) return '';
  
  // Map language codes to field names
  const translationMap = {
    'en': service.nameEn || service.name,
    'fr': service.nameFr || service.nameEn || service.name,
    'pt': service.namePt || service.nameEn || service.name,
  };
  
  // Default to English if language not found
  return translationMap[language] || service.name || '';
};

const getCategoryServiceIds = async (categoryId) => {
  const services = await Service.find({
    categoryId,
    isDelete: false,
    status: true,
  }).select("_id");
  return services.map((s) => s._id);
};

const appendSalonSearchFilter = (searchQuery, search) => {
  if (!search || !String(search).trim()) return searchQuery;
  const searchTerm = String(search).trim();
  return {
    ...searchQuery,
    $or: [
      { name: { $regex: searchTerm, $options: "i" } },
      { "addressDetails.addressLine1": { $regex: searchTerm, $options: "i" } },
      { "addressDetails.city": { $regex: searchTerm, $options: "i" } },
      { "addressDetails.country": { $regex: searchTerm, $options: "i" } },
      { about: { $regex: searchTerm, $options: "i" } },
    ],
  };
};

const escapeHtml = (str) =>
  String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const DAY_NAMES_EN = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const DAY_SHORT_FR = ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."];
const DAY_SHORT_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const formatDurationLabel = (minutes, language = "fr") => {
  const m = Number(minutes) || 0;
  if (m <= 0) return "";
  // StyleSeat-style: always minutes ("15 Mins", "120 Mins")
  return language === "fr" ? `${m} min` : `${m} Mins`;
};

const normalizeOpenTime = (openTime) => {
  if (!openTime) return "";
  const raw = String(openTime).trim();
  // Prefer HH:mm display
  const ampm = raw.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (ampm) {
    let h = parseInt(ampm[1], 10);
    const min = ampm[2];
    const ap = ampm[3].toUpperCase();
    if (ap === "PM" && h < 12) h += 12;
    if (ap === "AM" && h === 12) h = 0;
    return `${String(h).padStart(2, "0")}:${min}`;
  }
  const hm = raw.match(/^(\d{1,2}):(\d{2})/);
  if (hm) return `${String(parseInt(hm[1], 10)).padStart(2, "0")}:${hm[2]}`;
  return raw;
};

const parseMinutesFromTime = (openTime) => {
  const label = normalizeOpenTime(openTime);
  const m = label.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
};

const formatBookClock = (totalMinutes, language = "fr") => {
  let mins = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (language === "fr") {
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }
  const ap = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ap}`;
};

/** Earliest upcoming open hint — StyleSeat-like “Book today 10am”. */
const getNextAvailabilityHint = (salonTime, language = "fr") => {
  if (!Array.isArray(salonTime) || !salonTime.length) return "";
  const now = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();

  for (let offset = 0; offset < 7; offset++) {
    const d = new Date(now);
    d.setDate(now.getDate() + offset);
    const dayName = DAY_NAMES_EN[d.getDay()];
    const row = salonTime.find(
      (t) =>
        String(t.day || "").toLowerCase() === dayName.toLowerCase() &&
        t.isActive !== false &&
        t.openTime
    );
    if (!row) continue;

    const openMins = parseMinutesFromTime(row.openTime);
    if (openMins == null) continue;
    const closeMins = parseMinutesFromTime(row.closedTime);
    const step = Math.max(15, Number(row.time) || 30);

    let slotMins = openMins;
    if (offset === 0) {
      if (closeMins != null && nowMins >= closeMins) continue;
      if (nowMins > openMins) {
        slotMins = Math.ceil(nowMins / step) * step;
        if (closeMins != null && slotMins >= closeMins) continue;
      }
    }

    const clock = formatBookClock(slotMins, language);
    if (offset === 0) {
      return language === "fr"
        ? `Aujourd’hui, ${clock}`
        : `Today, ${clock}`;
    }
    if (offset === 1) {
      return language === "fr"
        ? `Demain, ${clock}`
        : `Tomorrow, ${clock}`;
    }
    const short =
      language === "fr" ? DAY_SHORT_FR[d.getDay()] : DAY_SHORT_EN[d.getDay()];
    return language === "fr"
      ? `${short}, ${clock}`
      : `${short}, ${clock}`;
  }
  return "";
};

const pickSalonAvatar = (salon) => {
  if (salon.mainImage) return salon.mainImage;
  if (salon.image && salon.image.length) return salon.image.find(Boolean) || "";
  return salon.heroImage || "";
};

const pickSalonRealizations = (salon, avatar) => {
  const pool = [];
  const push = (url) => {
    if (!url || typeof url !== "string") return;
    const u = url.trim();
    if (!u || pool.includes(u)) return;
    pool.push(u);
  };
  (salon.image || []).forEach(push);
  push(salon.heroImage);
  push(salon.mainImage);
  // Prefer realization gallery (exclude avatar), else reuse salon photo
  let shots = pool.filter((u) => u !== avatar);
  if (!shots.length) {
    if (avatar) shots = [avatar];
    else shots = pool.slice();
  }
  return shots.slice(0, 12);
};

const buildTopServices = (salon, { language, nextAvailable }) => {
  const rows = (salon.serviceIds || [])
    .filter((s) => s && s.id && typeof s.id === "object")
    .map((s) => {
      const svc = s.id;
      const price =
        s.price !== null && s.price !== undefined
          ? Number(s.price)
          : Number(svc.price);
      return {
        id: String(svc._id || ""),
        name: getTranslatedServiceName(svc, language) || svc.name || "",
        duration: Number(svc.duration) || 0,
        durationLabel: formatDurationLabel(svc.duration, language),
        price: Number.isFinite(price) ? price : null,
        nextAvailable: nextAvailable || "",
      };
    })
    .filter((s) => s.name);
  // Best = priced first, then longer (more “flagship”), then name
  rows.sort((a, b) => {
    const pa = a.price == null ? 1 : 0;
    const pb = b.price == null ? 1 : 0;
    if (pa !== pb) return pa - pb;
    if ((b.price || 0) !== (a.price || 0)) return (b.price || 0) - (a.price || 0);
    return (b.duration || 0) - (a.duration || 0);
  });
  return rows.slice(0, 4);
};

const formatSalonAddress = (addressDetails) => {
  if (!addressDetails) return "";
  const line = [
    addressDetails.addressLine1,
    addressDetails.city,
    addressDetails.country,
  ]
    .filter(Boolean)
    .join(", ");
  return line.replace(/,\s*,/g, ",").replace(/^,|,$/g, "");
};

const buildSalonShareUrl = (salon, baseURL) => {
  const slug = generateSlug(salon.name);
  const shortId = salon._id.toString().substring(0, 6);
  return `${baseURL}/salon/${slug}-${shortId}`;
};

/** Attach distance (km) when client coords are present. */
const attachSalonDistances = (salons, latitude, longitude) => {
  if (!latitude || !longitude) return salons;
  const userLocation = {
    latitude: parseFloat(latitude),
    longitude: parseFloat(longitude),
  };
  if (!Number.isFinite(userLocation.latitude) || !Number.isFinite(userLocation.longitude)) {
    return salons;
  }
  return salons.map((salon) => {
    if (salon.locationCoordinates?.latitude && salon.locationCoordinates?.longitude) {
      const salonLocation = {
        latitude: parseFloat(salon.locationCoordinates.latitude),
        longitude: parseFloat(salon.locationCoordinates.longitude),
      };
      salon.distance = geolib.getDistance(userLocation, salonLocation) / 1000;
    } else {
      salon.distance = null;
    }
    return salon;
  });
};

/**
 * StyleSeat-like post-filters + sort on formatted salon cards.
 * sort: best | distance | rating | reviews | price
 */
const applySalonDiscoveryFilters = (
  formattedSalons,
  { minRating = 0, minPrice = 0, maxPrice = 0, sort = "best", availableToday = false } = {}
) => {
  let list = formattedSalons.slice();

  if (minRating > 0) {
    list = list.filter((s) => (s.review || 0) >= minRating);
  }
  if (minPrice > 0) {
    list = list.filter((s) => s.minPrice != null && s.minPrice >= minPrice);
  }
  if (maxPrice > 0) {
    list = list.filter((s) => s.minPrice != null && s.minPrice <= maxPrice);
  }
  if (availableToday) {
    list = list.filter((s) =>
      /aujourd|today/i.test(String(s.nextAvailable || ""))
    );
  }

  const nullsLast = (v) => (v == null || Number.isNaN(v) ? Number.POSITIVE_INFINITY : v);

  if (sort === "distance") {
    list.sort((a, b) => nullsLast(a.distance) - nullsLast(b.distance));
  } else if (sort === "rating") {
    list.sort((a, b) => (b.review || 0) - (a.review || 0));
  } else if (sort === "reviews") {
    list.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
  } else if (sort === "price") {
    list.sort((a, b) => nullsLast(a.minPrice) - nullsLast(b.minPrice));
  } else {
    // best — StyleSeat-style: rating weighted by review volume
    list.sort((a, b) => {
      const score = (s) =>
        (Number(s.review) || 0) * Math.log10((Number(s.reviewCount) || 0) + 1);
      const diff = score(b) - score(a);
      if (diff !== 0) return diff;
      return nullsLast(a.distance) - nullsLast(b.distance);
    });
  }

  return list;
};

const formatSalonForCategory = (salon, { baseURL, language, copy }) => {
  const categoryServices = (salon.serviceIds || [])
    .filter((s) => s.id && s.price !== null && s.price !== undefined)
    .map((s) => s.price);
  const minPrice =
    categoryServices.length > 0 ? Math.min(...categoryServices) : null;
  const addr = salon.addressDetails || {};
  const city = addr.city || "";
  const avatarImage = pickSalonAvatar(salon);
  const realizations = pickSalonRealizations(salon, avatarImage);
  const nextAvailable = getNextAvailabilityHint(salon.salonTime, language);
  const topServices = buildTopServices(salon, { language, nextAvailable });

  return {
    _id: salon._id,
    name: salon.name,
    mainImage: avatarImage || realizations[0] || "",
    avatarImage,
    realizations,
    review: salon.review || 0,
    reviewCount: salon.reviewCount || 0,
    address: formatSalonAddress(addr),
    city,
    minPrice,
    topServices,
    nextAvailable,
    distance: salon.distance ?? null,
    latitude: salon.locationCoordinates?.latitude
      ? parseFloat(salon.locationCoordinates.latitude)
      : null,
    longitude: salon.locationCoordinates?.longitude
      ? parseFloat(salon.locationCoordinates.longitude)
      : null,
    shareUrl: buildSalonShareUrl(salon, baseURL),
  };
};

const inferSearchCity = (search, salons) => {
  const term = (search || "").trim();
  if (!term || !salons.length) return null;

  const lower = term.toLowerCase();
  const citiesFromResults = [
    ...new Set(
      salons.map((s) => (s.city || "").trim()).filter(Boolean)
    ),
  ];

  const cityMatch = citiesFromResults.find((city) =>
    city.toLowerCase().includes(lower)
  );
  if (cityMatch) return cityMatch;

  // Recherche par nom de salon : afficher la ville du (des) résultat(s), pas le texte saisi
  if (citiesFromResults.length === 1) return citiesFromResults[0];
  if (citiesFromResults.length > 1) {
    const uniqueLower = new Set(citiesFromResults.map((c) => c.toLowerCase()));
    if (uniqueLower.size === 1) return citiesFromResults[0];
  }

  return salons[0]?.city?.trim() || null;
};

const sumReviewCount = (salons) =>
  salons.reduce((acc, s) => acc + (s.reviewCount || 0), 0);

const fetchExpertsForCategory = async ({
  categoryId,
  search,
  limit = 16,
  salonIdsFilter = null,
}) => {
  const serviceObjectIds = await getCategoryServiceIds(categoryId);
  if (!serviceObjectIds.length) return [];

  let salonQuery = {
    isDelete: false,
    isActive: true,
    "serviceIds.id": { $in: serviceObjectIds },
  };
  salonQuery = appendSalonSearchFilter(salonQuery, search);

  let salonIds = salonIdsFilter;
  if (!salonIds) {
    const salons = await Salon.find(salonQuery).select("_id").lean();
    salonIds = salons.map((s) => s._id);
  }
  if (!salonIds.length) return [];

  const experts = await Expert.find({
    isDelete: false,
    isBlock: false,
    salonId: { $in: salonIds },
    serviceId: { $in: serviceObjectIds },
  })
    .populate({
      path: "salonId",
      select: "name addressDetails isActive isDelete",
    })
    .select("fname lname image review reviewCount salonId")
    .sort({ review: -1, reviewCount: -1 })
    .limit(limit)
    .lean();

  return experts
    .filter((e) => e.salonId && e.salonId.isActive && !e.salonId.isDelete)
    .map((e) => {
      const salon = e.salonId;
      const baseURL = (process.env.baseURL || "https://skedisy.com").replace(
        /\/+$/,
        ""
      );
      return {
        _id: e._id,
        name: `${e.fname || ""} ${e.lname || ""}`.trim(),
        image: e.image || "",
        review: e.review || 0,
        reviewCount: e.reviewCount || 0,
        salonName: salon.name || "",
        city: salon.addressDetails?.city || "",
        shareUrl: buildSalonShareUrl(salon, baseURL),
      };
    });
};

const renderSalonCardHtml = (salon, { currency, priceFromLabel, noImageLabel }) => {
  const avatar = salon.avatarImage || salon.mainImage || "";
  const realizations = salon.realizations?.length
    ? salon.realizations
    : avatar
      ? [avatar]
      : salon.mainImage
        ? [salon.mainImage]
        : [];
  const salonUrl = salon.shareUrl || "#";
  const multi = realizations.length > 1;
  const fallbackShot = avatar || salon.mainImage || "";

  const shotsHtml = realizations.length
    ? realizations
        .map(
          (url, i) =>
            `<a href="${escapeHtml(salonUrl)}" class="sq-salon-card-v3__shot-link${
              i === 0 ? " is-active" : ""
            }" data-shot-index="${i}" tabindex="${i === 0 ? "0" : "-1"}">
              <img src="${escapeHtml(url)}" alt="" class="sq-salon-card-v3__shot" loading="${
              i === 0 ? "eager" : "lazy"
            }" onerror="(function(img){var fb=${JSON.stringify(
              fallbackShot
            )};if(fb&&img.src!==fb){img.onerror=null;img.src=fb;}else{img.closest('.sq-salon-card-v3__shot-link')?.remove();}})(this)">
            </a>`
        )
        .join("")
    : `<div class="salon-card-image-placeholder">${escapeHtml(noImageLabel)}</div>`;

  const carouselNav = multi
    ? `<button type="button" class="sq-salon-card-v3__nav sq-salon-card-v3__nav--prev" aria-label="Previous" data-carousel-prev>‹</button>
       <button type="button" class="sq-salon-card-v3__nav sq-salon-card-v3__nav--next" aria-label="Next" data-carousel-next>›</button>
       <div class="sq-salon-card-v3__dots" aria-hidden="true">${realizations
         .map(
           (_, i) =>
             `<span class="sq-salon-card-v3__dot${i === 0 ? " is-active" : ""}" data-dot="${i}"></span>`
         )
         .join("")}</div>`
    : "";

  const avatarHtml = avatar
    ? `<img src="${escapeHtml(avatar)}" alt="" class="sq-salon-card-v3__avatar-img" loading="lazy" onerror="this.parentElement.classList.add('sq-salon-card-v3__avatar--fallback')">`
    : `<span class="sq-salon-card-v3__avatar-fallback" aria-hidden="true">${escapeHtml(
        (salon.name || "?").charAt(0)
      )}</span>`;

  const ratingHtml =
    salon.review > 0
      ? `<span class="sq-salon-card-v3__rating"><span aria-hidden="true">★</span> ${salon.review.toFixed(
          1
        )}${salon.reviewCount ? ` (${salon.reviewCount})` : ""}</span>`
      : "";

  const services = Array.isArray(salon.topServices) ? salon.topServices : [];
  const servicesHtml = services.length
    ? `<ul class="sq-salon-card-v3__services">${services
        .map((svc) => {
          const svcUrl = svc.id
            ? `${salonUrl}?serviceId=${encodeURIComponent(svc.id)}&book=1`
            : salonUrl;
          const price =
            svc.price != null
              ? `<span class="sq-salon-card-v3__svc-price">${escapeHtml(currency)}${svc.price}</span>`
              : "";
          const dur = svc.durationLabel
            ? `<span class="sq-salon-card-v3__svc-dur">${escapeHtml(svc.durationLabel)}</span>`
            : "";
          const next = svc.nextAvailable
            ? `<span class="sq-salon-card-v3__svc-next">${escapeHtml(svc.nextAvailable)}</span>`
            : salon.nextAvailable
              ? `<span class="sq-salon-card-v3__svc-next">${escapeHtml(salon.nextAvailable)}</span>`
              : "";
          return `<li>
            <a class="sq-salon-card-v3__svc" href="${escapeHtml(svcUrl)}">
              <span class="sq-salon-card-v3__svc-name">${escapeHtml(svc.name)}</span>
              ${dur}
              ${price}
              ${next}
            </a>
          </li>`;
        })
        .join("")}</ul>`
    : salon.minPrice != null
      ? `<p class="sq-salon-card-v3__from">${escapeHtml(priceFromLabel)} ${escapeHtml(
          currency
        )}${salon.minPrice}</p>`
      : "";

  return `
    <article class="salon-card sq-salon-card-v2 sq-salon-card-v3 sq-salon-card-v3--split" data-salon-id="${escapeHtml(
      salon._id
    )}">
      <div class="sq-salon-card-v3__media${multi ? " sq-salon-card-v3__media--carousel" : ""}${
        realizations.length ? "" : " sq-salon-card-v2__media--fallback"
      }" data-carousel ${multi ? `data-carousel-count="${realizations.length}" data-carousel-index="0"` : ""}>
        ${shotsHtml}
        ${carouselNav}
      </div>
      <div class="sq-salon-card-v3__body">
        <div class="sq-salon-card-v3__identity">
          <a href="${escapeHtml(salonUrl)}" class="sq-salon-card-v3__avatar">${avatarHtml}</a>
          <div class="sq-salon-card-v3__identity-text">
            <h3 class="salon-card-name sq-salon-card-v3__name">
              <a href="${escapeHtml(salonUrl)}">${escapeHtml(salon.name)}</a>
            </h3>
            ${
              salon.address
                ? `<p class="salon-card-address sq-salon-card-v3__address">${escapeHtml(
                    salon.address
                  )}</p>`
                : ""
            }
            ${ratingHtml}
          </div>
        </div>
        ${servicesHtml}
      </div>
    </article>
  `;
};

const renderExpertCardHtml = (expert, { expertAtSalonLabel }) => {
  const imageHtml = expert.image
    ? `<img src="${expert.image}" alt="${expert.name.replace(/"/g, "&quot;")}" class="sq-expert-card__img" loading="lazy" onerror="this.classList.add('sq-expert-card__img--error')">`
    : `<div class="sq-expert-card__placeholder" aria-hidden="true">${(expert.name || "?").charAt(0)}</div>`;
  const ratingHtml =
    expert.review > 0
      ? `<span class="sq-expert-card__rating">★ ${expert.review.toFixed(1)} (${expert.reviewCount})</span>`
      : "";
  const salonLine = expert.salonName
    ? `<span class="sq-expert-card__salon">${expertAtSalonLabel(expert.salonName)}</span>`
    : "";

  return `
    <a href="${expert.shareUrl}" class="sq-expert-card">
      <div class="sq-expert-card__avatar">${imageHtml}</div>
      <div class="sq-expert-card__body">
        <span class="sq-expert-card__name">${expert.name}</span>
        ${ratingHtml}
        ${salonLine}
      </div>
    </a>
  `;
};

//get all category
exports.getAll = async (req, res) => {
  try {
    const language = req.query.language || 'en'; // Get language from query parameter, default to 'en'
    
    const categories = await Category.find({ isDelete: { $ne: true }, status: true }).select("-isDelete -updatedAt -createdAt").sort({
      createdAt: -1,
    });

    // Map categories with translated names
    const translatedCategories = categories.map(category => ({
      _id: category._id,
      name: getTranslatedName(category, language),
      image: category.image,
      status: category.status,
    }));

    return res.status(200).send({
      status: true,
      message: "Categories Found",
      data: translatedCategories,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};

// Get salons by category with search
exports.getSalonsByCategory = async (req, res) => {
  try {
    const categoryId = req.query.categoryId;
    const search = req.query.search || "";
    const locationTerm = (req.query.location || req.query.city || "").trim();
    const latitude = req.query.latitude;
    const longitude = req.query.longitude;
    const serviceIdFilter = (req.query.serviceId || "").trim();
    const minRating = parseFloat(req.query.minRating) || 0;
    const minPrice = parseFloat(req.query.minPrice) || 0;
    const maxPrice = parseFloat(req.query.maxPrice) || 0;
    const sort = req.query.sort || "best";
    const availableToday =
      req.query.availableToday === "1" ||
      req.query.availableToday === "true";
    const start = parseInt(req.query.start) || 0;
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const language = req.query.language || "en";

    if (!categoryId) {
      return res.status(200).json({
        status: false,
        message: "Category ID is required",
      });
    }

    const category = await Category.findById(categoryId);
    if (!category || category.isDelete || !category.status) {
      return res.status(200).json({
        status: false,
        message: "Category not found",
      });
    }

    let services = await Service.find({
      categoryId: categoryId,
      isDelete: false,
      status: true,
    })
      .select("_id name nameEn nameFr namePt")
      .lean();

    const serviceSubtypes = services.slice(0, 16).map((s) => ({
      _id: s._id,
      name: getTranslatedServiceName(s, language) || s.name || "",
    }));

    let serviceIds = services.map((s) => s._id);

    if (serviceIdFilter && mongoose.Types.ObjectId.isValid(serviceIdFilter)) {
      const sid = new mongoose.Types.ObjectId(serviceIdFilter);
      if (serviceIds.some((id) => String(id) === String(sid))) {
        serviceIds = [sid];
      } else {
        serviceIds = [];
      }
    }

    if (serviceIds.length === 0) {
      const translatedCategoryName = getTranslatedName(category, language);
      return res.status(200).json({
        status: true,
        message: "No salons found for this category",
        category: {
          _id: category._id,
          name: translatedCategoryName,
          image: category.image,
          description:
            category.description ||
            `${translatedCategoryName} services available at top-rated salons`,
        },
        salons: [],
        services: serviceSubtypes,
        total: 0,
        filters: { minRating, minPrice, maxPrice, sort, availableToday },
      });
    }

    let searchQuery = {
      isDelete: false,
      isActive: true,
      "serviceIds.id": { $in: serviceIds },
    };

    const andParts = [];
    if (search && search.trim() !== "") {
      const searchTerm = search.trim();
      andParts.push({
        $or: [
          { name: { $regex: searchTerm, $options: "i" } },
          { "addressDetails.addressLine1": { $regex: searchTerm, $options: "i" } },
          { "addressDetails.city": { $regex: searchTerm, $options: "i" } },
          { "addressDetails.country": { $regex: searchTerm, $options: "i" } },
          { about: { $regex: searchTerm, $options: "i" } },
        ],
      });
    }
    if (locationTerm) {
      andParts.push({
        $or: [
          { "addressDetails.city": { $regex: locationTerm, $options: "i" } },
          { "addressDetails.addressLine1": { $regex: locationTerm, $options: "i" } },
          { "addressDetails.landMark": { $regex: locationTerm, $options: "i" } },
          { "addressDetails.state": { $regex: locationTerm, $options: "i" } },
        ],
      });
    }
    if (andParts.length) {
      searchQuery.$and = andParts;
    }

    let salons = await Salon.find(searchQuery)
      .populate({
        path: "serviceIds.id",
        match: { categoryId: categoryId, isDelete: false, status: true },
        select: "name nameEn nameFr namePt duration categoryId price",
      })
      .select(
        "name mainImage image heroImage review reviewCount addressDetails locationCoordinates about serviceIds salonTime"
      )
      .limit(120)
      .lean();

    salons = salons.filter(
      (salon) => salon.serviceIds && salon.serviceIds.some((s) => s.id !== null)
    );

    if (serviceIdFilter) {
      salons = salons.filter((salon) =>
        (salon.serviceIds || []).some(
          (s) => s.id && String(s.id._id || s.id) === String(serviceIdFilter)
        )
      );
    }

    salons = attachSalonDistances(salons, latitude, longitude);

    const baseURL = (process.env.baseURL || "https://skedisy.com").replace(/\/+$/, "");
    let formattedSalons = salons.map((salon) =>
      formatSalonForCategory(salon, { baseURL, language })
    );

    formattedSalons = applySalonDiscoveryFilters(formattedSalons, {
      minRating,
      minPrice,
      maxPrice,
      sort,
      availableToday,
    });

    const total = formattedSalons.length;
    formattedSalons = formattedSalons.slice(start * limit, start * limit + limit);

    const translatedCategoryName = getTranslatedName(category, language);
    const searchCity =
      locationTerm || inferSearchCity(search, formattedSalons);

    return res.status(200).json({
      status: true,
      message: "Salons retrieved successfully",
      category: {
        _id: category._id,
        name: translatedCategoryName,
        image: category.image,
        description:
          category.description ||
          `${translatedCategoryName} services available at top-rated salons`,
      },
      salons: formattedSalons,
      services: serviceSubtypes,
      total,
      totalReviews: sumReviewCount(formattedSalons),
      searchCity,
      filters: { minRating, minPrice, maxPrice, sort, availableToday, serviceId: serviceIdFilter || null },
    });
  } catch (error) {
    console.error("[Get Salons By Category] Error:", error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

exports.getExpertsByCategory = async (req, res) => {
  try {
    const categoryId = req.query.categoryId;
    const search = req.query.search || "";
    const limit = parseInt(req.query.limit, 10) || 16;
    const language = req.query.language || "fr";

    if (!categoryId) {
      return res.status(200).json({
        status: false,
        message: "Category ID is required",
      });
    }

    const category = await Category.findById(categoryId);
    if (!category || category.isDelete || !category.status) {
      return res.status(200).json({
        status: false,
        message: "Category not found",
      });
    }

    const experts = await fetchExpertsForCategory({
      categoryId,
      search,
      limit,
    });
    
    return res.status(200).json({
      status: true,
      message: "Experts retrieved successfully",
      category: {
        _id: category._id,
        name: getTranslatedName(category, language),
      },
      experts,
      total: experts.length,
    });
  } catch (error) {
    console.error("[Get Experts By Category] Error:", error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

// Serve category page with salon listings
exports.serveCategoryPage = async (req, res) => {
  try {
    const slugWithId = req.params.slugWithId; // Now expecting /category/:slugWithId

    if (!slugWithId) {
      return res.status(404).send("Category not found");
    }

    // Skip if it's a known API route or static file path
    const excludedPaths = ['admin', 'user', 'api', '.well-known', 'favicon.ico', 'robots.txt', 'salon'];
    if (excludedPaths.includes(slugWithId.toLowerCase())) {
      return res.status(404).send("Not found");
    }

    // Check if it's the old format (24-character ObjectId) - reject it
    if (/^[0-9a-fA-F]{24}$/i.test(slugWithId)) {
      console.log("[Category Page] Old format detected, rejecting:", slugWithId);
      return res.status(404).send("Category not found. Please use the new URL format.");
    }

    // Extract short ID (last part after hyphen, should be 6 hex characters)
    const parts = slugWithId.split("-");
    const shortId = parts[parts.length - 1];
    
    // Validate short ID format (6 hex characters)
    if (!/^[0-9a-fA-F]{6}$/.test(shortId)) {
      console.log("[Category Page] Invalid short ID format:", shortId, "from slug:", slugWithId);
      return res.status(404).send("Category not found");
    }
    
    console.log("[Category Page] Looking for category with short ID:", shortId);
    const fullCategoryId = await findCategoryByShortId(shortId);
    
    if (!fullCategoryId) {
      console.log("[Category Page] Category not found for short ID:", shortId);
      return res.status(404).send("Category not found");
    }
    
    console.log("[Category Page] Found category:", fullCategoryId);

    const search = req.query.search || "";
    const locationTerm = (req.query.location || "").trim();
    const latitude = req.query.latitude;
    const longitude = req.query.longitude;
    const serviceIdFilter = (req.query.serviceId || "").trim();
    const minRating = parseFloat(req.query.minRating) || 0;
    const minPrice = parseFloat(req.query.minPrice) || 0;
    const maxPrice = parseFloat(req.query.maxPrice) || 0;
    const sort = req.query.sort || "best";
    const availableToday =
      req.query.availableToday === "1" ||
      req.query.availableToday === "true";

    // Get category details
    const category = await Category.findOne({
      _id: fullCategoryId,
      isDelete: false,
      status: true,
    });
    
    if (!category) {
      return res.status(404).send("Category not found");
    }

    const language = resolveLang(req.query.lang || req.query.language);

    // Get salons for this category (limit to 120 then filter/sort)
    const serviceDocs = await Service.find({
      categoryId: fullCategoryId,
      isDelete: false,
      status: true,
    })
      .select("_id name nameEn nameFr namePt")
      .lean();

    const serviceSubtypes = serviceDocs.slice(0, 16).map((s) => ({
      _id: String(s._id),
      name: getTranslatedServiceName(s, language) || s.name || "",
    }));

    let serviceObjectIds = serviceDocs.map((s) => s._id);
    if (serviceIdFilter && mongoose.Types.ObjectId.isValid(serviceIdFilter)) {
      const sid = new mongoose.Types.ObjectId(serviceIdFilter);
      if (serviceObjectIds.some((id) => String(id) === String(sid))) {
        serviceObjectIds = [sid];
      }
    }

    let searchQuery = {
      isDelete: false,
      isActive: true,
      "serviceIds.id": { $in: serviceObjectIds },
    };

    searchQuery = appendSalonSearchFilter(searchQuery, search);
    if (locationTerm) {
      const locOr = {
        $or: [
          { "addressDetails.city": { $regex: locationTerm, $options: "i" } },
          { "addressDetails.addressLine1": { $regex: locationTerm, $options: "i" } },
          { "addressDetails.landMark": { $regex: locationTerm, $options: "i" } },
          { "addressDetails.state": { $regex: locationTerm, $options: "i" } },
        ],
      };
      if (searchQuery.$and) searchQuery.$and.push(locOr);
      else if (searchQuery.$or) {
        searchQuery = { ...searchQuery, $and: [{ $or: searchQuery.$or }, locOr] };
        delete searchQuery.$or;
      } else {
        Object.assign(searchQuery, locOr);
      }
    }

    let salons = await Salon.find(searchQuery)
      .populate({
        path: "serviceIds.id",
        match: { categoryId: fullCategoryId, isDelete: false, status: true },
        select: "name nameEn nameFr namePt duration price",
      })
      .select(
        "name mainImage image heroImage review reviewCount addressDetails locationCoordinates about serviceIds salonTime"
      )
      .limit(120)
      .lean();

    salons = salons.filter(salon => 
      salon.serviceIds && salon.serviceIds.some(s => s.id !== null)
    );

    if (serviceIdFilter) {
      salons = salons.filter((salon) =>
        (salon.serviceIds || []).some(
          (s) => s.id && String(s.id._id || s.id) === String(serviceIdFilter)
        )
      );
    }

    salons = attachSalonDistances(salons, latitude, longitude);

    const baseURL = (process.env.baseURL || "https://skedisy.com").replace(/\/+$/, "");
    let formattedSalons = salons.map((salon) =>
      formatSalonForCategory(salon, { baseURL, language })
    );
    formattedSalons = applySalonDiscoveryFilters(formattedSalons, {
      minRating,
      minPrice,
      maxPrice,
      sort,
      availableToday,
    }).slice(0, 50);
    const copy = getWebCopy(language);
    const categoryDisplayName = getTranslatedName(category, language) || category.name;
    const categorySlug = generateSlug(categoryDisplayName);
    const categoryShortId = category._id.toString().substring(0, 6);
    const categorySlugWithId = `${categorySlug}-${categoryShortId}`;
    const categoryUrl = `${baseURL}/category/${categorySlugWithId}`;
    const currency = global.settingJSON?.currencySymbol || "€";
    const priceFromLabel = language === "fr" ? "À partir de" : "From";
    const priceDisclaimer =
      language === "fr"
        ? "Prix indicatif — le montant définitif sera confirmé par le salon."
        : "Indicative price — the final amount will be confirmed with the salon.";
    const totalReviews = sumReviewCount(formattedSalons);
    const searchCity = locationTerm || inferSearchCity(search, formattedSalons);
    const experts = await fetchExpertsForCategory({
      categoryId: fullCategoryId,
      search,
      limit: 16,
      salonIdsFilter: formattedSalons.map((s) => s._id),
    });

    const cardOpts = {
      currency,
      priceFromLabel,
      noImageLabel: copy.noImage,
      nextLabel: copy.nextAvailable || (language === "fr" ? "Prochain" : "Next"),
    };
    const salonsHtml =
      formattedSalons.length > 0
        ? formattedSalons
            .map((salon) => renderSalonCardHtml(salon, cardOpts))
            .join("")
        : `<div class="no-results"><p>${copy.noSalonsCategory}</p></div>`;

    const expertsHtml =
      experts.length > 0
        ? experts
            .map((expert) =>
              renderExpertCardHtml(expert, {
                expertAtSalonLabel: copy.expertAtSalon,
              })
            )
            .join("")
        : `<p class="sq-category-discover__empty">${copy.noExpertsCategory}</p>`;

    const searchMessageHtml = searchCity
      ? `<p class="sq-category-discover__city-msg">${copy.resultsInCity(searchCity)}</p>`
      : "";
    const statsLabel = copy.resultsCount(formattedSalons.length, totalReviews);
    const categoryDescription = category.description || copy.categoryMetaDesc(categoryDisplayName);
    const pageTitle = copy.discoverSalons(categoryDisplayName);
    const pageLead = copy.categoryPageLead(categoryDisplayName);
    const idfBanner = idfBannerHtml(copy);
    const returnPath =
      `/category/${categorySlugWithId}` + (language !== "fr" ? `?lang=${language}` : "");
    const clientAuth = authUrls(baseURL, returnPath, language);
    const footerHtml = skedisyFooterHtml(baseURL, copy);
    const categoryImage = category.image || `${baseURL}/logo.png`;

    const html = `<!DOCTYPE html>
<html lang="${language}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${copy.categoryMetaTitle(categoryDisplayName).replace(/"/g, '&quot;')}</title>
    <meta name="description" content="${categoryDescription.replace(/"/g, '&quot;')}">
    <meta name="keywords" content="${copy.categoryMetaKeywords(categoryDisplayName)}">
    <link rel="canonical" href="${categoryUrl}">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="${categoryUrl}">
    <meta property="og:title" content="${categoryDisplayName} - Skedisy">
    <meta property="og:description" content="${categoryDescription.replace(/"/g, '&quot;')}">
    <meta property="og:image" content="${categoryImage}">
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="${categoryUrl}">
    <meta property="twitter:title" content="${categoryDisplayName} - Skedisy">
    <meta property="twitter:description" content="${categoryDescription.replace(/"/g, '&quot;')}">
    <meta property="twitter:image" content="${categoryImage}">
    
    <!-- Structured Data (Schema.org) -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "${categoryDisplayName} Services",
      "description": "${categoryDescription.replace(/"/g, '\\"')}",
      "url": "${categoryUrl}",
      "image": "${categoryImage}",
      "mainEntity": {
        "@type": "ItemList",
        "itemListElement": ${JSON.stringify(formattedSalons.slice(0, 10).map((salon, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "item": {
            "@type": "LocalBusiness",
            "name": salon.name,
            "url": salon.shareUrl
          }
        })))}
      }
    }
    </script>
    
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="">
    <link rel="stylesheet" href="${baseURL}/styles.css">
    <link rel="stylesheet" href="${baseURL}/intent-hub.css">
    <link rel="stylesheet" href="${baseURL}/public-pages.css">
</head>
<body class="sk-public-page sq-page">
    <!-- Login Button Above QR Code -->
    <div class="login-above-qr">
        <a href="${clientAuth.login}" class="btn-login-above">${copy.headerLogin}</a>
    </div>
    
    <div class="qr-topright qr-topright--client">
        <div class="qr-top-flex">
            <div class="qr-top-block" data-app-type="customer" onclick="openPhoneSelection('customer')">
                <div class="qr-code-wrapper">
                    <div id="qr-customer-top"></div>
                    <img class="qr-logo-overlay" src="${baseURL}/images/logo.png" alt="Skedisy">
                </div>
                <div class="qr-label">${copy.qrCustomer}</div>
            </div>
        </div>
    </div>
    
    <!-- Navigation -->
    <nav class="navbar sq-navbar">
        <div class="nav-container">
            <div class="nav-logo">
                <a href="${baseURL}" style="text-decoration: none; color: inherit;">
                    <h2>Skedisy</h2>
                </a>
            </div>
            <!-- Desktop Categories Menu -->
            <div class="nav-menu-center desktop-only" id="categoriesMenu">
                <!-- Categories will be loaded dynamically -->
            </div>
            <!-- Mobile Menu - Hamburger positioned where login button was -->
            <div class="mobile-menu-wrapper">
                <div class="hamburger mobile-only" id="mobileMenuToggle">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </div>
        <!-- Mobile Slide-in Menu -->
        <div class="mobile-menu-overlay" id="mobileMenuOverlay"></div>
        <div class="mobile-menu" id="mobileMenu">
            <div class="mobile-menu-header">
                <h3>${(copy.forClients || "Pour les clientes").replace(/</g, "&lt;")}</h3>
                <div class="mobile-menu-header-right">
                    <button class="mobile-menu-close" id="mobileMenuClose" type="button" aria-label="Fermer">&times;</button>
                </div>
            </div>
            <div class="mobile-menu-content mobile-menu-content--client">
                <a href="${clientAuth.login}" class="btn-login-mobile-menu">${copy.headerLogin}</a>
                <button type="button" class="btn-login-mobile-menu btn-mobile-action" data-mobile-download="customer">${copy.downloadAppCta || copy.bookOnApp || "Télécharger l'app"}</button>
                <div class="mobile-categories-panel">
                    <button type="button" class="btn-login-mobile-menu mobile-categories-toggle" id="mobileCategoriesToggle" aria-expanded="false" aria-controls="mobileCategoriesDrawer">
                        <span>${copy.filterServicesAll || copy.allCategoriesTab || "Toutes les catégories"}</span>
                        <i class="fas fa-chevron-down mobile-categories-toggle__icon" aria-hidden="true"></i>
                    </button>
                    <div class="mobile-categories-drawer" id="mobileCategoriesDrawer" hidden>
                        <div class="mobile-categories-drawer__head">
                            <span>${copy.filterServicesAll || copy.allCategoriesTab || "Toutes les catégories"}</span>
                            <button type="button" class="mobile-categories-drawer__close" id="mobileCategoriesClose" aria-label="Fermer">&times;</button>
                        </div>
                        <div class="mobile-categories" id="mobileCategories"></div>
                    </div>
                </div>
                <a href="${baseURL}/professionnel/" class="btn-login-mobile-menu btn-for-business-mobile">${copy.forBusiness || "Pour les professionnels"}</a>
            </div>
        </div>
    </nav>
    
    ${idfBanner}

    <main class="sq-category-discover">
        <header class="sq-category-discover__head sq-category-discover__head--with-img">
            <div class="sq-category-discover__head-img">
                <img src="${categoryImage}" alt="${categoryDisplayName.replace(/"/g, "&quot;")}" loading="lazy" onerror="this.style.display='none'">
                </div>
            <div class="sq-category-discover__head-text">
                <h1 class="sq-category-discover__title">${pageTitle}</h1>
                <p class="sq-category-discover__lead">${pageLead}</p>
            </div>
        </header>

        <div class="sq-category-discover__search-bar">
          <div class="sq-location-chip-wrap">
            <button type="button" class="sq-location-chip" id="homeLocationChip" aria-expanded="false" aria-controls="homeLocationPopover">
              <i class="fas fa-map-marker-alt" aria-hidden="true"></i>
              <span class="sq-location-chip__text">
                <span class="sq-location-chip__label">${copy.yourLocation}</span>
                <span class="sq-location-chip__value" id="homeLocationChipValue">${escapeHtml(locationTerm || "Paris")}</span>
              </span>
              <i class="fas fa-chevron-down sq-location-chip__chevron" aria-hidden="true"></i>
            </button>
            <div class="sq-location-popover" id="homeLocationPopover" hidden>
              <label class="sq-sr-only" for="homeLocationSearchInput">${copy.yourLocation}</label>
              <input type="text" id="homeLocationSearchInput" name="location" class="sq-location-popover__input" placeholder="${copy.locationPlaceholder.replace(/"/g, "&quot;")}" value="${escapeHtml(locationTerm)}" autocomplete="off">
              <button type="button" class="sq-btn sq-btn-fill sq-location-popover__apply" id="homeLocationApply">${copy.applyLocation}</button>
            </div>
          </div>
          <div class="sq-category-discover__search search-section">
            <div class="search-container sq-search-wrap">
                <i class="fas fa-search sq-search-wrap__icon" aria-hidden="true"></i>
                <input type="search" id="searchInput" class="search-input sq-search-wrap__input" placeholder="${copy.searchPlaceholder.replace(/"/g, "&quot;")}" value="${search.replace(/"/g, "&quot;")}" autocomplete="off">
            </div>
          </div>
        </div>

        <div class="sq-service-chips" id="serviceChips" role="list" aria-label="${copy.filterServices}">
          <button type="button" class="sq-service-chip${!serviceIdFilter ? " sq-service-chip--active" : ""}" data-service-id="" role="listitem">${copy.filterServicesAll}</button>
          ${serviceSubtypes
            .map(
              (svc) =>
                `<button type="button" class="sq-service-chip${
                  String(serviceIdFilter) === String(svc._id) ? " sq-service-chip--active" : ""
                }" data-service-id="${escapeHtml(svc._id)}" role="listitem">${escapeHtml(svc.name)}</button>`
            )
            .join("")}
        </div>
    
        <div class="sq-category-discover__toolbar">
            <div class="sq-category-discover__stats-wrap">
                <p class="sq-category-discover__stats" id="categoryStats">${statsLabel}</p>
                <div id="categorySearchMessage">${searchMessageHtml}</div>
            </div>
            <div class="sq-category-discover__toolbar-actions">
              <button type="button" class="sq-filter-btn" id="btnFilter" aria-expanded="false" aria-controls="filterPanel">
                <i class="fas fa-sliders-h" aria-hidden="true"></i>
                <span>${copy.filterBtn}</span>
              </button>
            </div>
        </div>

        <div class="sq-filter-panel" id="filterPanel" hidden>
          <label class="sq-filter-toggle">
            <input type="checkbox" id="filterAvailableToday" ${availableToday ? "checked" : ""}>
            <span>${copy.filterAvailableToday}</span>
          </label>
          <p class="sq-filter-panel__label">${copy.filterRating}</p>
          <div class="sq-filter-chips">
            <button type="button" class="sq-filter-chip${!minRating ? " sq-filter-chip--active" : ""}" data-filter="minRating" data-value="0">${copy.filterAll}</button>
            <button type="button" class="sq-filter-chip${minRating === 4 ? " sq-filter-chip--active" : ""}" data-filter="minRating" data-value="4">4+ ★</button>
            <button type="button" class="sq-filter-chip${minRating === 4.5 ? " sq-filter-chip--active" : ""}" data-filter="minRating" data-value="4.5">4,5+ ★</button>
          </div>
          <p class="sq-filter-panel__label">${copy.filterPrice}</p>
          <div class="sq-filter-chips">
            <button type="button" class="sq-filter-chip${!minPrice && !maxPrice ? " sq-filter-chip--active" : ""}" data-filter="price" data-min="0" data-max="0">${copy.filterPriceAll}</button>
            <button type="button" class="sq-filter-chip${maxPrice === 50 ? " sq-filter-chip--active" : ""}" data-filter="price" data-min="0" data-max="50">${copy.filterPriceUnder50}</button>
            <button type="button" class="sq-filter-chip${minPrice === 50 && maxPrice === 100 ? " sq-filter-chip--active" : ""}" data-filter="price" data-min="50" data-max="100">${copy.filterPrice50to100}</button>
            <button type="button" class="sq-filter-chip${minPrice === 100 && !maxPrice ? " sq-filter-chip--active" : ""}" data-filter="price" data-min="100" data-max="0">${copy.filterPriceOver100}</button>
          </div>
          <p class="sq-filter-panel__label">${copy.filterSort}</p>
          <div class="sq-filter-chips">
            <button type="button" class="sq-filter-chip${sort === "best" ? " sq-filter-chip--active" : ""}" data-filter="sort" data-value="best">${copy.sortBest}</button>
            <button type="button" class="sq-filter-chip${sort === "distance" ? " sq-filter-chip--active" : ""}" data-filter="sort" data-value="distance">${copy.sortDistance}</button>
            <button type="button" class="sq-filter-chip${sort === "rating" ? " sq-filter-chip--active" : ""}" data-filter="sort" data-value="rating">${copy.sortRating}</button>
            <button type="button" class="sq-filter-chip${sort === "reviews" ? " sq-filter-chip--active" : ""}" data-filter="sort" data-value="reviews">${copy.sortReviews}</button>
            <button type="button" class="sq-filter-chip${sort === "price" ? " sq-filter-chip--active" : ""}" data-filter="sort" data-value="price">${copy.sortPrice}</button>
          </div>
        </div>
    
        <div class="sq-category-discover__main sq-category-discover__main--split" id="categoryMain">
            <div class="sq-category-discover__list-wrap">
        <p class="price-disclaimer">${priceDisclaimer}</p>
                <div class="salons-grid sq-salons-grid--split" id="salonsGrid">
            ${salonsHtml}
                </div>
        </div>
            <div id="categoryMap" class="sq-category-discover__map" aria-hidden="false"></div>
    </div>
    </main>

    <div class="sked-app-banner">
        <h3>${copy.appBannerTitle}</h3>
        <p>${copy.appBannerDesc}</p>
        <a href="${baseURL}/#download-customer">${copy.bookOnApp}</a>
    </div>

    ${footerHtml}

    <script>
        window.SKEDISY_CATEGORY_PAGE = {
            categoryId: "${category._id}",
            language: "${language}",
            initialSalons: ${JSON.stringify(formattedSalons)},
            initialExperts: ${JSON.stringify(experts)},
            initialServices: ${JSON.stringify(serviceSubtypes)},
            initialSearchCity: ${JSON.stringify(searchCity)},
            initialTotalReviews: ${totalReviews},
            initialFilters: {
              minRating: ${minRating},
              minPrice: ${minPrice},
              maxPrice: ${maxPrice},
              sort: ${JSON.stringify(sort)},
              availableToday: ${availableToday ? "true" : "false"},
              serviceId: ${JSON.stringify(serviceIdFilter || "")}
            },
            copy: {
                resultsInCityTpl: ${JSON.stringify(copy.resultsInCityTpl)},
                expertAtSalonTpl: ${JSON.stringify(copy.expertAtSalonTpl)},
                mapView: ${JSON.stringify(copy.mapView)},
                listView: ${JSON.stringify(copy.listView)},
                noSalonsSearch: ${JSON.stringify(copy.noSalonsSearch)},
                noExpertsCategory: ${JSON.stringify(copy.noExpertsCategory)},
                filterBtn: ${JSON.stringify(copy.filterBtn)},
                filterServicesAll: ${JSON.stringify(copy.filterServicesAll)},
                salonsLoading: ${JSON.stringify(language === "fr" ? "Chargement des salons…" : "Loading salons…")}
            },
            render: {
                currency: ${JSON.stringify(currency)},
                priceFromLabel: ${JSON.stringify(priceFromLabel)},
                noImageLabel: ${JSON.stringify(copy.noImage)},
                nextLabel: ${JSON.stringify(copy.nextAvailable || "Prochain")}
            }
        };
    </script>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
    <script src="${baseURL}/salon-map-ui.js"></script>
    <script src="${baseURL}/location-chip.js"></script>
    <script src="${baseURL}/category-page.js"></script>
    <script type="module" src="${baseURL}/qr-code-init.js"></script>
    <script src="${baseURL}/script.js"></script>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (error) {
    console.error("[Category Page] Error:", error);
    res.status(500).send("Error loading category page");
  }
};

const COUNTABLE_BOOKING_STATUSES = ["confirm", "completed"];

const buildServiceNameRegex = (term) => ({
  isDelete: false,
  status: true,
  $or: [
    { name: { $regex: term, $options: "i" } },
    { nameEn: { $regex: term, $options: "i" } },
    { nameFr: { $regex: term, $options: "i" } },
    { namePt: { $regex: term, $options: "i" } },
  ],
});

/** Suggestions recherche : top 5 catégories + top 10 prestations (réservations) */
exports.getSearchSuggestions = async (req, res) => {
  try {
    const language = resolveLang(req.query.lang || req.query.language);

    const topServicesAgg = await Booking.aggregate([
      { $match: { isDelete: false, status: { $in: COUNTABLE_BOOKING_STATUSES } } },
      { $unwind: "$serviceId" },
      { $group: { _id: "$serviceId", bookings: { $sum: 1 } } },
      { $sort: { bookings: -1 } },
      { $limit: 10 },
    ]);

    let services = [];
    if (topServicesAgg.length) {
      const serviceIds = topServicesAgg.map((row) => row._id);
      const serviceDocs = await Service.find({
        _id: { $in: serviceIds },
        isDelete: false,
        status: true,
      })
        .select("name nameEn nameFr namePt categoryId")
        .lean();
      const order = new Map(
        topServicesAgg.map((row, index) => [String(row._id), index])
      );
      services = serviceDocs
        .sort(
          (a, b) =>
            (order.get(String(a._id)) ?? 99) - (order.get(String(b._id)) ?? 99)
        )
        .map((service) => {
          const stats = topServicesAgg.find(
            (row) => String(row._id) === String(service._id)
          );
          return {
            _id: service._id,
            name: getTranslatedServiceName(service, language),
            categoryId: service.categoryId,
            bookings: stats?.bookings || 0,
          };
        });
    }

    if (services.length < 10) {
      const existingIds = services.map((s) => s._id);
      const fallbackServices = await Service.find({
        _id: { $nin: existingIds },
        isDelete: false,
        status: true,
      })
        .select("name nameEn nameFr namePt categoryId")
        .sort({ createdAt: -1 })
        .limit(10 - services.length)
        .lean();
      services = services.concat(
        fallbackServices.map((service) => ({
          _id: service._id,
          name: getTranslatedServiceName(service, language),
          categoryId: service.categoryId,
          bookings: 0,
        }))
      );
    }

    const topCategoriesAgg = await Booking.aggregate([
      { $match: { isDelete: false, status: { $in: COUNTABLE_BOOKING_STATUSES } } },
      { $unwind: "$serviceId" },
      {
        $lookup: {
          from: "services",
          localField: "serviceId",
          foreignField: "_id",
          as: "svc",
        },
      },
      { $unwind: "$svc" },
      { $match: { "svc.categoryId": { $ne: null }, "svc.isDelete": false } },
      { $group: { _id: "$svc.categoryId", bookings: { $sum: 1 } } },
      { $sort: { bookings: -1 } },
      { $limit: 5 },
    ]);

    let categories = [];
    if (topCategoriesAgg.length) {
      const categoryIds = topCategoriesAgg.map((row) => row._id);
      const categoryDocs = await Category.find({
        _id: { $in: categoryIds },
        isDelete: false,
        status: true,
      })
        .select("name nameEn nameFr namePt image")
        .lean();
      const order = new Map(
        topCategoriesAgg.map((row, index) => [String(row._id), index])
      );
      categories = categoryDocs
        .sort(
          (a, b) =>
            (order.get(String(a._id)) ?? 99) - (order.get(String(b._id)) ?? 99)
        )
        .map((category) => {
          const translated = getTranslatedName(category, language);
          const stats = topCategoriesAgg.find(
            (row) => String(row._id) === String(category._id)
          );
          return {
            _id: category._id,
            name: translated,
            image: category.image || "",
            bookings: stats?.bookings || 0,
            url: `/category/${generateSlug(translated)}-${category._id
              .toString()
              .substring(0, 6)}`,
          };
        });
    }

    if (categories.length < 5) {
      const existingIds = categories.map((c) => c._id);
      const fallbackCategories = await Category.find({
        _id: { $nin: existingIds },
        isDelete: false,
        status: true,
      })
        .select("name nameEn nameFr namePt image")
        .sort({ createdAt: -1 })
        .limit(5 - categories.length)
        .lean();
      categories = categories.concat(
        fallbackCategories.map((category) => {
          const translated = getTranslatedName(category, language);
          return {
            _id: category._id,
            name: translated,
            image: category.image || "",
            bookings: 0,
            url: `/category/${generateSlug(translated)}-${category._id
              .toString()
              .substring(0, 6)}`,
          };
        })
      );
    }

    return res.status(200).json({
      status: true,
      categories,
      services,
    });
  } catch (error) {
    console.error("[Search Suggestions] Error:", error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

/** Recherche publique salons (salon + prestation + localisation) — page /recherche */
exports.searchSalonsPublic = async (req, res) => {
  try {
    const unifiedQ = (req.query.q || "").trim();
    const salonTerm = (req.query.salon || "").trim();
    const serviceTerm = (req.query.service || req.query.prestation || "").trim();
    const locationTerm = (req.query.location || req.query.city || "").trim();
    const latitude = req.query.latitude;
    const longitude = req.query.longitude;
    const minRating = parseFloat(req.query.minRating) || 0;
    const minPrice = parseFloat(req.query.minPrice) || 0;
    const maxPrice = parseFloat(req.query.maxPrice) || 0;
    const sort = req.query.sort || "best";
    const language = resolveLang(req.query.lang || req.query.language);
    const baseURL = (process.env.baseURL || "https://skedisy.com").replace(/\/+$/, "");

    let query = { isDelete: false, isActive: true };
    const andConditions = [];

    if (unifiedQ && !salonTerm && !serviceTerm) {
      const matchedServices = await Service.find(buildServiceNameRegex(unifiedQ)).select(
        "_id"
      );
      const serviceIds = matchedServices.map((s) => s._id);
      const orClause = [
        { name: { $regex: unifiedQ, $options: "i" } },
        { about: { $regex: unifiedQ, $options: "i" } },
      ];
      if (serviceIds.length) {
        orClause.push({ "serviceIds.id": { $in: serviceIds } });
      }
      andConditions.push({ $or: orClause });
    } else if (salonTerm) {
      andConditions.push({
        $or: [
          { name: { $regex: salonTerm, $options: "i" } },
          { about: { $regex: salonTerm, $options: "i" } },
        ],
      });
    }

    if (locationTerm) {
      andConditions.push({
        $or: [
          { "addressDetails.city": { $regex: locationTerm, $options: "i" } },
          { "addressDetails.addressLine1": { $regex: locationTerm, $options: "i" } },
          { "addressDetails.landMark": { $regex: locationTerm, $options: "i" } },
          { "addressDetails.state": { $regex: locationTerm, $options: "i" } },
        ],
      });
    }

    if (serviceTerm && !(unifiedQ && !salonTerm && !serviceTerm)) {
      const services = await Service.find(buildServiceNameRegex(serviceTerm)).select(
        "_id"
      );
      const serviceIds = services.map((s) => s._id);
      if (!serviceIds.length) {
        return res.status(200).json({
          status: true,
          salons: [],
          totalReviews: 0,
          searchCity: null,
        });
      }
      andConditions.push({ "serviceIds.id": { $in: serviceIds } });
    }

    if (andConditions.length) {
      query.$and = andConditions;
    }

    let salons = await Salon.find(query)
      .populate({
        path: "serviceIds.id",
        match: { isDelete: false, status: true },
        select: "name nameEn nameFr namePt duration price",
      })
      .select(
        "name mainImage image heroImage review reviewCount addressDetails locationCoordinates about serviceIds salonTime"
      )
      .limit(100)
      .lean();

    salons = salons.filter((s) => s.serviceIds?.length ? true : true);

    salons = attachSalonDistances(salons, latitude, longitude);

    let formattedSalons = salons.map((salon) =>
      formatSalonForCategory(salon, { baseURL, language, copy: {} })
    );
    formattedSalons = applySalonDiscoveryFilters(formattedSalons, {
      minRating,
      minPrice,
      maxPrice,
      sort,
    });
    const searchCity =
      locationTerm ||
      inferSearchCity(salonTerm || serviceTerm, formattedSalons);

    return res.status(200).json({
      status: true,
      salons: formattedSalons,
      totalReviews: sumReviewCount(formattedSalons),
      searchCity,
      language,
    });
  } catch (error) {
    console.error("[Search Salons Public] Error:", error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};
