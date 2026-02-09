# KONE Maintenance Tracker - Testing Guide

## 🧪 Step-by-Step Testing Instructions

### Phase 1: Account Creation

1. **Open the app** - You'll see the splash screen, then login screen

2. **Create Admin Account:**
   ```
   - Click "Don't have an account? Sign up"
   - Full Name: "Admin User"
   - Email: admin@kone.com
   - Password: admin123 (or your choice, min 6 chars)
   - Role: Select "Admin (Supervisor)"
   - Click "Create Account"
   ```
   - ✅ You should auto-login and see the dashboard with all bottom navigation items

3. **Create Maintainer Account:**
   ```
   - Logout (hamburger menu → Logout)
   - Click "Don't have an account? Sign up"
   - Full Name: "Tech User"
   - Email: tech@kone.com
   - Password: tech123
   - Role: Select "Maintainer (Technician)"
   - Click "Create Account"
   ```
   - ✅ You should auto-login and see simplified dashboard (only Health button)

### Phase 2: Test Maintainer Flow (Real Tracking)

**Login as Maintainer** (tech@kone.com)

1. **Start Maintenance Session:**
   - Select any elevator (e.g., "ELV-001")
   - Click "Start Maintenance Session"
   - ✅ Browser will ask for location permission - **CLICK ALLOW**
   - Navigate to any floor (e.g., Floor 12)

2. **During Maintenance:**
   - ✅ You should see green "Tracking" badge in header
   - ✅ Open browser console (F12) - you should see logs like:
     ```
     Starting movement tracking...
     Recording position: lat=XX.XXX, lon=YY.YYY, floor=12, accuracy=XXm
     ```
   - Add an issue: Click "+" → Type "Test issue" → Click "Add Issue"
   - Mark issue as resolved: Click on the issue checkbox
   - Navigate to other floors (click back, select different floor)
   - ✅ Each floor change should trigger a position record

3. **End Maintenance:**
   - Click "End Maintenance Session"
   - ✅ You should see the Report Summary screen
   - ✅ After closing report, you're back at Dashboard (maintainer restriction)

### Phase 3: Test Admin Flow (Heat Maps)

**Logout and login as Admin** (admin@kone.com)

1. **View Heat Map:**
   - Select the same elevator (ELV-001)
   - Click "View Heat Map (Admin)" button
   - ✅ You should see:
     - Session selector dropdown
     - Session statistics (movements, duration, floors)
     - Time spent per floor with intensity bars
     - Movement log with GPS coordinates

2. **Verify Real Data:**
   - Check that floor numbers match where you went
   - Check that timestamps are from your recent session
   - Check that GPS coordinates are realistic (your area)
   - ✅ Intensity bars should be higher for floors where you spent more time

3. **Test Multiple Sessions:**
   - Start a new maintenance session
   - Visit different floors in different order
   - End session
   - Go back to Heat Map
   - ✅ Session dropdown should now have 2 sessions
   - Switch between sessions to compare

### Phase 4: Test Role Restrictions

**As Maintainer:**
- ✅ Bottom nav should NOT show: Map, Add Elevator, Issues, Reports
- ✅ Elevator detail should NOT show "View Heat Map" button
- ✅ Cannot access /movement-heatmap screens (try manually navigating)

**As Admin:**
- ✅ Bottom nav shows all 5 items
- ✅ Can access all screens
- ✅ Can view all sessions (not just own)

### Phase 5: Test Movement Accuracy

**Best practices for testing GPS tracking:**

1. **On Desktop:**
   - Browser will simulate GPS (usually city center)
   - Limited accuracy but functional for testing

2. **On Mobile Phone (Recommended):**
   - Visit the app URL on your phone
   - Grant location permissions
   - Walk around your building/home
   - Visit different rooms simulating "floors"
   - You'll see REAL GPS coordinates being recorded!

3. **Simulate Different Behaviors:**
   - **Quick maintenance:** Start → End immediately (low movement count)
   - **Thorough maintenance:** Start → Wait 2-3 minutes → Visit 3+ floors → End
   - **Issue-heavy:** Add 5+ issues on different floors
   - Compare heat maps to see differences

### Phase 6: Test Error Handling

