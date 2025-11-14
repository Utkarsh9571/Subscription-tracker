# Subscription Tracker

A backend-first tracker to monitor recurring payments and notify users of upcoming charges.  
Built with **Node.js**, **Express.js**, and **MongoDB**, deployed on **AWS EC2** with **Docker** and **Nginx**.

---

## ✨ Features

- User authentication with **JWT**
- **Email verification** for new accounts
- **Password reset** functionality
- User profile update support
- Track subscriptions and upcoming payment dates
- Retry logic + timeout protection for external service calls

---

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Auth**: JWT
- **Deployment**: AWS EC2, Docker, Nginx reverse proxy
- **CI/CD**: GitHub Actions (pipeline setup)
- **Infra**: Linux CLI, contributor-safe documentation

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- MongoDB (local or Atlas)
- Docker (for containerized deployment)

### Installation

```bash
git clone https://github.com/your-username/subscription-tracker.git
cd subscription-tracker
npm install
```

### Run Locally

```bash
npm run dev
```

### Environment Variables

Create a `.env` file with:

```env
MONGO_URI=<your-mongo-uri>
JWT_SECRET=<your-secret>
EMAIL_SERVICE_API_KEY=<your-email-api-key>
```

---

## 📦 Deployment

- Containerized with Docker
- Reverse proxy + SSL termination via Nginx
- Deployed on AWS EC2 (manual provisioning)

---

## 📚 Roadmap

- Add monitoring with Prometheus + Grafana (exploring)
- Kubernetes manifests for scaling
- Terraform scripts for infra reproducibility

---

## 🤝 Contributing

Contributions are welcome! Please open an issue or PR with clear documentation.
