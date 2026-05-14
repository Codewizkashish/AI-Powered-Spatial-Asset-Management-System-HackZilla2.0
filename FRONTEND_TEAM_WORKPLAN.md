# 🚀 Frontend Team Workplan - 20 Hour Hackathon Task Division

**Event**: HackZilla 2.0  
**Duration**: 20 Hours (Continuous or 2×10hr sessions)  
**Project**: AI Spatial Asset Management System  
**Team Size**: 2 Frontend Developers  
**Dev Environment**: Next.js 16.2.6 + TypeScript + Tailwind CSS  
**Goal**: Demo-ready app with upload → map → warnings by end of hackathon

---

## 📊 Team Division Overview

| Aspect | Developer 1 (Alex) | Developer 2 (Jordan) |
|--------|-------------------|----------------------|
| **Focus** | **Map & Visualization** | **Upload & Results Display** |
| **Core Role** | Interactive map, asset polygons, markers | Upload UI, dashboard, warnings |
| **Critical Components** | 3 components | 4 components |
| **Total Hours** | 10 hours | 10 hours |
| **MVP Completion** | Hour 16 | Hour 15 |
| **Demo Ready** | Hour 18 | Hour 18 |

---

## 👨‍💻 DEVELOPER 1: MAP & VISUALIZATION TRACK

### ⏱️ TOTAL TIME: 10 HOURS

### MUST-HAVE Components (Hackathon MVP)
1. **AssetLayer.tsx** (3 hrs) - ⭐ CRITICAL
   - Render GeoJSON polygons on map
   - Color by asset category
   - Click popup with asset details
   
2. **WarningMarker.tsx** (2 hrs) - ⭐ CRITICAL
   - Show warning locations as markers
   - Color by severity (red/orange/yellow)
   - Display warning text on click

3. **MapControls.tsx** (2 hrs) - ⭐ CRITICAL
   - Zoom in/out buttons
   - Reset view button
   - Satellite/OSM tile toggle

**Nice-to-Have (Only if ahead of schedule):**
- LayerToggle.tsx (2 hrs) - Toggle asset categories visibility
- Legend.tsx (1 hr) - Show colors/categories

### HOURLY BREAKDOWN (Dev 1)

```
Hour 0-1: Review MapView.tsx & GeoJSON structure
          Setup branch & understand app state

Hour 1-4: Build AssetLayer.tsx
          ✓ Parse GeoJSON from store
          ✓ Render L.geoJSON() with styling
          ✓ Add click popup with asset info
          ✓ Auto-zoom to features on mount

Hour 4-6: Build WarningMarker.tsx
          ✓ Map warnings to L.CircleMarker()
          ✓ Color by severity
          ✓ Popup with warning text & asset type

Hour 6-8: Build MapControls.tsx
          ✓ Zoom +/- buttons
          ✓ Reset bounds button
          ✓ Tile layer toggle (OSM ↔ Satellite)
          ✓ Position controls on map

Hour 8-10: Testing & Polish
           ✓ Test asset rendering
           ✓ Test warning markers
           ✓ Test map controls
           ✓ Fix styling issues
           ✓ Verify mobile responsiveness
```

### Key Implementation Details

**AssetLayer.tsx:**
```typescript
// Use useEffect to sync store.geojson → map
// Apply Tailwind-based colors per category
const CATEGORY_COLORS = {
  building: '#ef4444',
  tree: '#22c55e',
  water: '#3b82f6',
  // ... from constants.ts
};
```

**WarningMarker.tsx:**
```typescript
// Map store.warnings array to marker positions
// Extract lat/lng from warning.asset.geometry
// Color circle by warning.severity
const SEVERITY_COLORS = { high: '#ef4444', medium: '#f97316', low: '#eab308' };
```

**MapControls.tsx:**
```typescript
// Add to MapView as sibling to leaflet container
// Use leaflet L.control to position buttons
// Toggle L.tileLayer on satellite click
```

### Component Structure
```
src/components/MapView/
├── MapView.tsx ✅
├── AssetLayer.tsx (Dev 1 - CRITICAL)
├── WarningMarker.tsx (Dev 1 - CRITICAL)
├── MapControls.tsx (Dev 1 - CRITICAL)
├── LayerToggle.tsx (Dev 1 - Optional)
└── Legend.tsx (Dev 1 - Optional)
```

