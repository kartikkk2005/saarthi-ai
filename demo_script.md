# Saarthi.AI - Hackathon Demo Script

**Total Estimated Time:** 3-4 minutes  
**Presenters:** 1 or 2 (One driving the screen, one narrating, or one doing both)

---

## 1. Introduction & Greeting (0:00 - 0:45)

**[Screen: Showing the Saarthi.AI Landing Page]**

**Presenter:** 
"Hello everyone! Welcome to our demo of **Saarthi.AI**, a Multilingual Partner Acquisition Engine designed specifically for the financial services sector. 

Right now, onboarding financial partners like brokers or sub-brokers is a manual, high-friction process. Firms lose potential leads because of slow response times and language barriers. 

Saarthi.AI solves this by acting as an autonomous, intelligent front-line Relationship Manager. It talks to users in their native language, tracks their emotions in real-time, qualifies them, and hands only the hottest leads over to human teams. Let’s dive right into the user experience."

---

## 2. The Core Voice Experience & Language Routing (0:45 - 1:30)

**[Screen: Click 'Start Chat' / Transition to the Chat Interface. Ensure the mic is enabled.]**

**Presenter:** 
"Here we are on the main chat interface. You'll notice our OLED Emerald Glassmorphism design, which provides a premium feel. We built this using the native Web Speech API, so it listens and speaks instantly without expensive third-party speech-to-text delays.

Watch as I speak to it in a mix of Hindi and English—Hinglish."

**Action:** 
*Click the microphone button and speak:* 
> *"Hi, mujhe aapke partner program ke baare mein thoda aur janna hai. How does it work?"*

**[Screen: Wait for the AI's spoken response. Highlight the live transcription on screen.]**

**Presenter:** 
"As you can see, the AI's Language Router immediately detected the Hinglish dialect and responded perfectly in the same tone. It didn't force me into pure English or pure Hindi. This builds immediate rapport with the lead."

---

## 3. Live Emotion Radar & Anti-Hallucination (1:30 - 2:15)

**[Screen: Draw the judges' attention to the Emotion Pentagon Radar on the sidebar.]**

**Presenter:** 
"Now, look at the sidebar. This is our unique differentiator: the **Live Emotion Radar**. Every time I speak, our backend analyzes my sentence across 5 emotional axes: Excited, Curious, Skeptical, Frustrated, and Neutral.

Let me throw a tough objection at it to see how it handles a skeptical user."

**Action:** 
*Speak into the mic with a slightly frustrated/skeptical tone:* 
> *"Lekin main toh already aapke competitor ke saath kaam kar raha hu. Unka commission model much better hai, why should I switch?"*

**[Screen: The Emotion Radar morphs, spiking towards 'Skeptical' or 'Frustrated'. The Lead Score might dip slightly or stay neutral.]**

**Presenter:** 
"Notice the radar immediately spiked towards 'Skeptical'. Because of this, the AI dynamically softened its tone to be more empathetic. 

Even better, it triggered our **3-Layer Anti-Hallucination Engine**. Instead of letting the LLM invent a fake commission structure—which is a huge compliance risk in finance—the system intercepted the objection and pulled a legally approved, hardcoded rebuttal from our Knowledge Base."

---

## 4. Conversation Memory & Lead Qualification (2:15 - 2:45)

**[Screen: Show the Lead Score indicator on the UI]**

**Presenter:** 
"Throughout this conversation, Saarthi.AI is mathematically calculating my 'Lead Score'. It adds points for buying signals and deducts for rejections. It also features a persistent memory system. Even if this conversation goes on for 50 messages, the backend compresses the history into memory summaries, so the AI never forgets my context or details.

Let's give it a buying signal."

**Action:** 
*Speak into the mic enthusiastically:* 
> *"Wow, this sounds really good! I am ready to join. Next steps kya hain?"*

**[Screen: The Emotion Radar spikes to 'Excited'. The Lead Score jumps above 60. The AI responds by stopping the pitch and telling the user an RM will connect with them.]**

**Presenter:** 
"The radar spiked to 'Excited'! Because my lead score crossed the threshold of 60, the AI gracefully ended the pitch. It acts as a safety net—it never finalizes onboarding itself, but rather hands the hot lead over to a human Relationship Manager to close the deal."

---

## 5. Admin Dashboard & CRM Integration (2:45 - 3:30)

**[Screen: Navigate away from the chat and open the `/dashboard` route.]**

**Presenter:** 
"So, the lead is qualified. What happens on the business side? Welcome to the Command Center for Relationship Managers.

Here, RMs get a bird's-eye view of the funnel analytics—Total Contacted, Hot, Warm, and Cold leads. 

Instead of forcing an RM to read a massive 50-message transcript, we built a 'Generative Summary' feature. With one click..."

**Action:** 
*Click the 'Generate Summary' button on the most recent session.*

**[Screen: Show the generated summary popping up, displaying 'Recommended Action', 'Topics Covered', and 'Objections Raised'. Show the Sentiment Badges on the transcript.]**

**Presenter:** 
"...Gemini instantly analyzes the entire transcript and gives the RM exactly what they need to know before calling the client: What were the objections? What is the recommended action? 

We also have sentiment badges color-coding the transcript, and a Routing Simulator that easily pushes this structured data directly into a CRM or a WhatsApp nurture sequence for the warm leads."

---

## 6. Conclusion & Thank You (3:30 - 4:00)

**[Screen: Bring up a final slide or return to the main landing page.]**

**Presenter:** 
"In summary, Saarthi.AI is not just a chatbot. It is a fully decoupled, async platform that combines zero-latency native voice processing, real-time emotional intelligence, strict financial compliance, and seamless CRM handoffs.

We are transforming partner acquisition from a slow, manual chore into a highly scalable, engaging, and memory-aware experience. 

Thank you so much for your time, and we'd love to answer any questions you might have!"
