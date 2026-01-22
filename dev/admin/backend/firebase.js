const admin = require("firebase-admin");
const initializeSettings = require("./index");

const initFirebase = async () => {
  try {
    await initializeSettings;

    // Check if firebaseKey exists and is valid
    if (!global.settingJSON || !global.settingJSON.firebaseKey) {
      console.warn("[Firebase] ⚠ WARNING: Firebase credentials not configured in settings");
      console.warn("[Firebase] Push notifications will not work. Please configure Firebase credentials in admin panel.");
      // Return a mock admin object to prevent crashes
      return {
        messaging: () => ({
          send: async () => {
            console.warn("[Firebase] Push notification skipped - Firebase not configured");
            return { success: false, error: "Firebase not configured" };
          }
        })
      };
    }

    // Check if firebaseKey is an object (not a string)
    let firebaseCredentials = global.settingJSON.firebaseKey;
    
    // If it's a string, try to parse it
    if (typeof firebaseCredentials === 'string') {
      try {
        firebaseCredentials = JSON.parse(firebaseCredentials);
      } catch (parseError) {
        console.error("[Firebase] Failed to parse firebaseKey as JSON:", parseError.message);
        throw new Error("Firebase credentials are in invalid format");
      }
    }

    // Validate that it's an object with required fields
    if (typeof firebaseCredentials !== 'object' || firebaseCredentials === null) {
      console.error("[Firebase] firebaseKey must be an object, got:", typeof firebaseCredentials);
      throw new Error("Firebase credentials must be an object");
    }

    // Check for required fields
    if (!firebaseCredentials.type || !firebaseCredentials.project_id || !firebaseCredentials.private_key) {
      console.error("[Firebase] Firebase credentials missing required fields");
      console.error("[Firebase] Required: type, project_id, private_key");
      throw new Error("Firebase credentials missing required fields");
    }

    admin.initializeApp({
      credential: admin.credential.cert(firebaseCredentials),
    });
    console.log("[Firebase] ✓ Firebase Admin SDK initialized successfully");
    return admin;
  } catch (error) {
    console.error("[Firebase] ❌ Failed to initialize Firebase Admin SDK:", error.message);
    console.error("[Firebase] Push notifications will not work until Firebase is properly configured");
    // Return a mock admin object to prevent crashes
    return {
      messaging: () => ({
        send: async () => {
          console.warn("[Firebase] Push notification skipped - Firebase initialization failed");
          return { success: false, error: error.message };
        }
      })
    };
  }
};

module.exports = initFirebase();