### Success Criteria (Dev 1)
- ✅ Map shows GeoJSON polygons in correct locations
- ✅ Each asset category has distinct color
- ✅ Click polygon → see asset details popup
- ✅ Warning markers visible on map
- ✅ Click marker → see warning details
- ✅ Map controls work (zoom, reset, satellite)
- ✅ NO console errors
- ✅ Responsive on laptop/tablet

---

## 👩‍💻 DEVELOPER 2: UPLOAD & RESULTS TRACK

### ⏱️ TOTAL TIME: 10 HOURS

### MUST-HAVE Components (Hackathon MVP)
1. **UploadZone.tsx** (2 hrs) - ⭐ CRITICAL
   - Extract from page.tsx
   - Drag-drop or click upload
   - File validation (JPG, PNG)
   - Progress bar during upload
   
2. **AssetSummary.tsx** (2 hrs) - ⭐ CRITICAL
   - Display count per asset category
   - Show total area calculated
   - Statistics cards layout
   
3. **WarningList.tsx** (2 hrs) - ⭐ CRITICAL
   - List all warnings
   - Color by severity
   - Show asset type for each warning

4. **Dashboard/page.tsx** (2 hrs) - ⭐ CRITICAL
   - Layout with upload on top
   - Map below (from Dev 1)
   - Warnings section on right sidebar
   - Stats summary at top

**Nice-to-Have (Only if ahead):**
- ExportButton.tsx (1 hr) - Download as GeoJSON

### HOURLY BREAKDOWN (Dev 2)

```
Hour 0-1: Review useAppStore & assetService
          Setup branch & component structure

Hour 1-3: Build UploadZone.tsx
          ✓ Refactor from page.tsx upload logic
          ✓ Drag-drop file handler
          ✓ File type/size validation
          ✓ Progress bar during upload
          ✓ Error message display

Hour 3-5: Build AssetSummary.tsx
          ✓ Fetch store.summary data
          ✓ Create card component for each stat
          ✓ Use formatArea() for display
          ✓ Format numbers in Indian system
          ✓ Tailwind grid layout (3-4 columns)

Hour 5-7: Build WarningList.tsx
          ✓ Fetch store.warnings array
          ✓ Create table or list rows
          ✓ Add severity badge (color + label)
          ✓ Show asset category icon
          ✓ Sort by severity (high→low)

Hour 7-9: Build Dashboard/page.tsx
          ✓ Layout: upload at top
          ✓ Map component in center/bottom
          ✓ AssetSummary cards in grid
          ✓ WarningList as sidebar or section
          ✓ Loading skeleton while analyzing
          ✓ Error handling & empty states

Hour 9-10: Testing & Polish
           ✓ Test upload flow end-to-end
           ✓ Test data display
           ✓ Verify mobile layout
           ✓ Fix styling bugs
           ✓ No console errors
```

### Key Implementation Details

**UploadZone.tsx:**
```typescript
// Extract existing upload logic from page.tsx
// Use React.ChangeEvent for file input
// Call analyzeImage() from assetService
// Show progress: uploading → processing → done
// Handle errors gracefully
```

**AssetSummary.tsx:**
```typescript
// Read from store.summary (returned from analyzeImage)
// Display: Building count, Tree count, Water count, etc.
// Use Tailwind cards with icons
// Show total area in square meters/hectares
const stats = [
  { label: 'Buildings', count: 45, color: 'bg-red-100' },
  { label: 'Trees', count: 1203, color: 'bg-green-100' },
  // ...
];
```

**WarningList.tsx:**
```typescript
// Map store.warnings to list items
// Add severity-colored badges
// Show: Asset Type, Severity, Details
// Sort by severity DESC
const SEVERITY_ORDER = { high: 0, medium: 1, low: 2 };
```

**Dashboard/page.tsx:**
```typescript
// Combine UploadZone, Map, AssetSummary, WarningList
// Two-column or three-section layout
// Left: Upload + Summary + Warnings (scrollable)
// Right: Map (takes full height)
// Loading state during API call
```

### Component Structure
```
src/components/
├── Upload/
│   └── UploadZone.tsx (Dev 2 - CRITICAL)
├── Dashboard/
│   ├── AssetSummary.tsx (Dev 2 - CRITICAL)
│   ├── WarningList.tsx (Dev 2 - CRITICAL)
│   └── ExportButton.tsx (Dev 2 - Optional)
└── ...

src/app/
├── page.tsx (refactor: remove upload, link to dashboard)
├── layout.tsx ✅
└── dashboard/
    └── page.tsx (Dev 2 - CRITICAL - main demo page)
```

