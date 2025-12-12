# 📍 Exact Location of Invitation Button

## 🎯 Where the Button Appears

### Location 1: **Individual Invite Button** (In Table - Action Column)

**Page:** `/admin/allSalon`

**Exact Position:**
- **Column:** "Action" (the **last column on the right**)
- **Row:** Each salon row in the table
- **Position:** Next to the blue "Edit" button (pencil icon)

**Visual Layout:**
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Salons                                                                       │
│                                                                              │
│ [Add salon] [Send Invitations (Bulk)]                    [Search...]       │
│                                                                              │
│ ┌─────┬──────┬──────────┬────────┬──────┬──────────┬──────────┬──────────┐│
│ │ No  │Image │   Name   │ Mobile │ ...  │Claim     │  Action  │          ││
│ │     │      │          │        │      │Status    │          │          ││
│ ├─────┼──────┼──────────┼────────┼──────┼──────────┼──────────┼──────────┤│
│ │  1  │ [img]│ Salon A  │ 123... │ ...  │Unclaimed │ [✏️] [📧]│          ││
│ │     │      │          │        │      │(yellow)  │ Edit Invite│        ││
│ │     │      │          │        │      │          │ Blue Orange│        ││
│ ├─────┼──────┼──────────┼────────┼──────┼──────────┼──────────┼──────────┤│
│ │  2  │ [img]│ Salon B  │ 456... │ ...  │Claimed   │ [✏️]     │          ││
│ │     │      │          │        │      │(green)   │ Edit     │          ││
│ │     │      │          │        │      │          │ (no button)│        ││
│ └─────┴──────┴──────────┴────────┴──────┴──────────┴──────────┴──────────┘│
└─────────────────────────────────────────────────────────────────────────────┘
```

**Button Details:**
- **Color:** Orange (#FF6B00)
- **Text:** "Invite" (white text)
- **Icon:** Email/envelope icon (white)
- **Size:** Medium button with padding
- **Shows for:** Only unclaimed salons (yellow "Unclaimed" badge)

---

### Location 2: **Bulk Send Button** (Top of Page)

**Page:** `/admin/allSalon`

**Exact Position:**
- **Location:** Top of the page, in the button area
- **Position:** Next to the "Add salon" button (on the left side)
- **Before:** The search box (on the right side)

**Visual Layout:**
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│  Salons                                                                      │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ [Add salon]  [Send Invitations (Bulk)]          [Search...]         │  │
│  │   Blue          Yellow/Orange                      Search box      │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ Table with salons...                                                 │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Button Details:**
- **Color:** Yellow/Orange (warning color)
- **Text:** "Send Invitations (Bulk)"
- **Icon:** Envelope icon
- **Function:** Sends invitations to ALL unclaimed salons on current page

---

## 📋 Step-by-Step Navigation

### To Find Individual Button:

1. **Login to Admin Panel**
   ```
   URL: https://yourdomain.com/admin
   ```

2. **Click on "Salon" in Sidebar**
   - Left sidebar menu
   - Click "Salon" option
   - Or navigate directly to: `/admin/allSalon`

3. **Scroll to Table**
   - You'll see a table with multiple columns
   - Columns include: No, Image, Name, Mobile, Platform Fee, Country, Active, Best Seller, **Claim Status**, Schedule, Booking, Order, Info, **Action**

4. **Look at "Action" Column**
   - This is the **rightmost column**
   - For each salon row, you'll see:
     - **Blue "Edit" button** (pencil icon) - always visible
     - **Orange "Invite" button** - only for unclaimed salons

5. **Check "Claim Status" Column**
   - Look for **yellow "Unclaimed" badge**
   - If you see yellow badge, the orange "Invite" button should be visible in the same row

---

### To Find Bulk Button:

1. **Go to `/admin/allSalon`** (same as above)

2. **Look at Top of Page**
   - Right below the "Salons" title
   - You'll see a row with buttons
   - Left side: "Add salon" button (blue)
   - Next to it: **"Send Invitations (Bulk)"** button (yellow/orange)
   - Right side: Search box

---

## 🎨 Visual Appearance

### Individual "Invite" Button:
```
┌─────────────┐
│ 📧 Invite   │  ← Orange background
│             │     White text and icon
└─────────────┘     Next to blue Edit button
```

### Bulk Button:
```
┌──────────────────────────────┐
│ 📧 Send Invitations (Bulk)  │  ← Yellow/Orange background
└──────────────────────────────┘     White text
```

---

## ✅ Quick Checklist

**Individual Button:**
- [ ] Go to `/admin/allSalon`
- [ ] Find "Action" column (rightmost)
- [ ] Look for orange "Invite" button
- [ ] Should be next to blue "Edit" button
- [ ] Only shows for salons with yellow "Unclaimed" badge

**Bulk Button:**
- [ ] Go to `/admin/allSalon`
- [ ] Look at top of page
- [ ] Find "Send Invitations (Bulk)" button
- [ ] Should be next to "Add salon" button
- [ ] Yellow/orange color

---

## 🔍 If You Can't Find It

### Check These:

1. **Are you on the right page?**
   - URL should be: `/admin/allSalon`
   - Not `/admin/salon` or other pages

2. **Do you have unclaimed salons?**
   - Check "Claim Status" column
   - Look for yellow "Unclaimed" badges
   - If all show green "Claimed", button won't show (this is correct!)

3. **Is the table loading?**
   - Check if salon data is displayed
   - Check browser console for errors

4. **Scroll horizontally**
   - Table might be wide
   - "Action" column is on the far right
   - Scroll right if needed

5. **Check browser zoom**
   - Make sure page is at 100% zoom
   - Very small zoom might hide buttons

---

## 📊 Table Column Order

From left to right:
1. No
2. Image
3. Name
4. Mobile No
5. Platform Fee (%)
6. Country
7. Active
8. Best Seller
9. **Claim Status** ← Check this for yellow badges
10. Schedule
11. Booking
12. Order
13. Info
14. **Action** ← **Button is here!**

---

## 🎯 Summary

**Individual Button Location:**
- **Page:** `/admin/allSalon`
- **Column:** "Action" (last column on right)
- **Position:** Next to blue "Edit" button
- **Shows for:** Unclaimed salons only

**Bulk Button Location:**
- **Page:** `/admin/allSalon`
- **Position:** Top of page, next to "Add salon" button
- **Shows:** Always visible (sends to all unclaimed salons)

