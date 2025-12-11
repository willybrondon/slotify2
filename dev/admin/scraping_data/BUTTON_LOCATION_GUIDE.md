# Where Are the Invitation Buttons Located?

## 📍 Button Locations in Admin Panel

### 1. **Bulk Send Button** (Top of Page)

**Location:** At the top of the salon list page, next to the "Add salon" button

**Path:** `/admin/allSalon`

**Visual Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  Salons                                                  │
│                                                          │
│  [Add salon]  [Send Invitations (Bulk)]  [Search...]   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Table with salon data...                          │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

**Details:**
- **Button Text:** "Send Invitations (Bulk)"
- **Color:** Yellow/Warning (orange background)
- **Icon:** Envelope icon
- **Action:** Sends invitations to ALL unclaimed salons on the current page

---

### 2. **Individual Send Button** (In Table Row)

**Location:** In the "Action" column of each salon row

**Path:** `/admin/allSalon` → Scroll to salon table

**Visual Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│ No │ Image │ Name │ Mobile │ ... │ Claim Status │ Action   │
├────┼───────┼──────┼────────┼─────┼──────────────┼──────────┤
│ 1  │ [img] │ Salon│ 123... │ ... │ Unclaimed    │ [Edit] [📧]│
│    │       │ Name │        │     │ (yellow)     │           │
├────┼───────┼──────┼────────┼─────┼──────────────┼──────────┤
│ 2  │ [img] │ Salon│ 456... │ ... │ Claimed      │ [Edit]    │
│    │       │ Name │        │     │ (green)      │           │
└────┴───────┴──────┴────────┴─────┴──────────────┴──────────┘
```

**Details:**
- **Column:** "Action" (last column on the right)
- **Position:** Next to the blue "Edit" button
- **Color:** Orange background (#FFE7CF)
- **Icon:** Email/envelope SVG icon
- **Visibility:** Only shows for **unclaimed** salons
- **Action:** Sends invitation to that specific salon

---

## 🎯 Step-by-Step Navigation

### To Find the Bulk Send Button:

1. **Login to Admin Panel**
   - Go to your admin URL (e.g., `https://yourdomain.com/admin`)

2. **Navigate to Salon List**
   - Click on **"Salon"** in the sidebar menu
   - Or go directly to: `/admin/allSalon`

3. **Look at Top of Page**
   - You'll see two buttons at the top:
     - **"Add salon"** (blue button)
     - **"Send Invitations (Bulk)"** (yellow/orange button) ← This one!

---

### To Find the Individual Send Button:

1. **Go to Salon List** (same as above)

2. **Scroll Down to Table**
   - You'll see a table with columns:
     - No
     - Image
     - Name
     - Mobile No
     - Platform Fee (%)
     - Country
     - Active
     - Best Seller
     - **Claim Status** ← Shows "Unclaimed" or "Claimed"
     - Schedule
     - Booking
     - Order
     - Info
     - **Action** ← The button is here!

3. **Find Unclaimed Salon**
   - Look for rows with **yellow "Unclaimed"** badge in "Claim Status" column

4. **Look in Action Column**
   - You'll see:
     - Blue **Edit** button (pencil icon)
     - Orange **Email** button (envelope icon) ← This is the invitation button!
   - **Note:** The email button only appears for unclaimed salons

---

## 📸 Visual Reference

### Table Structure:
```
┌────────────────────────────────────────────────────────────────────┐
│ Salons                                                             │
│                                                                    │
│ [Add salon] [Send Invitations (Bulk)]          [Search...]        │
│                                                                    │
│ ┌────┬──────┬──────────┬────────┬──────┬──────────┬──────────┐   │
│ │ No │Image │   Name   │ Mobile │ ... │Claim Status│  Action │   │
│ ├────┼──────┼──────────┼────────┼──────┼──────────┼──────────┤   │
│ │ 1  │ [img]│ Salon A  │ 123... │ ... │ Unclaimed │ [✏️] [📧]│   │
│ │    │      │          │        │     │ (yellow)  │          │   │
│ ├────┼──────┼──────────┼────────┼──────┼──────────┼──────────┤   │
│ │ 2  │ [img]│ Salon B  │ 456... │ ... │ Claimed   │ [✏️]    │   │
│ │    │      │          │        │     │ (green)   │          │   │
│ └────┴──────┴──────────┴────────┴──────┴──────────┴──────────┘   │
└────────────────────────────────────────────────────────────────────┘
```

**Legend:**
- ✏️ = Edit button (blue)
- 📧 = Send Invitation button (orange) - only for unclaimed salons

---

## 🔍 Quick Tips

1. **Can't find the button?**
   - Make sure you're on `/admin/allSalon` page
   - Check if salon is already claimed (button only shows for unclaimed)
   - Scroll horizontally if table is wide

2. **Button not showing?**
   - Salon might already be claimed (check "Claim Status" column)
   - Refresh the page
   - Check browser console for errors

3. **Bulk button location:**
   - Always at the top, next to "Add salon"
   - Yellow/orange color makes it stand out

---

## 📱 Mobile View

On mobile/tablet:
- Buttons may stack vertically
- Table may scroll horizontally
- Action buttons are still in the rightmost column

---

## ✅ Summary

- **Bulk Send:** Top of page, next to "Add salon" button
- **Individual Send:** In "Action" column, next to "Edit" button (only for unclaimed salons)

