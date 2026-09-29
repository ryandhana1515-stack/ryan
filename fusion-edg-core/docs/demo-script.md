# Demo script (about 10 minutes, for a client)

**Setup** (before the meeting): `pnpm db:local && pnpm demo > demo.txt`. Or run it live in a terminal: `pnpm demo`.
Everything is FAKE data and MOCK messaging; say so up front.

1. **"A customer fills in your website form."**
   - Show step 1: the phone typed as "9000 0123" becomes +65 9000 0123, and the email is lower-cased.
   - *Point:* "One clean customer record, no typos creating duplicates."
2. **"Within a second, it's owned."**
   - Show the owner, the next action and its deadline.
   - *Point:* "Every enquiry has a person responsible and a time to act. Nothing sits unowned."
3. **"The same person then WhatsApps you."**
   - Step 2: the same contact and lead, the enquiry count goes to 2, and the owner is told to reply. No second
     auto-reply.
   - *Point:* "Your team sees one conversation, not two leads."
4. **"WhatsApp sometimes sends the same message twice."**
   - Step 3: ignored.
   - *Point:* "No double replies, no double counting."
5. **"What if WhatsApp is down?"**
   - Step 4: the enquiry and the lead are kept, and the unsent reply waits in the manual queue with an alert.
   - *Point:* "You never lose an enquiry."
6. **"Who can do what."**
   - Step 5: a salesperson cannot reassign leads; a manager can. Every attempt is logged.
7. **"Every morning at 8."**
   - Step 7: the CEO brief. The numbers come straight from the database.
   - Revenue says *data unavailable* because the accounting system isn't connected in the demo.
   - *Point:* "It never makes up a number."
8. **"Everything is on the record."**
   - Step 8: the audit trail: who, what, result.

**Close:**
- "This is the core we build your system on. For you, we connect your WhatsApp, your email and your accounting, and
  we set your team, your pipeline and your rules."
- Do **not** quote prices, timelines or guarantees: those come from Ryan.
