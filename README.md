# WASPL - Digital Assessment Platform (Pre-Alpha)

## Overview
WASPL is an open-source **digital assessment platform** designed to create, manage, and run online tests efficiently. Built with **Node.js, Vue 3, MongoDB, and Docker**, WASPL allows educators and test managers to construct dynamic assessments, integrate interactive question types, and analyze test results with advanced reporting tools.

> ⚠️ **Pre-Alpha Version**: This project is still in early development. Features may change, and the platform is not yet production-ready.

---

## Features
- **Test Editor:** Create tests with various interaction types (choice, ordering, text gaps, etc.).
- **Test Runner:** Deliver tests to participants in a structured and secure manner.
- **MongoDB Storage:** All test data is stored in a centralized database.
- **Containerized Deployment:** Easily deploy the platform using Docker.

---

## Installation (Docker-Based)

### **Prerequisites**
- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)

### **Clone the Repository**
```bash
git clone https://github.com/yourusername/waspl.git
cd waspl
```

### **Set Up Environment Variables**
Create a `.env` file at the root of each application (waspleditor and wasplTestrunner) and configure necessary variables (example values below):
```ini
MONGO_URI=mongodb://admin:password@waspl-mongodb:27017/waspldata?authSource=admin
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://waspl-editor:4000
```

### **Build and Start the Containers**
```bash
docker-compose up --build -d
```
This will:
- Start a **MongoDB** container for storing test data.
- Start the **WASPL backend and frontend** containers.

### **Accessing the Application**
Once the containers are running, you can:
- Access the **WASPL Editor** at `http://localhost:5173`
- Run tests using the **WASPL TestRunner** at `http://localhost:5174`

### **Stopping the Containers**
To stop the running containers, use:
```bash
docker-compose down
```

---

## Development Mode (Without Docker)
If you prefer running WASPL manually, ensure that you have **Node.js (16+), MongoDB**, and the required dependencies installed.

1. **Start MongoDB** (if not using Docker)
   ```bash
   mongod --dbpath ./mongodb
   ```
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Start the backend and frontend**
   ```bash
   npm run dev
   ```

---

## Roadmap
- [ ] Implement user authentication
- [ ] Improve the test-taking experience
- [ ] Add AI-powered feedback and analysis
- [ ] Enhance reporting and analytics features

---

## Contributing
Contributions are welcome! If you’d like to contribute, please fork the repository, create a feature branch, and submit a pull request.

---

## License
TBD - The project will adopt an open-source license with an optional subscription model.

---

## Disclaimer
This software is in **pre-alpha**. Use at your own risk, and do not deploy it in a production environment yet.

