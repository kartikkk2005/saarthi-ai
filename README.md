# 🧠 Saarthi.AI – Multilingual Partner Acquisition Engine

## 📌 Overview

Saarthi.AI is a conceptual AI-driven system designed to optimize Rupeezy’s Authorized Person (AP) acquisition pipeline.

It addresses inefficiencies in traditional Relationship Manager (RM)-driven workflows by introducing a scalable, multilingual, and real-time lead qualification layer.

---

## 🚨 Problem

The current system suffers from three major bottlenecks:

* ⏱️ **Latency Trap**
  Leads decay quickly; RMs cannot respond instantly outside business hours.

* 🌐 **Linguistic Barrier**
  Single-language communication reduces trust in Tier-2 and Tier-3 markets.

* 📉 **Throughput Ceiling**
  RMs operate in a 1:1 model, limiting scalability.

---

## 💡 Proposed Solution

Saarthi.AI acts as an intelligent front-line agent that:

* Responds instantly (24/7)
* Supports multilingual and code-mixed conversations
* Qualifies leads using a scoring system
* Routes high-intent users to human RMs

---

## 🔑 Core Concepts

### 🗣️ Multilingual Interaction

* Dynamic language detection (Hindi, English, Hinglish, regional languages)
* Context-aware responses in mixed language

### 🧠 Objection Handling

* Retrieval-based responses (RAG approach)
* Context-sensitive rebuttals

### 📊 Lead Qualification

* Real-time scoring based on intent signals
* Categories:

  * 🔥 Hot (>75)
  * 🌤️ Warm (40–75)
  * ❄️ Cold (<40)

### 🔁 Multi-turn Memory

* Conversation continuity across sessions

### 📲 Smart Handoff

* Hot leads → RM
* Warm leads → WhatsApp follow-up

---

## 🏗️ High-Level Architecture (Conceptual)

* Backend: FastAPI (async processing)
* Frontend: Dashboard (Next.js)
* Database: MongoDB
* AI Stack:

  * STT: Whisper / Bhashini
  * LLM: GPT-based models
  * TTS: ElevenLabs

---

## ⚠️ Challenges & Considerations

* Voice latency in real-time conversations
* Handling interruptions (user speaking over AI)
* Preventing hallucinated responses

---

## 👥 Collaboration

This repository is maintained as a **team project**.

### Workflow:

* Create branches for changes
* Use pull requests for merging
* Maintain clear commit messages

---

## 📜 License

MIT License

---

## ✍️ Contributors

* Add team members here
