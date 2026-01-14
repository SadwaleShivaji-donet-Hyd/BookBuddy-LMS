# 📚 BookBuddy: Library Management System

**BookBuddy** is a high-performance, full-stack library management platform built on a **Microservices Architecture**. It streamlines book inventory and circulation tracking through a distributed system designed for scalability, security, and a minimalist user experience.

---

## 🏗️ Architecture Overview

The system utilizes a decoupled architecture to ensure independent service scalability and clear separation of concerns:

* **API Gateway (Ocelot):** Acts as the centralized entry point, routing client requests to the appropriate internal microservices.
* **Catalog Microservice:** Manages the book repository, handling CRUD operations and real-time stock availability.
* **Circulation Microservice:** Records book transactions (issues/returns). It performs inter-service communication via `HttpClient` to update stock levels and enrich data with book details.
* **Identity Service:** Provides secure access via **JWT (JSON Web Tokens)**, enforcing role-based authorization for administrative tasks.
* **Minimalist UI:** A lightweight, responsive React dashboard that prioritizes efficiency and clean design.

---

## 🛠️ Technology Stack

| Layer          | Technologies                                     |
| :------------- | :----------------------------------------------- |
| **Frontend** | React 18, Vite, Axios, React Router, JWT-Decode |
| **Backend** | .NET 8, C#, ASP.NET Core Web API                |
| **Gateway** | Ocelot API Gateway                               |
| **Database** | SQL Server, Entity Framework Core (Code First)   |
| **Security** | JWT Authentication, Role-Based Access Control     |

---

## 🚀 Getting Started

### 1. Prerequisites
* [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
* [Node.js](https://nodejs.org/) (v18+)
* SQL Server (LocalDB or Express)

### 2. Backend Configuration
1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-username/BookBuddy-LMS.git](https://github.com/your-username/BookBuddy-LMS.git)
    ```
2.  **Apply Database Migrations:**
    Execute migrations for both core services:
    ```bash
    dotnet ef database update --project Library.Catalog
    dotnet ef database update --project Library.Circulation
    ```
3.  **Run the Services:**
    Launch the services in the following order:
    1. `Library.Catalog`
    2. `Library.Circulation`
    3. `Library.Gateway` (Ocelot)

### 3. Frontend Configuration
1.  **Navigate to the frontend directory:**
    ```bash
    cd library-frontend
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Run the application:**
    ```bash
    npm run dev
    ```

---

## 📖 Key Features

* **Secure Admin Login:** JWT-protected routes ensure only authorized administrators can manage data.
* **Inventory CRUD:** Complete management of the book catalog with ISBN tracking.
* **Inter-Service Orchestration:** Automated stock synchronization between the Circulation and Catalog services.
* **Data Enrichment:** Circulation views dynamically aggregate data from multiple services to show book titles instead of raw IDs.
* **Minimalist UI:** Built with a "Zero-CSS-Framework" approach using optimized React state management for maximum speed.

---

## 🔗 API Endpoints (Gateway Access)

| Method | Endpoint                    | Description                                  |
| :----- | :-------------------------- | :------------------------------------------- |
| `POST` | `/api/auth/login`           | Authenticate admin and receive JWT token     |
| `GET`  | `/api/books`                | Retrieve all books in the inventory          |
| `POST` | `/api/circulation/issue`    | Issue a book to a user (decrements stock)    |
| `POST` | `/api/circulation/return`   | Return a book (increments stock)             |
| `GET`  | `/api/circulation/issued`   | View active issues with enriched book titles |

---
