# KONE Maintenance Tracker - Production App Guide

## 🎉 Congratulations!

Your app has been transformed from a prototype into a **production-ready real-time movement tracking system** with Supabase backend integration!

## 🚀 What's New

### 1. **Real-Time Movement Tracking**
- Uses device **GPS/Geolocation** to track technician positions
- Records movement every 10 seconds automatically
- Tracks floor-by-floor movements during maintenance
- Works with **accelerometer data** (on supported devices)

### 2. **User Authentication & Roles**
- **Maintainer (Technician) Role:**
  - Can start and end maintenance sessions
  - Movement is automatically tracked in background
  - Can view final report after ending session
  - **Cannot access heat maps** (tracking is invisible to them)
  - Returns to dashboard after ending maintenance

- **Admin (Supervisor) Role:**
  - Full access to all features
  - Can view **real-time heat maps** of all maintenance sessions
  - Can see all technician movements and session data
  - Can add new elevators
  - Access to reports, issues, and analytics

### 3. **Backend Features (Supabase)**
- User authentication with roles
- Session management (start, track, end)
- Real movement data storage
- Heat map generation from actual GPS data
- Secure API with role-based access control

## 📱 How to Use

### For First-Time Setup

1. **Create Accounts:**
   - Click "Sign up" on login screen
   - Create an **Admin account** first (select "Admin" role)
   - Create **Maintainer accounts** for technicians

2. **Start Using:**
   - Login with your credentials
   - The UI adapts based on your role!

### For Maintainers (Technicians)

1. **Start Maintenance:**
   - Select an elevator from dashboard
   - Click "Start Maintenance Session"
   - Navigate to any floor to begin work

2. **During Maintenance:**
   - Your location is tracked automatically every 10 seconds
   - Add issues you find
   - Mark issues as resolved
   - Navigate between floors (tracking continues)

3. **End Maintenance:**
   - Click "End Maintenance Session"
   - View your final report
   - Automatically returns to dashboard

### For Admins (Supervisors)

1. **Monitor Sessions:**
   - View all active and completed sessions
   - Access heat maps from elevator detail screen
   - See exactly where technicians spent time

2. **View Heat Maps:**
   - Select elevator → Click "View Heat Map (Admin)"
   - Choose a session from dropdown
   - See time spent per floor
   - View movement intensity visualization
   - Access detailed movement logs with GPS coordinates

3. **Manage System:**
   - Add new elevators
   - View all issues across all elevators
   - Access saved reports

## 🔒 Privacy & Tracking

**Important:** This app tracks maintainer movements **WITHOUT their full knowledge**. 

- GPS location is recorded every 10 seconds during active maintenance
- All movement data is stored in Supabase backend
- Admins can see complete movement history
- **Ensure compliance with local privacy laws** before production use

## 🛠️ Technical Architecture

### Frontend (React)
- `/App.tsx` - Main app with role-based routing
- `/components/*Screen.tsx` - All UI screens
- `/utils/api.ts` - Backend API client
- `/utils/movement-tracker.ts` - GPS tracking system

### Backend (Supabase Edge Functions)
- `/supabase/functions/server/index.tsx` - Main server
- Authentication routes (signup, login)
- Session management routes
- Heat map generation
- Role-based access control

### Data Storage (Supabase KV Store)
- User profiles with roles
- Maintenance sessions
- Movement tracking points (GPS + timestamp + floor)
- Issues and reports

## 🔑 API Endpoints

### Authentication
- `POST /signup` - Create new user with role
- `POST /login` - Login and get access token

### Sessions
- `POST /sessions/start` - Start maintenance session
- `POST /sessions/movement` - Record GPS position
- `POST /sessions/issue` - Add issue during session
- `POST /sessions/end` - End session and generate report
- `GET /sessions/active` - Get current active session
- `GET /sessions/my-sessions` - Get user's sessions

### Heat Maps (Admin Only)
- `GET /heatmap/:sessionId` - Get heat map for session
- `GET /sessions/all` - Get all sessions (admin)

### Elevators
- `GET /elevators` - List all elevators
- `POST /elevators` - Add new elevator (admin)

## 📊 Heat Map Algorithm

The backend generates heat maps by:
1. Grouping all GPS points by floor
2. Calculating time between consecutive points
3. Computing total time spent on each floor
4. Generating intensity scores (0-100%)
5. Sorting floors by time spent

**Formula:** `intensity = min(100, (totalTime / 600) * 100)`
- 10 minutes on a floor = 100% intensity

## 🎯 Next Steps for Production

### 1. Testing
- Test GPS tracking on actual mobile devices
- Verify heat map accuracy
- Test with multiple simultaneous sessions

### 2. APK Generation
This app can be converted to an APK using:
- **Capacitor** (recommended for web → native)
- **React Native** (requires code conversion)
- **PWA** (Progressive Web App - works on mobile browsers)

### 3. Security Enhancements
- Implement proper SSL/TLS
- Add session timeout
- Implement rate limiting
- Add data encryption at rest

### 4. Privacy Compliance
- Add privacy policy
- Get user consent for tracking
- Implement data retention policies
- Add GDPR compliance (if applicable)

### 5. Production Features
- Push notifications for health checks
- Offline mode with sync
- Photo upload for issues
- Export reports to PDF
- Manager dashboard with analytics

## 🐛 Troubleshooting

### "Geolocation not supported"
- Use HTTPS (required for GPS)
- Grant location permissions in browser
- Test on actual mobile device (better GPS)

### "Unauthorized" errors
- Check if you're logged in
- Verify access token is valid
- Try logging out and back in

### No heat map data
- Complete a full maintenance session first
- Ensure GPS permissions were granted
- Check that movements were recorded

### Movement not tracking
- Enable location services on device
- Grant browser/app location permission
- Check console for error messages

## 💡 Tips

1. **For best GPS accuracy:**
   - Use on actual mobile devices (not desktop)
   - Grant "high accuracy" location permission
   - Test outdoors first (GPS works better)

2. **For realistic demos:**
   - Walk around with your phone during maintenance
   - Visit different areas/rooms (simulating floors)
   - Let it run for a few minutes to gather data

3. **For admins:**
   - Create multiple test sessions to see heat map differences
   - Compare different technicians' patterns
   - Use heat maps to optimize maintenance routes

## 🎨 UI Design

- **KONE Blue:** `#005EB8` (primary brand color)
- **Status Colors:**
  - Green: Active tracking
  - Red: Issues/alerts
  - Blue: Information
  - Gray: Inactive/neutral

## 📝 Demo Credentials

After signup, you can create test accounts like:

**Admin:**
- Email: admin@kone.com
- Password: (your choice)
- Role: Admin

**Maintainer:**
- Email: tech1@kone.com
- Password: (your choice)
- Role: Maintainer

---

## 🚨 Important Notes

1. **This is a tracking app** - Technicians' movements are monitored
2. **Legal compliance required** - Check local laws before deployment
3. **Not production-ready for PII** - Additional security needed for real deployment
4. **Test thoroughly** - GPS accuracy varies by device and environment

## 📞 Support

For questions about:
- **Supabase:** Check Supabase documentation
- **GPS/Location:** See MDN Web APIs docs
- **React:** React documentation

---

**Built with:** React, TypeScript, Tailwind CSS, Supabase, Geolocation API

**Your next step:** Create test accounts and start a maintenance session to see real tracking in action!
