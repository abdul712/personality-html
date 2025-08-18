# Google Analytics 4 Setup Instructions

## 🎯 Current Status
- ✅ Property ID `426722856` has been configured in the system
- ⏳ **Need**: GA4 Measurement ID (format: `G-XXXXXXXXXX`)

## 📍 Finding Your GA4 Measurement ID

### Step 1: Access Google Analytics
1. Go to [Google Analytics](https://analytics.google.com)
2. Select your property with ID `426722856`

### Step 2: Find the Measurement ID
1. Click **Admin** (gear icon in bottom left)
2. In the **Property** column, click **Data Streams**
3. Click on your **Web** data stream
4. Copy the **Measurement ID** (starts with `G-`)

**Example**: `G-ABC123DEF4` or `G-1234567890`

## 🚀 Enable Google Analytics

### Option 1: Direct Configuration (Recommended)
Edit `/js/config/tracking-setup.js` and replace the tracking ID:

```javascript
googleAnalytics: {
    enabled: true,
    trackingId: 'G-YOUR-ACTUAL-MEASUREMENT-ID', // Replace this
    propertyId: '426722856', // Already set
    // ... rest of config
},
```

### Option 2: Browser Console Command
1. Open your website
2. Press `F12` to open Developer Tools
3. Go to **Console** tab
4. Run this command:

```javascript
window.PersonalitySparkTracking.enableGoogleAnalytics('G-YOUR-MEASUREMENT-ID');
```

**Replace `G-YOUR-MEASUREMENT-ID` with your actual Measurement ID**

## ✅ Verification

After enabling GA4, you should see:
- ✅ Console message: "Google Analytics enabled for Property ID 426722856"
- ✅ GA4 script loading in Network tab
- ✅ Real-time data in GA4 dashboard (within 24-48 hours)

### Test Commands
```javascript
// Check if GA4 is loaded
window.PersonalitySparkTracking.getSummary()

// Check script loading status
window.PSScriptLoader.getLoadingStatus()

// Send test event
gtag('event', 'test_event', {
    event_category: 'engagement',
    event_label: 'manual_test'
});
```

## 🔍 Troubleshooting

### Common Issues:
1. **"Invalid format" error**: Make sure ID starts with `G-`
2. **Script not loading**: Check browser console for errors
3. **AdBlockers**: Disable ad blockers for testing
4. **HTTPS required**: Ensure site is served over HTTPS

### Debug Mode:
```javascript
// Enable GA4 debug mode
window.PersonalitySparkTracking.enableGoogleAnalytics('G-YOUR-ID', {
    debug_mode: true
});
```

## 📊 What Gets Tracked

Once enabled, GA4 will automatically track:
- ✅ Page views
- ✅ Scroll events  
- ✅ File downloads
- ✅ Outbound clicks
- ✅ Site search
- ✅ Video engagement

Plus custom events from PersonalitySpark:
- ✅ Quiz starts/completions
- ✅ Result sharing
- ✅ Button clicks
- ✅ Navigation events

## 🎉 Next Steps

1. **Find your Measurement ID** using the steps above
2. **Enable GA4** using Option 1 or 2
3. **Verify** using the test commands
4. **Check GA4 dashboard** for data (may take 24-48 hours)

---

**Your Property ID**: `426722856`  
**System Status**: Ready - just need Measurement ID!