# Quick Start Guide

## 🚀 Get Running in 5 Minutes

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up MongoDB

**Option A: Local MongoDB**
```bash
mongod
```

**Option B: MongoDB Atlas (Cloud)**
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string
4. Update `.env.local`:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/clinics-booking?retryWrites=true&w=majority
```

### 3. Configure Environment Variables

Create `.env.local`:
```
# Database
MONGODB_URI=mongodb://localhost:27017/clinics-booking

# JWT
JWT_SECRET=your-secure-secret-key-change-in-production

# Public API
NEXT_PUBLIC_API_URL=http://localhost:3000

# AI (Groq - Free)
GROQ_API_KEY=your-groq-api-key
```

Get your free Groq API key at: https://console.groq.com/keys

### 4. Start Development Server
```bash
npm run dev
```

Open http://localhost:3000

---

## 📱 Quick Test Flow

### As a Patient:
1. Go to http://localhost:3000
2. Click "Sign Up" → Register as "Patient"
3. Browse doctors or use **AI Symptom Checker**
4. Book an appointment
5. Chat with doctors via **Messages**
6. Rate doctors after appointments

### As a Doctor:
1. Go to http://localhost:3000/register
2. Register as "Doctor"
3. Set up your schedule in **My Schedule**
4. View appointments in **Dashboard**
5. Respond to patient messages

---

## 🌍 Language Support

Switch between **English** and **Arabic** using the language toggle in the navbar. The app supports full RTL layout for Arabic.

---

## 🤖 AI Features

- **Symptom Checker**: Describe symptoms to get specialist recommendations
- **Medical Assistant**: Chat with AI for health questions (responds in selected language)

---

## 📁 Key Pages

| URL | Description |
|-----|-------------|
| `/` | Landing page |
| `/login` | Sign in |
| `/register` | Create account |
| `/book` | Book appointments |
| `/dashboard` | View appointments |
| `/messages` | Doctor-patient chat |
| `/symptom-checker` | AI symptom analysis |
| `/doctor/schedule` | Manage working hours |
| `/profile` | Update profile |

---

## 🔧 Troubleshooting

### MongoDB Connection Failed
```bash
# Ensure MongoDB is running
mongod
```

### Port Already in Use
```bash
npm run dev -- -p 3001
```

### Build Errors
```bash
rm -rf .next node_modules
npm install
npm run build
```

---

## 📚 More Documentation

- **README.md** - Full feature documentation
- **SETUP.md** - Detailed setup guide
- **INDEX.md** - Project overview

---