### Success Criteria (Dev 2)
- ✅ Upload accepts image files without errors
- ✅ Progress bar visible during upload
- ✅ Asset counts display correctly
- ✅ Total area calculated & shown
- ✅ Warnings list shows all items
- ✅ Severity colors clearly visible
- ✅ Dashboard layout is clean & organized
- ✅ NO console errors
- ✅ Mobile responsive layout

---

## 🔗 SHARED RESOURCES (Both Developers)

### ✅ Already Created (Use As-Is)
```
src/
├── types/api.ts ✅ - All TypeScript interfaces
├── lib/
│   ├── constants.ts ✅ - Config, colors, categories
│   ├── api/
│   │   ├── client.ts ✅ - Axios instance
│   │   └── assetService.ts ✅ - All API methods (analyzeImage, getWarnings, etc)
│   └── utils/
│       ├── formatters.ts ✅ - formatArea(), formatNumber(), getSeverityBadgeColor()
│       └── geoUtils.ts ✅ - calculateBBoxFromCoordinates()
├── store/useAppStore.ts ✅ - Zustand state (geojson, warnings, summary)
├── app/layout.tsx ✅ - Root layout
└── globals.css ✅ - Tailwind setup
```

### 📝 DO NOT CREATE (Already working)
- ❌ page.tsx - Home page exists, keep as-is
- ❌ MapView.tsx - Base map exists, Dev 1 adds layers to it
- ❌ API client - Use existing assetService.ts

### 💡 REUSE Existing Code
Both developers should leverage:
- `useAppStore()` for global state (no Redux/Context needed)
- `assetService.analyzeImage()` for upload
- `formatArea(), formatNumber()` from formatters
- `SEVERITY_COLORS` & `ASSET_CATEGORIES` from constants

### ⚠️ DO NOT Create Common Components
For a 20-hr hackathon, **skip these**:
- ❌ LoadingSpinner.tsx (use Tailwind spinners inline)
- ❌ ErrorAlert.tsx (use alert() or inline messages)
- ❌ Badge.tsx (use Tailwind inline)
- ❌ Navbar.tsx (not needed for MVP)
- ❌ Footer.tsx (not needed for MVP)

**Focus only on**: UploadZone, AssetSummary, WarningList, AssetLayer, WarningMarker, MapControls

---

## 📋 INTEGRATION POINTS (CRITICAL FOR SUCCESS)

### Checklist Before Coding
Both developers MUST align on these before hour 0:
```
✓ API is working and responding correctly
✓ .env.local has correct NEXT_PUBLIC_API_BASE_URL
✓ Both understand useAppStore structure
✓ Both understand GeoJSON shape from API
✓ Both understand Warning object shape
✓ TEST: analyzeImage() returns expected data
✓ TEST: getWarnings() returns expected data
✓ Decide: Which page is the "demo page"?  (dashboard/page.tsx)
✓ Git branches: dev-1/map and dev-2/upload created
```

### Data Flow (Both must respect this)
```
UPLOAD (Dev 2)
  → analyzeImage(file)
  → setGeojson(), setSummary(), setWarnings() in store
  
DISPLAY (Dev 1 & 2)
  → useAppStore() reads geojson, warnings
  → MapView renders from store.geojson
  → AssetSummary renders from store.summary
  → WarningList renders from store.warnings
```

### Communication Protocol (20 hrs is tight!)
```
Hour 0: Kickoff
  - Verify API working
  - Clone respective branches
  - Confirm component list
  - Handshake on data flow

Hour 4: Mid-point check
  - Show what each built
  - Any blocking issues?
  - Adjust if needed

Hour 14: Integration test
  - Upload an image
  - Verify map shows polygons
  - Verify warnings show
  - Fix any bugs

Hour 18: Final demo prep
  - Test entire flow
  - Polish UI
  - Prepare for demo
  - Screenshots for presentation
```

### Conflict Prevention
- **Dev 1** works ONLY in `src/components/MapView/`
- **Dev 2** works ONLY in `src/components/{Upload,Dashboard}` and `src/app/dashboard/`
- **Shared**: `src/lib/`, `src/store/`, `src/types/` (READ ONLY)
- **Git**: Merge to main only after 20hr completion
- **No conflicts** if each stays in their folder

