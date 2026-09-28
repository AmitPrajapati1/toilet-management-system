# Society Public Toilet Management System

## Features
- Admin login (demo: `admin` / `admin123`)
- Dashboard is protected and does not open automatically without login
- Family management with Active/Inactive toggle
- Full Create / Read / Update / Delete for families, family payments, individual payments, expenses, staff, cleaning and maintenance
- Reports and configurable fees
- React + Bootstrap frontend
- Node + Express + MongoDB backend

## Run backend
```bash
cd server
npm install
# create .env with MONGODB_URI
npm run dev
```

## Run frontend
```bash
cd client
npm install
npm run dev
```

Frontend: http://localhost:5173
Backend: https://toilet-management-system.onrender.com

Demo login:
Username: admin
Password: admin123

## Family management
Family records now include family-head details and optional family members. Family Head Name is required. If family members are added, every added member must have a name. Members include relation, mobile, age, gender and occupation. Families can be edited, deleted, and toggled Active/Inactive.
