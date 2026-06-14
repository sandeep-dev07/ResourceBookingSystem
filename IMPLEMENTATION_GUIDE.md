# Implementation Guide - Resource Maintenance Feature

## Quick Start: 3 Steps to Deploy

### Step 1: Update Database (PostgreSQL)
```bash
# Run the maintenance table creation script
psql -U postgres -d bookslot -f database/maintenance_table.sql
```

Or manually run in pgAdmin:
```sql
-- Copy and paste the contents of database/maintenance_table.sql
```

### Step 2: Compile & Deploy Backend
```bash
cd springboot-service

# Clean and compile
mvn clean compile

# Or build entire project
mvn clean install

# Run the Spring Boot application
mvn spring-boot:run
```

The new endpoints will be available at:
- `POST http://localhost:8080/maintenance/schedule`
- `GET http://localhost:8080/maintenance/all`
- `GET http://localhost:8080/maintenance/resource/{resourceId}`
- `GET http://localhost:8080/maintenance/resource/{resourceId}/date?date=YYYY-MM-DD`
- `PUT http://localhost:8080/maintenance/{maintenanceId}/cancel`
- `PUT http://localhost:8080/maintenance/{maintenanceId}/complete`

### Step 3: Rebuild Frontend
```bash
cd frontend

# Install dependencies (if needed)
npm install

# Build
npm run build

# Or run dev server
npm run dev
```

## File Structure - What Was Created

```
Backend:
├── entity/
│   └── Maintenance.java (NEW)
├── repository/
│   └── MaintenanceRepository.java (NEW)
├── service/
│   └── MaintenanceService.java (NEW)
├── controller/
│   └── MaintenanceController.java (NEW)
├── dto/
│   ├── MaintenanceRequest.java (NEW)
│   └── MaintenanceResponse.java (NEW)

Frontend:
├── pages/
│   └── ManagerDashboard.jsx (UPDATED - removed approve/reject, added maintenance)
├── api/
│   └── backend.js (UPDATED - added maintenance API methods)

Database:
└── maintenance_table.sql (NEW - DDL script)

Documentation:
├── MAINTENANCE_FEATURE_SUMMARY.md (NEW - detailed explanation)
└── IMPLEMENTATION_GUIDE.md (NEW - this file)
```

## Feature Walkthrough

### For Managers:

1. **Login as Manager**
   - Navigate to Manager Dashboard
   - You'll see 4 tabs: Dashboard, Maintenance Schedule, Availability, Reports

2. **Schedule Maintenance**
   - Click "Maintenance Schedule" tab
   - Click "+ Schedule Maintenance" button
   - Fill in:
     - **Resource**: Select room from dropdown
     - **Maintenance Type**: Choose Scheduled/Preventive/Emergency
     - **Description**: e.g., "AC filter replacement", "Floor waxing"
     - **Date**: Pick the date
     - **Start & End Times**: Set the window (e.g., 10:00 - 11:00)
   - Click "Schedule Maintenance"
   - Success message appears

3. **View Active Maintenance**
   - See all active maintenance with:
     - Room name
     - Description
     - Date and time
     - Type (colored badge)
     - Status (ACTIVE badge)
   - Each maintenance has 2 action buttons:
     - "Mark Done" - Moves to completed history
     - "Cancel" - Removes from schedule

4. **View Completed Maintenance**
   - Scroll down to see recent 5 completed maintenance records
   - Shows historical audit trail

5. **Dashboard Overview**
   - Dashboard tab shows:
     - Today's reservations count
     - Available rooms count
     - Active maintenance count
     - Overall occupancy percentage

## API Endpoints Reference

