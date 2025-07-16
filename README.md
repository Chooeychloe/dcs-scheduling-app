
# 📅 Faculty Room Scheduling System

A web-based application built with **React** and **Firebase** to manage and visualize faculty room schedules efficiently. This system allows for adding, editing, deleting, viewing, and exporting room schedules for subjects, faculty, and sections.

---

## ✨ Features

- ✅ Add, edit, and delete class schedules
- ✅ Dynamic schedule grid by day and room
- ✅ Export schedules as PDF (filtered by all, room, faculty, or section)
- ✅ Firestore integration for storing and syncing data
- ✅ Responsive UI with Tailwind CSS
- ✅ Firebase environment key protection using `.env`
- ✅ Subject, Faculty, Section, Room & Day dropdowns with search support

---

## 🛠 Technologies Used

- **React.js** (Vite)
- **Tailwind CSS**
- **Firebase Firestore**
- **Firebase Storage** (optional for PDF saving)
- **jsPDF** & **jspdf-autotable** (for PDF export)

---

## 📁 Folder Structure

```
src/
├── components/
│   ├── ScheduleForm.jsx
│   ├── TimeSlotGrid.jsx
│   └── ExportPDFButton.jsx
├── data/
│   └── initialData.js
├── firebase.js
├── utils/
│   └── timeUtils.js
└── App.jsx
```

---

## 🔐 Environment Variables

To keep Firebase credentials secure, store them in a `.env` file (not committed to GitHub):

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

👉 Example provided in `.env.example`

---

## 🚀 Getting Started

1. **Clone the repo**  
   ```bash
   git clone https://github.com/yourusername/faculty-room-scheduler.git
   cd faculty-room-scheduler
   ```

2. **Install dependencies**  
   ```bash
   npm install
   ```

3. **Set up your `.env` file**  
   Create a `.env` file in the root directory and copy the structure from `.env.example`.

4. **Run the app locally**  
   ```bash
   npm run dev
   ```

---

## 🧩 Future Enhancements

- Login & authentication for faculty/admin
- Conflict validation & suggestions
- Real-time updates with Firestore listeners
- Admin dashboard with analytics

---

## 🧑‍💻 Author

Developed by **[Your Name]**  
Instructor @ Cavite State University  
🔗 GitHub: [github.com/yourusername](https://github.com/yourusername)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