1. **No Location Permission:**
   - Deny location when prompted
   - ✅ Should see error: "Location error: User denied geolocation"
   - Still allows starting session (tracking won't work)

2. **No Active Session:**
   - Try to add issue without starting session
   - ✅ Should get "No active session found" error

3. **Network Failure:**
   - Disconnect internet
   - Try to end session
   - ✅ Should see error message
   - Reconnect and retry

### Phase 7: Verify Backend Data

**Check Supabase Dashboard:**

1. Open Supabase project dashboard
2. Go to Database → KV Store table
3. ✅ You should see keys like:
   ```
   user:XXXX (user profiles)
   session:XXXX (completed sessions)
   active-session:XXXX (current sessions)
   user-sessions:XXXX (user's session list)
   elevators (elevator list)
   ```

4. Click on a `session:` key to view data:
   ```json
   {
     "id": "session:user123:1234567890",
     "userId": "user123",
     "elevatorId": "ELV-001",
     "movements": [
       {
         "latitude": 60.1699,
         "longitude": 24.9384,
         "floor": 12,
         "timestamp": "2026-02-09T..."
       },
       ...
     ],
     "floorsVisited": [12, 11, 10],
     "issues": [...],
     "duration": 180
   }
   ```

### Phase 8: Performance Testing

1. **Create Multiple Sessions:**
   - Create 5+ maintenance sessions
   - Visit different floor combinations
   - Verify heat map loads all sessions

2. **Long Session:**
   - Start session
   - Keep it running for 10+ minutes
   - Visit many floors
   - ✅ Should have 60+ movement records (1 every 10 seconds)
   - End session and check performance

3. **Concurrent Users:**
   - Login on multiple devices/browsers
   - Start sessions simultaneously
   - ✅ Each should track independently
   - Verify admin can see all sessions

## 🎯 Expected Results Summary

### Maintainer Experience:
- Simple interface focused on maintenance
- Automatic background tracking
- Can't access heat maps or analytics
- Returns to dashboard after session

### Admin Experience:
- Full access to all features
- Real-time heat map visualization
- Can see all technician sessions
- Complete movement history

### Data Quality:
- GPS coordinates should be realistic (your location)
- Timestamps should be accurate
- Floor tracking should match navigation
- Heat map intensity should reflect time spent

## 🐛 Common Issues & Solutions

### Issue: "No movement data recorded"
**Solution:** 
- Ensure location permissions granted
- Check browser console for GPS errors
- Try on mobile device (better GPS)
- Verify internet connection

### Issue: "Heat map shows no data"
**Solution:**
- Complete a full maintenance session first
- Wait at least 30 seconds after starting
- Visit at least 2-3 floors
- Check that movements were recorded (console logs)

### Issue: "Cannot access heat map"
**Solution:**
- Ensure logged in as ADMIN
- Maintainers cannot access heat maps (by design)
- Check role in profile screen

### Issue: "Session not ending"
**Solution:**
- Check network connection
- Look for error messages in console
- Verify active session exists
- Try refreshing and ending again

## 📊 Sample Test Data

For comprehensive testing, create these scenarios:

**Scenario 1: Quick Fix**
- Duration: < 2 minutes
- Floors: 1-2
- Issues: 0-1
- Expected Heat Map: Low intensity, minimal movement

**Scenario 2: Routine Maintenance**
- Duration: 5-10 minutes
- Floors: 5-8
- Issues: 2-3
- Expected Heat Map: Medium intensity, distributed across floors

**Scenario 3: Major Repair**
- Duration: 15+ minutes
- Floors: 3-4 (focused)
- Issues: 5+
- Expected Heat Map: High intensity on specific floors

## ✅ Testing Checklist

- [ ] Admin account created and working
- [ ] Maintainer account created and working
- [ ] GPS permissions granted
- [ ] Movement tracking logs appear in console
- [ ] Maintenance session completes successfully
- [ ] Heat map shows real GPS data
- [ ] Multiple sessions can be viewed
- [ ] Role restrictions working (maintainer can't see heat maps)
- [ ] Issues can be added and resolved
- [ ] Floor navigation works during active session
- [ ] Data persists in Supabase
- [ ] Mobile testing completed (if applicable)

## 🚀 Ready for Demo

Once all tests pass:
1. Create clean test accounts (admin + 2 maintainers)
2. Run 3-5 realistic maintenance sessions
3. Prepare heat map screenshots
4. Document any special findings
5. Share with colleagues!

---

**Remember:** The heat map data is REAL - it's tracking actual device GPS coordinates during maintenance sessions. Test in a safe environment and follow all privacy guidelines!
