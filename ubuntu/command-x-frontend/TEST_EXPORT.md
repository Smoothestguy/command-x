# 🧪 TEST EXPORT FUNCTIONALITY

## ✅ What to Test

### 1. Export Workers as PDF
**Steps:**
1. Go to: http://localhost:5174/personnel
2. Make sure you have at least one worker in the list
3. Click "Export Workers" button
4. Click "📄 Export as PDF"
5. Check if file downloads as `worker_directory.pdf`
6. Open the PDF and verify:
   - Title: "Worker Directory"
   - Generation date
   - Table with worker information
   - Total workers count

### 2. Export Workers as CSV
**Steps:**
1. Go to: http://localhost:5174/personnel
2. Click "Export Workers" button
3. Click "📊 Export as CSV"
4. Check if file downloads as `worker_directory.csv`
5. Open in Excel/Google Sheets and verify:
   - Headers: Name, Email, Phone, Role, Address, Hire Date, Status
   - Worker data in rows

### 3. Export Time Entries as PDF
**Steps:**
1. Go to: http://localhost:5174/personnel
2. Click on "Time" tab
3. Make sure you have time entries
4. Click "Export Time Entries" button
5. Click "📄 Export as PDF"
6. Check if file downloads as `time_entries_report.pdf`
7. Open the PDF and verify:
   - Title: "Time Entries Report"
   - Generation date
   - Table with time entry data
   - Total entries and hours

### 4. Export Time Entries as CSV
**Steps:**
1. Go to: http://localhost:5174/personnel
2. Click on "Time" tab
3. Click "Export Time Entries" button
4. Click "📊 Export as CSV"
5. Check if file downloads as `time_entries.csv`
6. Open in Excel/Google Sheets and verify:
   - Headers: Worker Name, Date, Hours, Project, Work Order, Notes
   - Time entry data in rows

---

## 🐛 Troubleshooting

### If nothing downloads:
1. Check browser console (F12)
2. Look for error messages
3. Check if you have workers/time entries to export
4. Try refreshing the page (F5)
5. Try a different browser

### If PDF is blank:
1. Make sure you have workers/time entries
2. Check browser console for errors
3. Try exporting as CSV first to verify data exists

### If buttons don't appear:
1. Refresh the page (F5)
2. Check browser console (F12)
3. Make sure you're on http://localhost:5174/personnel

---

## ✅ Expected Results

### Worker Directory PDF
- Professional formatted document
- Blue header with white text
- Table with all worker information
- Total worker count at bottom
- Generation date

### Worker Directory CSV
- Plain text file
- Headers in first row
- One worker per row
- Comma-separated values
- Quoted fields

### Time Entries PDF
- Professional formatted document
- Blue header with white text
- Table with time entry data
- Total entries and hours at bottom
- Date range information

### Time Entries CSV
- Plain text file
- Headers in first row
- One entry per row
- Comma-separated values
- Quoted fields

---

## 📝 Notes

- Make sure you have at least one worker before exporting
- Make sure you have at least one time entry before exporting time entries
- PDFs should open in your default PDF viewer
- CSVs should open in Excel or Google Sheets
- Files download to your Downloads folder

---

## ✨ Success Criteria

✅ Export Workers PDF downloads and opens
✅ Export Workers CSV downloads and opens
✅ Export Time Entries PDF downloads and opens
✅ Export Time Entries CSV downloads and opens
✅ All data is correctly formatted
✅ No errors in browser console

**If all tests pass, the export feature is working! 🎉**

