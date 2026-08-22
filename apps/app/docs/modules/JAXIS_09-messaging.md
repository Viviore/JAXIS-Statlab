# JAXIS — Module 09: Messaging & Communication Firewall

**Module Code:** `09-messaging`\
**Domain:** Messaging\
**Depends On:** `04-intake`, `08-assignment`\
**Blocks:** `10-analysis`\
**Realtime:** Supabase Realtime channels (`project:{projectId}`)

---

## 1. Module Identity

- **Primary Objective:** All client–Expert communication happens inside JAXIS. A server-side firewall detects prohibited external contact information (email, phone, GCash, social handles) and **blocks the entire message** — it is not delivered, not sanitized, and not editable. Admin can audit all blocked messages.
- **Core Responsibilities:** `Message` model, communication firewall regex engine, real-time messaging (polling or WebSocket), `BlockedMessageLog`, Admin blocked-message review queue.

---

## 2. Module Scope

### ✅ In Scope

| Feature ID | Feature |
|---|---|
| `MSG-F01` | **Project-scoped messaging** — Each project has its own thread; messages are scoped to the project participants (Client, assigned Statistician, Admin) |
| `MSG-F02` | **Communication firewall** — Server-side regex scan on content before persistence; matched messages are fully blocked |
| `MSG-F03` | **Full block (not sanitization)** — Blocked message saved with `is_blocked = true`; sender sees a block notification; recipient sees nothing |
| `MSG-F04` | **Prohibited pattern detection** — Email addresses, Philippine phone numbers, GCash/Maya/PayMaya/PayPal, WhatsApp/Viber/Telegram/Messenger/Facebook/Instagram/Twitter mentions, external URLs, `@` social handles |
| `MSG-F05` | **Admin blocked message queue** — Admin sees all blocked messages across all projects: content, sender, pattern detected, review status |
| `MSG-F06` | **Admin review** — Admin marks a blocked message as reviewed (no unblocking — block is permanent) |
| `MSG-F07` | **Message thread** — Participants see non-blocked messages in chronological order |
| `MSG-F08` | **Role labeling** — Messages show sender role label (Client / Statistician / Admin), not just name |
| `MSG-F09` | **Real-time delivery** — Supabase Realtime WebSocket channel per project (`project:{projectId}`); client subscribes via `supabase-js`; server broadcasts on new message via Supabase REST API. TanStack Query polling (5s interval) as dev fallback. |
| `MSG-F10` | **Admin can message** — Admin can send messages in any project thread (oversight) |
| `MSG-F11` | **Read receipts** — `readAt` timestamp per message per recipient (for new message notification in Module 16) |

### ❌ Explicitly Out of Scope

| Feature | Reason |
|---|---|
| Message editing or deletion by senders | Once sent (or blocked), the record is permanent for audit purposes |
| File/image attachments in messages | Files go through the formal project file upload system in Module 04/10 |
| Direct messaging between users outside a project | All messaging is project-scoped |
| Group video/voice chat | Out of MVP |
| Unblocking a blocked message | No pathway — block is final by design |



---

## 3. Database Schema

```prisma
model Message {
  id          String   @id @default(cuid())
  projectId   String
  senderId    String
  senderRole  RoleName
  content     String
  isBlocked   Boolean  @default(false)
  blockedReason String? // Which pattern triggered the block
  sentAt      DateTime @default(now())

  project Project @relation(fields: [projectId], references: [id])
  sender  User    @relation(fields: [senderId], references: [id])
  readReceipts MessageReadReceipt[]
  blockedLog   BlockedMessageLog?

  @@index([projectId])
  @@index([senderId])
  @@index([sentAt])
  @@index([isBlocked])
  @@map("messages")
}

model MessageReadReceipt {
  messageId String
  userId    String
  readAt    DateTime @default(now())

  message Message @relation(fields: [messageId], references: [id], onDelete: Cascade)
  user    User    @relation(fields: [userId], references: [id])

  @@id([messageId, userId])
  @@map("message_read_receipts")
}

model BlockedMessageLog {
  id              String   @id @default(cuid())
  messageId       String   @unique
  detectedPattern String   // The regex pattern name that matched
  matchedText     String   // The specific text that triggered detection
  reviewedBy      String?  // Admin userId
  reviewedAt      DateTime?
  reviewNotes     String?
  createdAt       DateTime @default(now())

  message Message @relation(fields: [messageId], references: [id])

  @@index([createdAt])
  @@index([reviewedBy])
  @@map("blocked_message_logs")
}
```

