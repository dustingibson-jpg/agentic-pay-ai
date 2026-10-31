# AgenticPay AI

An autonomous shopping and technical service assistant built for the **PayPal AI Hackathon**. AgenticPay AI evaluates plain-English user requests within a conversational interface, dynamically constructs tailor-made product or service offers, and embeds executable PayPal Checkout SDK widgets directly into the chat flow for instant, secure authorization.

---

## Features

- **Conversational Intent Matching:** Evaluates user needs (e.g., technical consultations, AI credit packages, starter plans) and returns dynamic offer cards.
- **Embedded PayPal SDK Integration:** Dynamically injects script tags and renders native PayPal checkout buttons without container duplication or DOM leakage.
- **OAuth 2.0 & Order Lifecycle Management:** Server-side authentication (`/v1/oauth2/token`) and order creation/capture (`/v2/checkout/orders`) using Express.js.

---

## Tech Stack

- **Backend:** Node.js, Express.js
- **Frontend:** Vanilla JavaScript, HTML5, CSS3
- **Payment Gateway:** PayPal REST APIs & JS SDK

---

## Local Setup & Installation

### Prerequisites

- [Node.js](https://nodejs.org/) (v16+ recommended)
- PayPal Developer Account (Sandbox Credentials)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/dustingibson/agentic-pay-ai.git
   cd agentic-pay-ai