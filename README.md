# PG Academy - Learning Management System

*Zarqa University - Faculty of Information Technology - Software Engineering Department*  
*Graduation project document submitted as partial fulfillment for the Requirement for the Degree of B.Sc. in Software Engineering.*

**📅 June 2026**

---

## 📝 Abstract

The issues faced by online education include unstructured content delivery, lack of automated methods to track student progress, and inefficient certification processes. These issues have resulted in low levels of student engagement, affected integrity of assessments, and bottlenecks between instructors, students, and management.

To overcome these challenges, **PG Academy**, a comprehensive Learning Management System (LMS), has been developed. It provides an Internet-based platform that automates educational workflows, user management, and educational content provision. With a full-stack architecture, it integrates storage, business logic, and presentation layers through REST APIs, providing role-based access for Students, Instructors, and Admins.

## 🌟 Overview

PG Academy is a unique AI Learning Management System explicitly designed for Arab markets. The platform offers students a centralized location to search, view courses, complete quizzes, and earn certificates. Security is embedded with a Role-Based Access Control (RBAC) structure. Student progression is carefully managed, and upon meeting requirements, students automatically receive a QR-coded certificate for verification.

## ⚠️ Problem Statement

Institutions in the region face significant limitations with existing platforms (like Coursebox, Docebo, and Learn Upon):
- They are built predominantly for Western markets, lacking an Arab-first approach.
- They are expensive to operate.
- They force institutions to store private data on external servers, stripping them of data ownership.

## 💡 Proposed Solution

PG Academy provides an advanced, secure, and Arab-centric platform to eliminate these issues:
- **Data Sovereignty**: The platform runs on an in-house server (Azure VM) ensuring all data stays internal.
- **Intelligent AI Assistant**: Embedded in every lesson, an AI chat panel reads actual course material to answer questions, summarize material, or create practice problems via Azure AI + RAG.
- **Automated Progression**: Instructors can lock upcoming lessons until students pass attached quizzes.
- **Secure Content Delivery**: Videos stream using HLS in smaller chunks, protecting intellectual property from direct downloads.
- **Centralized Administration**: Administrators control all content, create bundles, and manage discount codes.
- **Automated Payments**: Integration with Stripe allows for single course purchases and subscriptions.

## 🛠️ Technology and Tools Used

The project is built around the principle of "Keep it simple — one server, one codebase", deployed on a single Azure Virtual Machine (Ubuntu 22.04).

| Component | Technology | Why |
| :--- | :--- | :--- |
| **Frontend & Backend** | Next.js 14 | One unified project for the website and API. |
| **Database** | PostgreSQL + Prisma ORM | Reliable schema-driven DB; Prisma prevents SQL injection. |
| **Database Deployment** | Shared server or remote DB | Set `DATABASE_URL` to the shared PostgreSQL host to allow all users to store and read the same data. |
| **Video Streaming** | HLS via Nginx | Videos stream in chunks — cannot be downloaded directly. |
| **Login / Sessions** | JWT Tokens | Secure authentication with short-lived tokens and refreshes. |
| **AI Assistant** | OpenAI API / Azure AI + RAG | Context-aware AI reads course content before answering. |
| **Web Server** | Nginx | Routes traffic, provides HTTPS, serves video securely. |
| **Payments** | Stripe | Native integration for simple purchases & subscriptions. |
| **Process Manager** | PM2 | Restarts the app automatically if it crashes. |

## 🔒 Security & Roles

PG Academy revolves around robust role management and security:
- **Admin**: Full control over courses, users, payments, analytics, and settings.
- **Instructor**: Can manage their own courses, upload videos, configure quizzes, and view their students' progress.
- **Student**: Can browse courses, enroll, watch videos, interact with the AI assistant, take quizzes, and earn QR-verified certificates.

*Key Security Features:*
- HTTPS encryption via Let's Encrypt.
- Password hashing via bcrypt.
- JWT token expiry protecting active sessions.
- Private video storage, streamed via signed HLS URLs.
- Automated daily PostgreSQL backups.

## 📂 Documentation & Roadmaps

To track our development progress and sprint estimates, please refer to the:
- [Agile Sprint Roadmap & Estimates](./docs/roadmap.md)
- [Database Schema Outline](./docs/database_schema.md)

---
*Created as part of the PG Academy Agile Development Cycle at Zarqa University.*
