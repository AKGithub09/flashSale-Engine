# FlashSale Engine: High-Concurrency Booking Pipeline (V2)

A high-performance, fault-tolerant e-commerce backend built to handle extreme traffic spikes during flash sale events. This system prevents database race conditions, eliminates inventory overselling, secures endpoints from malicious scalping bots, and uses a distributed message queue to serialize heavy transactions and process background jobs seamlessly.

## 🏗️ System Architecture

The project was engineered across distinct phases to separate concerns and optimize scaling limits:

* **Phase 1: Secure Identity & Automated Registration:** Implements decoupled user onboarding using automated transactions and validation checks.
* **Phase 2: Decoupled Background Queues (HTTP-based):** Offloads heavy operations (like verification email processing) away from the main server event loop using serverless webhook workflows.
* **Phase 3: High-Concurrency In-Memory Validation:** Protects inventory data consistency at peak millisecond bursts using inline atomic queries and distributed caching layer configurations.
* **Phase 4: Message Queue Buffering & Job Serialization (BullMQ):** Insulates the database layer during extreme transaction spikes by queuing order requests into a Redis-backed state machine processed sequentially by background workers.
* **Phase 5: Security Shielding & Automated Traffic Simulation:** Hardens API layers against malicious scalpers and script crawlers while verifying performance boundaries through synthetic load execution.

---

## 🛠️ Technology Stack & Core Infrastructure

| Component | Technology | Purpose |
| :--- | :--- | :--- |
| **Runtime & Framework** | Node.js / Express | Event-driven architecture for handling inbound request streams. |
| **Primary Database** | MongoDB + Mongoose | Document storage handling core entity relations and active session transactions. |
| **Caching & Queue Backend**| Redis | Sub-millisecond read/write speeds for fast stock checks and durable backing store for BullMQ state machines. |
| **Message Queue / Workers**| BullMQ | Redis-backed asynchronous task serialization, job buffering, and controlled worker execution. |
| **Job Queue & Mail Delivery**| Upstash QStash (Local Dev)| Asynchronous HTTP-based message queuing for decoupled verification task processing. |
| **Security Shield** | Arcjet Shield | Smart anti-bot protection and token-bucket rate limiting to block rapid-click scripts. |
| **Mailing Sandbox** | Mailtrap | SMTP testing pipeline ensuring reliable, sandboxed OTP delivery verification. |

---

## 🚀 Key Engineering Challenges Solved

### 1. Eliminating Race Conditions & DB Exhaustion (BullMQ + Atomic Queries)
During a flash sale, thousands of concurrent requests read the exact same stock count simultaneously before updating it, leading to negative inventory balances (overselling) and database connection exhaustion.
* **Solution:** Implemented a two-tiered safety net. Inbound requests are first throttled and pushed into a **BullMQ** queue backed by Redis, serializing the extreme ingestion spike. A dedicated worker pool processes these jobs sequentially at a controlled pace. The worker updates **MongoDB** using an atomic database query (`$inc` coupled with a `{ stock: { $gt: 0 } }` conditional block), ensuring that stock updates only execute if an item is physically available.

### 2. Durable Job Persistence vs In-Memory Arrays
Using standard JavaScript arrays or in-memory variables to manage a job queue risks complete data loss if the Node.js process crashes or restarts during a live sale.
* **Solution:** Integrated **BullMQ**, which serializes and persists every job state directly inside Redis data primitives (Lists, Hashes, and Sorted Sets). Even if the Express server crashes mid-sale, the state machine remains completely intact in Redis and resumes safely when the server reboots.

---

## 📖 API Documentation

### Authentication Endpoints

#### `POST /api/v1/auth/register`
Creates a new pending user account and schedules an identity verification payload.

#### `POST /api/v1/auth/verify-otp`
Validates the temporary 6-digit code against lifecycle expiry windows to activate the profile.

---

### Flash Sale Booking Endpoints

#### `POST /api/v1/products`
Seeds a new limited-inventory flash sale entity.
* **Body (JSON):**
    ```
```text?code_stdout&code_event_index=2
Updated README.md generated successfully.