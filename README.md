# 🚀 PromptAI Backend | Identity & Discovery Microservice

The high-performance core of the PromptAI platform, providing robust identity management, interest-based curation, and a high-fidelity prompt discovery API.

## 🛠️ Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Validation**: Zod (Molecular-level schema validation)
- **File Handling**: Multer + Cloudinary (Memory-buffer image processing)
- **Security**: JWT-based authentication with Bcrypt hash protection

## 📦 Key Features
- **Identity Synthesis**: Advanced profile management with professional bio and interest vaulting.
- **Discovery Engine**: Flexible, infinite-feed API for searching and filtering through vast prompt libraries.
- **Curation Logic**: Atomic operations for liking, saving (Collections), and high-fidelity commenting.
- **Moderation Ready**: Built-in status-cycle for prompt approval and oversight.

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- MongoDB (Atlas or Local)
- Cloudinary Account (for image assets)

### 2. Installation
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file in this directory with the following keys:
```env
PORT=5001
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
CLOUDINARY_CLOUD_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

### 4. Seed Data
To populate the system with professional curator profiles and premium prompt content:
```bash
npm run seed
```

### 5. Start Development
```bash
npm run dev
```
The API will be available at `http://localhost:5001/api`.

---
*Developed for the next generation of prompt engineers.*
