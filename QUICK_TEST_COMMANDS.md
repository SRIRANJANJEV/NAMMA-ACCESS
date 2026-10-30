# 🎤 Quick Test Commands for Voice Assistant

**Test these commands to verify everything works:**

---

## ✅ BASIC COMMANDS (Test First)

### 1. Greeting Test
**Say:** "Hello"  
**Expected:** AI greets you with time-based greeting (morning/afternoon/evening)

### 2. Help Test
**Say:** "What can you do?"  
**Expected:** AI lists all available commands in categories

---

## 🎯 ACTION COMMANDS (Phase 1)

### 3. Add Medicine (WITH NAME)
**Say:** "Add medicine Paracetamol"  
**Expected:**
- Medicine modal opens
- "Paracetamol" is pre-filled in name field
- AI says: "Opening medicine form with Paracetamol pre-filled"

### 4. Add Medicine (WITHOUT NAME)
**Say:** "Add medicine"  
**Expected:**
- Medicine modal opens with empty fields
- AI says: "Opening the medicine form. What medicine would you like to add?"

### 5. Check Medicines
**Say:** "Check my medicines"  
**Expected:**
- AI reads complete list of medicines with status (Taken/Due)
- Shows times, dosages
- AI says count: "You have X medicines scheduled"

### 6. Check Schedule
**Say:** "What's my schedule today?"  
**Expected:**
- AI reads medicines AND groceries for today
- Shows completed vs pending

### 7. Emergency Trigger
**Say:** "I need help"  
**Expected:**
- AI says: "EMERGENCY MODE ACTIVATED!"
- App navigates to Emergency page after 1.5 seconds
- Emergency SOS page opens with buttons

### 8. Add Grocery
**Say:** "Remind me to buy milk"  
**Expected:**
- AI adds "milk" to grocery list
- AI says: "Added 'milk' to your shopping list"
- Item appears in Senior Support → Groceries

---

## 🔍 VOICE SEARCH (Phase 2)

### 9. Find Medicine
**Say:** "Find medicine Aspirin"  
**Expected:**
- AI searches medicine database
- If found: Lists medicine with details
- If not found: "I couldn't find Aspirin. Would you like to add it?"

### 10. Next Reminder
**Say:** "When is my next reminder?"  
**Expected:**
- AI shows next upcoming grocery reminder
- Includes item name, quantity, date

### 11. Emergency Contacts
**Say:** "Show my emergency contacts"  
**Expected:**
- AI reads list of all emergency contacts
- Shows name, relationship, phone number
- If none: "You haven't added emergency contacts yet"

### 12. History Search
**Say:** "What did I add yesterday?"  
**Expected:**
- AI shows recent audit log entries
- Lists actions with time stamps

---

## 🚨 EMERGENCY ACTIONS (Phase 3)

### 13. Call Emergency Contact
**Say:** "Call my daughter"  
**Expected:**
- AI reads contact info
- Triggers phone dialer (tel: link)
- If no contacts: "I couldn't find your emergency contacts"

### 14. Read Medical Info
**Say:** "Read my medical info"  
**Expected:**
- AI speaks: Name, Age, Mobile, Medicine count, Contact count
- Complete profile summary

### 15. Hospital Info
**Say:** "Hospital nearby"  
**Expected:**
- AI lists Bengaluru emergency numbers:
  - Karnataka Emergency (112)
  - BBMP (1533)
  - Manipal, Apollo hospitals

---

## 🌍 MULTI-LANGUAGE TEST

### 16. Switch to Kannada
**Action:** Click "ಕನ್ನಡ" button  
**Then Say (in English):** "Add medicine Aspirin"  
**Expected:**
- AI responds in KANNADA
- Voice synthesis speaks Kannada
- Form opens correctly

### 17. Switch to Hindi
**Action:** Click "हिंदी" button  
**Then Say:** "Check my medicines"  
**Expected:**
- AI responds in HINDI
- Voice synthesis speaks Hindi
- Shows medicine list

---

## 🎭 ADVANCED TESTS

### 18. Context Awareness
**Say:** "Add medicine"  
**AI Response:** "What medicine would you like to add?"  
**Then Say:** "Paracetamol"  
**Expected:** Should understand context (this is a follow-up)

### 19. Natural Variations
**Try these variations:**
- "Show me my medicines" (instead of "Check")
- "I want to add medicine" (instead of "Add medicine")
- "Help me" (instead of "I need help")

### 20. Error Handling
**Say:** "Blahblahblah nonsense"  
**Expected:**
- AI says: "I didn't quite catch that. Try: 'Add medicine', 'Check my schedule'..."
- Provides helpful suggestions

---

## 🐛 TROUBLESHOOTING

### Voice Not Working?
1. Check browser permissions (Chrome → Settings → Microphone)
2. Try typing command instead (works identically)
3. Refresh page and allow microphone access

### AI Not Responding?
1. Check console for errors (F12)
2. Ensure you're on correct page
3. Try clicking voice button again

### Modal Not Opening?
1. Check if medicine modal code is loaded
2. Try "Add medicine" without medicine name first
3. Check browser console for React errors

---

## ✅ SUCCESS CRITERIA

**All tests pass if:**
- [ ] AI responds with voice synthesis
- [ ] Modals open on correct commands
- [ ] Navigation happens (emergency page)
- [ ] Data is saved (medicines, groceries)
- [ ] Search returns real results
- [ ] Multi-language switching works
- [ ] Emergency contacts display correctly

---

## 🎯 DEMO PRIORITY COMMANDS (Memorize These)

For judges, demonstrate in this order:

1. **"Add medicine Paracetamol"** ← Shows action
2. **"Check my medicines"** ← Shows search
3. **"I need help"** ← Shows emergency
4. **Switch to Kannada + "Add medicine Aspirin"** ← Shows multi-language

---

**Good luck! 🚀**

*Test all commands before demo day to ensure smooth presentation.*
