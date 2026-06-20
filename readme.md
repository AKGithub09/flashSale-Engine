# FlashSale Engine: High-Concurrency Booking Pipeline

A high-performance, fault-tolerant e-commerce backend built to handle extreme traffic spikes during flash sale events. This system prevents database race conditions, eliminates inventory overselling, secures endpoints from malicious scalping bots, and uses an asynchronous decoupled architecture to process background jobs seamlessly.

## 🏗️ System Architecture

The project was engineered across distinct phases to separate concerns and optimize scaling limits:

* **Phase 1: Secure Identity & Automated Registration:** Implements decoupled user onboarding using automated transactions and validation checks.
* **Phase 2: Decoupled Background Queues:** Offloads heavy operations (like verification email processing) away from the main server event loop into a dedicated microservice worker framework.
* **Phase 3: High-Concurrency Booking & Cache Acceleration:** Protects inventory data consistency at peak millisecond bursts using inline atomic queries and distributed caching layer configurations.
* **Phase 4: Security Shielding & Automated Traffic Simulation:** Hardens API layers against malicious scalpers and script crawlers while verifying performance boundaries through synthetic load execution.

---

## 🛠️ Technology Stack & Core Infrastructure

| Component | Technology | Purpose |
| :--- | :--- | :--- |
| **Runtime & Framework** | Node.js / Express | Event-driven architecture for handling inbound request streams. |
| **Primary Database** | MongoDB + Mongoose | Document storage handling core entity relations and active session transactions. |
| **Caching Layer** | Redis | Sub-millisecond read/write speeds for fast stock checks before database commits. |
| **Job Queue & Worker** | Upstash QStash (Local CLI Dev) | Asynchronous HTTP-based message queuing for decoupled background task processing. |
| **Security Shield** | Arcjet Shield | Smart anti-bot protection and token-bucket rate limiting to block rapid-click scripts. |
| **Mailing Sandbox** | Mailtrap | SMTP testing pipeline ensuring reliable, sandboxed OTP delivery verification. |

---

## 🚀 Key Engineering Challenges Solved

### 1. Eliminating Race Conditions (Inventory Leakage)
During a flash sale, thousands of concurrent requests read the exact same stock count simultaneously before updating it, leading to negative inventory balances (overselling). 
* **Solution:** Built a multi-layered check. Inventory thresholds are verified and decremented at sub-millisecond speeds in **Redis** via atomic operations. Successful checkouts are then guaranteed writing to **MongoDB** using an atomic database query (`$inc` coupled with a `{ stock: { $gt: 0 } }` conditional block), ensuring that stock updates only execute if an item is physically available.

### 2. Decoupling the Main Event Loop
Processing email lookups and network hands-offs to SMTP services inside the registration controller slows down API response times, introducing latency under load.
* **Solution:** Implemented **Upstash QStash** as a message broker pipeline. The registration API instantly offloads the task to the queue and returns a `201 Created` code to the client in milliseconds. The queue then independently wakes up an isolated webhook endpoint on our engine to deliver the email payload asynchronously.

---

## 📖 API Documentation

### Authentication Endpoints

#### `POST /api/v1/auth/register`
Creates a new pending user account and schedules an identity verification payload.
* **Body (JSON):**
    ```
```text?code_stdout&code_event_index=2
File successfully generated.

```json
    {
      "username": "buyer_akash",
      "email": "akash@example.com",
      "password": "SecurePassword123!"
    }
    ```

#### `POST /api/v1/auth/verify-otp`
Validates the temporary 6-digit code against lifecycle expiry windows to activate the profile.
* **Body (JSON):**
    ```json
    {
      "email": "akash@example.com",
      "otpCode": "225969"
    }
    ```

#### `POST /api/v1/auth/login`
Validates user credentials, ensures verification compliance, and issues an HTTP-Only secure cookie token.

---

### Flash Sale Booking Endpoints

#### `POST /api/v1/products`
Seeds a new limited-inventory flash sale entity.
* **Body (JSON):**
    ```json
    {
      "name": "PlayStation 5 Pro (Limited Deal)",
      "price": 499,
      "stock": 50
    }
    ```

#### `POST /api/v1/orders`
Executes high-concurrency atomic inventory deductions and registers a finalized order transaction block.
* **Body (JSON):**
    ```json
    {
      "productId": "65f2c5e...",
      "userId": "user_id_99"
    }
    ```

---

## 💻 Local Installation & Setup

1. Clone the repository and install application dependencies:
   ```bash
   npm install