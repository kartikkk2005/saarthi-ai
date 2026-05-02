# 🧠 Saarthi.AI – Multilingual Partner Acquisition Engine

## 📌 Overview

Saarthi.AI is an idea we developed to improve how Rupeezy onboards Authorized Persons (APs).

Right now, the process depends heavily on Relationship Managers (RMs), which creates delays and missed opportunities. Our goal is to introduce an AI-based system that can handle early-stage conversations with leads in a faster and more scalable way.

---

## 🚨 What’s the Problem?

From our understanding, the current system has a few clear issues:

* ⏱️ **Delayed Responses**
  Leads often come in outside working hours, and by the time someone follows up, the interest is already gone.

* 🌐 **Language Gap**
  Many potential partners are more comfortable in their native language, but communication is mostly limited.

* 📉 **Limited Capacity**
  Since RMs can only handle one person at a time, scaling becomes difficult during campaigns.

---

## 💡 Our Approach

Instead of replacing RMs, Saarthi.AI is designed to support them.

It works as a **first point of contact** that:

* responds instantly,
* talks in the user’s preferred language,
* filters serious leads,
* and passes only strong prospects to RMs.

This allows RMs to focus more on closing rather than initial screening.

---

## 🔑 Key Ideas Behind the System

### 🗣️ Multilingual Conversations

The system is designed to handle:

* Hindi, English, Hinglish, and regional languages
* Mixed-language inputs (like “mera broker better hai”)
* Replies in a similar language style as the user

---

### 🧠 Handling Objections

Instead of fixed scripts, the idea is to:

* understand what the user is saying,
* refer to predefined knowledge,
* and respond based on context.

---

### 📊 Lead Qualification

Each interaction contributes to a simple scoring system:

* 🔥 **Hot** → very interested, ready for RM
* 🌤️ **Warm** → interested but not fully convinced
* ❄️ **Cold** → low intent or not relevant

---

### 🔁 Conversation Memory

If a user drops off and comes back later,
the system should ideally continue from where it left off instead of starting over.

---

### 📲 Lead Routing

* Hot leads → sent directly to RM
* Warm leads → followed up through WhatsApp

---

## 🏗️ How We Imagine the System (Conceptual)

We are not implementing this fully yet, but the idea is:

* **Backend**: FastAPI (for handling requests asynchronously)
* **Frontend**: Simple dashboard (Next.js)
* **Database**: MongoDB
* **AI Components**:

  * Speech-to-Text → Whisper / Bhashini
  * Language Model → GPT-based
  * Text-to-Speech → ElevenLabs

---

## ⚠️ Challenges We Noticed

While thinking through this system, a few practical issues came up:

* Real-time voice delay can break the experience
* Users may interrupt while AI is speaking
* AI might generate incorrect or misleading responses

---

## 👥 Team Collaboration

This repository is maintained as a team project.

We are using a simple workflow:

* work on separate branches
* create pull requests
* review before merging

---

## 📜 License

MIT License

---

## ✍️ Contributors

* Kartik D Chendekar | Abhilash Tiwari | Kaushal Prakash