---

## 4. Communication Firewall Engine

```ts
// src/lib/messaging/firewall.ts
type FirewallResult =
  | { blocked: false }
  | { blocked: true; patternName: string; matchedText: string };

const PROHIBITED_PATTERNS: Array<{ name: string; regex: RegExp }> = [
  { name: 'EMAIL_ADDRESS',    regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g },
  { name: 'PH_MOBILE',        regex: /(\+?63|0)[\s-]?9\d{2}[\s-]?\d{3}[\s-]?\d{4}/g },
  { name: 'GCASH_MAYA',       regex: /\b(gcash|maya|paymaya|paypal|dragonpay)\b/gi },
  { name: 'MESSENGER_APP',    regex: /\b(whatsapp|viber|telegram|messenger|imessage)\b/gi },
  { name: 'SOCIAL_PLATFORM',  regex: /\b(facebook|instagram|twitter|tiktok|snapchat|discord)\b/gi },
  { name: 'SOCIAL_HANDLE',    regex: /@[a-zA-Z0-9_]{2,}/g },
  { name: 'EXTERNAL_URL',     regex: /https?:\/\/(?!jaxis\.)[a-zA-Z0-9][\w\-.]*\.[a-zA-Z]{2,}/gi },
];

export function runFirewall(content: string): FirewallResult {
  for (const { name, regex } of PROHIBITED_PATTERNS) {
    regex.lastIndex = 0; // Reset stateful regex
    const match = regex.exec(content);
    if (match) {
      return { blocked: true, patternName: name, matchedText: match[0] };
    }
  }
  return { blocked: false };
}
```

---

## 5. API Routes

| Method | Route | Role | Description |
|---|---|---|---|
| `POST` | `/api/v1/messages` | CLIENT, STATISTICIAN, ADMIN | Send message (firewall runs before save) |
| `GET` | `/api/v1/messages/:projectId` | CLIENT, STATISTICIAN, ADMIN | Get thread (blocked messages hidden for non-Admin) |
| `GET` | `/api/v1/admin/blocked-messages` | ADMIN, CEO | All blocked messages across all projects |
| `PATCH` | `/api/v1/admin/blocked-messages/:id/review` | ADMIN, CEO | Mark blocked message as reviewed |
| `POST` | `/api/v1/messages/:projectId/read` | Any participant | Mark messages as read (for unread count) |

### Zod Schema

```ts
export const SendMessageSchema = z.object({
  projectId: z.string().cuid(),
  content:   z.string().min(1).max(5000),
});
```

---

## 6. Real-Time Implementation (Supabase Realtime)

```ts
// src/lib/realtime.ts
import { supabaseClient } from '@/lib/supabase';

export function subscribeToProjectMessages(
  projectId: string,
  onMessage: (payload: Record<string, unknown>) => void,
) {
  const channel = supabaseClient
    .channel(`project:${projectId}`)
    .on('broadcast', { event: 'new_message' }, ({ payload }) => onMessage(payload))
    .subscribe();

  return () => supabaseClient.removeChannel(channel); // cleanup
}

// Server: broadcast after saving message
// src/features/messaging/actions.ts
export async function broadcastNewMessage(projectId: string, message: MessagePayload) {
  await supabaseAdmin
    .channel(`project:${projectId}`)
    .send({
      type:    'broadcast',
      event:   'new_message',
      payload: message,
    });
}
```

