# Image to PDF Converter

A full-stack TypeScript application that converts images into PDF files using a Node.js backend and a simple frontend interface.

---

##  Features

* Upload image files
* Convert images to PDF
* Download generated PDF
* Simple and clean UI
* REST API integration

---

##  Tech Stack

* Node.js
* TypeScript
* Express.js
* HTML, CSS, JavaScript

---

##  Project Structure

```
frontend/
  ├── index.html
  ├── style.css
  └── app.js

backend/
  ├── src/
  │    └── server.ts
  ├── package.json
  ├── tsconfig.json
```

---

##  Installation

### 1. Clone the repository

```
git clone https://github.com/YOUR_USERNAME/image-to-pdf-converter.git
cd image-to-pdf-converter
```

### 2. Install backend dependencies

```
cd backend
npm install
```

---

## ▶️ Run the Project

### Start backend server

```
npm run dev
```

### Open frontend

Open `frontend/index.html` in your browser

---

## 📡 API Endpoint

### Convert Image to PDF

```
POST /convert-image-to-pdf
```

---

##  Environment Variables

Create a `.env` file inside `backend/`:

```
APYHUB_TOKEN=your_token_here
PORT=3000
```

---

##  Author

Hadi Al Abbassi

---