### Schedule Maintenance
```bash
POST /maintenance/schedule
Content-Type: application/json

{
  "resourceId": 1,
  "description": "AC filter replacement",
  "maintenanceDate": "2024-06-20",
  "startTime": "10:00",
  "endTime": "11:00",
  "type": "SCHEDULED",
  "createdBy": "manager@example.com"
}

Response:
{
  "id": 101,
  "resourceId": 1,
  "resourceName": "Meeting Room A",
  "description": "AC filter replacement",
  "maintenanceDate": "2024-06-20",
  "startTime": "10:00",
  "endTime": "11:00",
  "type": "SCHEDULED",
  "status": "ACTIVE",
  "createdBy": "manager@example.com"
}
```

### Get All Active Maintenance
```bash
GET /maintenance/all

Response:
[
  {
    "id": 101,
    "resourceName": "Meeting Room A",
    "resourceId": 1,
    "description": "AC filter replacement",
    "maintenanceDate": "2024-06-20",
    "startTime": "10:00",
    "endTime": "11:00",
    "type": "SCHEDULED",
    "status": "ACTIVE",
    "createdBy": "manager@example.com"
  }
]
```

### Get Maintenance by Resource
```bash
GET /maintenance/resource/1

Response: [...]
```

### Get Maintenance by Date
```bash
GET /maintenance/resource/1/date?date=2024-06-20

Response: [...]
```

### Complete Maintenance
```bash
PUT /maintenance/101/complete

Response: 204 No Content
Status: ACTIVE -> COMPLETED
```

### Cancel Maintenance
```bash
PUT /maintenance/101/cancel

Response: 204 No Content
Status: ACTIVE -> CANCELLED
```

## Testing the Feature

### Using Postman/Curl:

```bash
# 1. Schedule maintenance
curl -X POST http://localhost:8080/maintenance/schedule \
  -H "Content-Type: application/json" \
  -d '{
    "resourceId": 1,
    "description": "Test maintenance",
    "maintenanceDate": "2024-06-20",
    "startTime": "10:00",
    "endTime": "11:00",
    "type": "SCHEDULED",
    "createdBy": "test@example.com"
  }'

# 2. Get all maintenance
curl -X GET http://localhost:8080/maintenance/all

# 3. Complete a maintenance (replace 101 with actual ID)
curl -X PUT http://localhost:8080/maintenance/101/complete

# 4. Cancel a maintenance
curl -X PUT http://localhost:8080/maintenance/102/cancel
```

### Using UI:

1. Login to manager account
2. Go to Manager Dashboard > Maintenance Schedule
3. Click "+ Schedule Maintenance"
4. Fill form and submit
5. Verify in the list
6. Try "Mark Done" and "Cancel" buttons

## Troubleshooting

### Issue: Maintenance table not found error
**Solution**: Run the SQL script:
```bash
psql -U postgres -d bookslot -f database/maintenance_table.sql
```

### Issue: 404 on maintenance endpoints
**Solution**: Ensure MaintenanceController is in the correct package path:
`com.bookslot.controller`

### Issue: Form not appearing in Manager Dashboard
**Solution**: Clear browser cache and rebuild React:
```bash
cd frontend
npm run build
# Or npm run dev for dev server
```

### Issue: Maintenance not saving
**Solution**: Check:
1. Database table exists
2. Spring Boot recompiled with new classes
3. Error logs in browser console and Spring Boot terminal

## Future Enhancements (Optional)

1. **Integration with Booking System**
   - Automatically prevent bookings during maintenance
   - Show "Under Maintenance" status on resources

2. **Notifications**
   - Email managers when maintenance is due
   - Notify users when resources go under maintenance

3. **Recurring Maintenance**
   - Schedule recurring maintenance (e.g., monthly AC filter change)
   - Set maintenance templates

4. **Maintenance Costs**
   - Track maintenance costs per resource
   - Generate cost reports

5. **Maintenance History Analytics**
   - Most frequent issues
   - Average maintenance duration
   - Resource reliability metrics

## Need Help?

Check:
- Spring Boot logs for backend errors
- Browser console (F12) for frontend errors
- Database for maintenance table existence
- API endpoints with Postman

All code follows existing project conventions and integrates seamlessly with the current booking system.