**Dev fallback:** If `NEXT_PUBLIC_SUPABASE_URL` is not set in `.env.local`, the `MessageThread` component falls back to polling `GET /api/v1/messages/:projectId` every 5 seconds via TanStack Query.

| Page | Route | Role | Description |
|---|---|---|---|
| Client Thread | `/dashboard/client/projects/:id/messages` | Client | Message thread + send input |
| Statistician Thread | `/dashboard/statistician/projects/:id/messages` | Statistician | Message thread + send input |
| Blocked Queue | `/dashboard/admin/messages` | Admin, CEO | Blocked message list with pattern, preview, review action |

---

## 7. Seed Data Requirements

```ts
const seedMessages = [
  {
    projectIntakeId: 'JAXIS-202608-0001',
    senderEmail:     'client@jaxis.dev',
    content:         'Hello! When can I expect the initial analysis to begin?',
    isBlocked:       false,
  },
  {
    projectIntakeId: 'JAXIS-202608-0001',
    senderEmail:     'stat@jaxis.dev',
    content:         'Hi! I have reviewed your research documents. I will begin the regression analysis this week.',
    isBlocked:       false,
  },
  // Seed one blocked message for Admin firewall demo
  {
    projectIntakeId: 'JAXIS-202608-0001',
    senderEmail:     'client@jaxis.dev',
    content:         'Can we chat on WhatsApp instead? My number is 09171234567.',
    isBlocked:       true,
    blockedReason:   'MESSENGER_APP',
  },
];
```

---

### 🎯 Expected Output (What you should be able to do now)

- [ ] **Project-Scoped Messaging Thread:** Client, assigned Statistician, and Admin can view and post in the dedicated project communication thread.
- [ ] **Communication Firewall Enforcement:** Server-side regex engine detects prohibited contact information (personal emails, PH phone numbers, GCash/Maya/PayPal, Telegram/Viber/FB/social handles, external URLs).
- [ ] **Zero-Leak Message Blocking:** Prohibited messages are blocked entirely (`isBlocked = true`); sender receives an immediate policy violation notice; recipient receives nothing.
- [ ] **Admin Firewall Review Queue:** Admin can audit all blocked communication attempts with sender, timestamp, detected pattern, and content in a dedicated review queue.
- [ ] **Realtime Delivery & Polling Fallback:** Instant messaging synchronization via Supabase Realtime WebSockets (`project:{projectId}`) with 5-second polling fallback in development.
- [ ] **Read Receipts & Participant Badges:** Messages clearly display sender role badges (`CLIENT`, `STATISTICIAN`, `ADMIN`) and track recipient `readAt` timestamps.


## 8. Acceptance Criteria (Done Checklist)

### Messaging
- [ ] Client can send a message to project thread → Statistician and Admin see it
- [ ] Statistician can send a message → Client and Admin see it
- [ ] Admin can send a message in any project thread
- [ ] Messages display sender role label (Client / Statistician / Admin)
- [ ] Thread is empty state when no messages exist

### Firewall
- [ ] Message with email address → blocked; `is_blocked = true`; recipient sees nothing
- [ ] Message with Philippine mobile number → blocked
- [ ] Message with GCash/Maya reference → blocked
- [ ] Message with WhatsApp/Telegram mention → blocked
- [ ] Message with `@socialhandle` → blocked
- [ ] Message with external URL (non-jaxis) → blocked
- [ ] Sender who sent a blocked message sees: `"Your message was blocked. Sharing external contact information is not permitted."`
- [ ] Normal messages (no prohibited content) are delivered successfully

### Admin Queue
- [ ] All blocked messages appear in Admin blocked-message queue
- [ ] Admin can see: project, sender, `detectedPattern`, `matchedText`, timestamp
- [ ] Admin can mark a blocked message as reviewed → `reviewedAt` set
- [ ] Client cannot access Admin blocked-message queue → 403

### Quality Gates
- [ ] `npm run check-types` → 0 errors
- [ ] `npm run lint` → 0 warnings/errors
- [ ] `npm run build` → clean
