### 🌟 Scenario 1: The "Hot" Lead (Shows off Hinglish & Objection Handling)
*Send these messages one by one in the `/chat` interface to watch the score increase and the lead turn **Hot**:*

1. **You:** `hi`
   * **Engine:** *(Greets you in English)*
   * **Status:** Score goes up slightly (Warm)
2. **You:** `mera already ek broker hai, aur mai khush hu`
   * **Engine:** *(Detects Hinglish and triggers the `already_have_broker` objection handling from the Knowledge Base)*
3. **You:** `accha, commission kitna milega?`
   * **Engine:** *(Detects the `low_commission` objection keywords and explains the 70% revenue share in Hinglish)*
4. **You:** `I am interested, tell me how to join`
   * **Engine:** *(Detects strong English interest keywords, switches to English, and asks for details)*
   * **Status:** Lead is now classified as **Hot (>75 Score)**!
   * **Next Step:** Go to the `/dashboard`, click this session, and hit **Simulate Routing**. It will assign an RM to this hot lead!

---

### ❄️ Scenario 2: The "Cold" Lead (Shows off pure Hindi & Rejection Handling)
*Refresh the chat page to start a new session, then send these messages:*

1. **You:** `नमस्ते`
   * **Engine:** *(Detects Devanagari script and replies in pure Hindi)*
2. **You:** `abhi mere paas time nahi hai, mai busy hoon`
   * **Engine:** *(Detects the `no_time` objection and replies politely about scheduling a 5-minute call later)*
3. **You:** `nahi, not interested`
   * **Engine:** *(Detects strong rejection keywords and politely closes the conversation)*
   * **Status:** Score drops heavily, lead is classified as **Cold**.
   * **Next Step:** Go to the `/dashboard`. Simulating routing on this session will simply drop them into an Automated Nurture Campaign instead of bothering an RM!

These two sequences perfectly demonstrate the AI's ability to seamlessly flip between languages, navigate standard objections dynamically, and actively score the prospect! Have fun testing!