---

## ⏱️ 20-HOUR HACKATHON TIMELINE

### Master Timeline
```
Hour 0-1:    Kickoff & Setup (Both)
Hour 1-8:    Dev work (Parallel - no blocking)
Hour 8-9:    Sync & Integration (Both)
Hour 9-14:   Dev work continues (Parallel - bug fixes)
Hour 14-16:  Final component completion
Hour 16-18:  Integration test & polish
Hour 18-20:  Demo prep & presentation
```

### Dev 1 Timeline (Map Track)
```
Hour 0-1:    Clone branch, review MapView, understand store
Hour 1-4:    Build AssetLayer.tsx (3 hrs of coding)
Hour 4-6:    Build WarningMarker.tsx (2 hrs)
Hour 6-8:    Build MapControls.tsx (2 hrs)
Hour 8-9:    SYNC - Test with Dev 2's data
Hour 9-13:   Refinements, styling, bug fixes
Hour 13-14:  Polish map interactions
Hour 14-16:  Final testing & demo prep
Hour 16-20:  Available for frontend support/fixing
```

### Dev 2 Timeline (Upload & Dashboard Track)
```
Hour 0-1:    Clone branch, review store, understand API
Hour 1-3:    Build UploadZone.tsx (2 hrs of coding)
Hour 3-5:    Build AssetSummary.tsx (2 hrs)
Hour 5-7:    Build WarningList.tsx (2 hrs)
Hour 7-8:    Build Dashboard page layout (1 hr)
Hour 8-9:    SYNC - Test upload flow end-to-end
Hour 9-13:   Bug fixes, styling, data binding
Hour 13-14:  Final dashboard integration
Hour 14-16:  Final testing & demo prep
Hour 16-20:  Available for frontend support/fixing
```

### Critical Checkpoints
| Hour | Dev 1 | Dev 2 | Status |
|------|-------|-------|--------|
| 1 | ✅ Setup | ✅ Setup | Ready |
| 4 | AssetLayer 50% | UploadZone Done | ✓ On Track |
| 8 | AssetLayer Done | Dashboard Basic | ✓ Sync Point |
| 10 | WarningMarker Done | AssetSummary Done | ✓ Features |
| 14 | MapControls Done | WarningList Done | ✓ MVP Complete |
| 16 | Testing | Testing | ✓ Testing |
| 18 | **DEMO READY** | **DEMO READY** | ✅ LAUNCH |

### What NOT to Do (Strict Time Limits)
❌ Don't build LayerToggle if ahead (use your time for testing)  
❌ Don't create extra components  
❌ Don't refactor existing code  
❌ Don't add animations or transitions  
❌ Don't over-optimize CSS  
❌ Don't write tests (focus on functionality)

### What TO Do If Ahead (Priority Order)
1. Test your components thoroughly
2. Test integration with other dev's code
3. Add error handling
4. Add responsive mobile design
5. Polish UI colors/spacing
6. Document your code briefly
7. Prepare demo script

---

## 🎯 SUCCESS CRITERIA - WHAT "DONE" MEANS FOR HACKATHON

### Dev 1 Success (Map Track)
✅ **MUST HAVE** (Non-negotiable):
- Asset polygons render on map in correct locations
- Each asset category has distinct color
- Click polygon → popup shows asset details
- Warning markers visible on map
- Map zoom in/out controls work
- Satellite/OSM tile toggle works
- NO console errors during demo

✅ **NICE TO HAVE** (If time permits):
- Hover effects on polygons
- Animated zoom to features
- Legend showing colors

❌ **OUT OF SCOPE** (Don't attempt):
- Heatmaps
- Clustering
- Drawing tools
- Animations

### Dev 2 Success (Upload & Dashboard Track)
✅ **MUST HAVE** (Non-negotiable):
- Upload accepts image files
- Upload shows progress bar
- Asset counts display correctly
- Total area calculated and shown
- Warnings list shows all warnings
- Severity colors clearly visible (red/orange/yellow)
- Dashboard integrates map + stats + warnings
- NO console errors during demo

✅ **NICE TO HAVE** (If time permits):
- File preview thumbnail
- Export as GeoJSON
- Loading skeleton animations

❌ **OUT OF SCOPE** (Don't attempt):
- Chat interface
- Filtering
- Search
- Analytics
- Export to CSV

### OVERALL SUCCESS (Both Developers)
✅ Complete end-to-end flow works:
   1. User uploads image
   2. Backend analyzes (API working)
   3. Frontend shows results on map
   4. Dashboard shows stats & warnings
   5. Demo is impressive

✅ NO errors in browser console  
✅ Mobile responsive (at least tablet-friendly)  
✅ Code is deployable (no broken imports)  
✅ Can demo for 2 minutes straight without crashes

---

## �️ PRE-HACKATHON SETUP (DO THIS BEFORE HOUR 0)

### Dev Environment Checklist
```
✅ Node v20.20.0 + npm 11.7.0 installed
✅ Next.js project cloned/ready
✅ All dependencies installed:
   npm install leaflet react-leaflet zustand axios
✅ .env.local configured:
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
✅ Dev server running: npm run dev
✅ Git branches created: dev-1/map and dev-2/upload
✅ API backend running on localhost:8000
✅ Test API: Call analyzeImage with test image
✅ VS Code extensions: ES7+, Tailwind CSS
```

### Pre-Hackathon Alignment (1 Hour Before Start)
- [ ] Both developers understand the workplan
- [ ] Roles assigned: Dev 1 = Map, Dev 2 = Upload
- [ ] GitHub/GitKraken ready
- [ ] API endpoint verified working
- [ ] Test image ready for upload
- [ ] Slack/Discord for communication
- [ ] Demo machine configured

---

## 🆘 QUICK TROUBLESHOOTING

### "Map not showing"
→ Check store.geojson is populated after upload  
→ Check MapView.tsx is imported in dashboard/page.tsx  
→ Open browser DevTools → Console for errors  

### "Upload not working"
→ Check API is running on localhost:8000  
→ Check .env.local NEXT_PUBLIC_API_BASE_URL is correct  
→ Check file is actually being sent (network tab)  

### "Styling looks weird"
→ Clear .next cache: `rm -r .next`  
→ Rebuild: `npm run dev`  
→ Check Tailwind classes are spelled correctly  

### "Component not found"
→ Check import path is correct  
→ Check file exists in `src/components/`  
→ Check file is exported as default or named export  

### "Git conflicts"
→ Each dev stays in their own folder (no conflicts)  
→ If conflict: pull latest, resolve, commit  

### "Need help mid-hackathon"
→ Check error message in browser console  
→ Check error response from API (Network tab)  
→ Ask team lead to review code  
→ Slack message for quick questions  

---

## 📚 KEY DOCUMENTATION

**To Reference During Build:**
- **Types**: `src/types/api.ts` - All interfaces
- **Constants**: `src/lib/constants.ts` - Colors, categories, config
- **API**: `src/lib/api/assetService.ts` - All endpoints
- **State**: `src/store/useAppStore.ts` - Store structure
- **Utils**: `src/lib/utils/formatters.ts` - Display helpers

**For Understanding:**
- [PROJECT_CONTEXT.md](PROJECT_CONTEXT%20(1).md) - What the app does
- [ARCHITECTURE.md](ARCHITECTURE%20(1).md) - System design
- [NEXTJS_MIGRATION_GUIDE.md](docs/NEXTJS_MIGRATION_GUIDE.md) - Tech stack

---

## 📝 SUBMISSION CHECKLIST (Hour 18)

Before demo, verify:
```
✅ Dev server runs without errors
✅ Can upload an image
✅ Map displays polygons correctly
✅ Asset counts show in summary
✅ Warnings list visible
✅ Mobile layout looks reasonable
✅ No broken images/links
✅ Code is committed to git
✅ Demo script prepared (2 min)
✅ Screenshots taken for presentation
✅ Judges can understand the app immediately
```

---

## 🚀 READY? START HERE

**For Dev 1 (Map):**
1. Clone branch: `git checkout dev-1/map`
2. Review this section: "DEVELOPER 1: MAP & VISUALIZATION TRACK"
3. Start with Hour 1 task: "Build AssetLayer.tsx"
4. Use hourly breakdown as your guide

**For Dev 2 (Upload):**
1. Clone branch: `git checkout dev-2/upload`
2. Review this section: "DEVELOPER 2: UPLOAD & RESULTS TRACK"
3. Start with Hour 1 task: "Build UploadZone.tsx"
4. Use hourly breakdown as your guide

**Good luck! 🎉** See you at demo time!
