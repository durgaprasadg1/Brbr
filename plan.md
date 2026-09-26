# BARBER SHOP QUEUE MANAGEMENT SYSTEM
# ANTIGRAVITY MASTER IMPLEMENTATION PLAN
# Version 1.0

## 1. PROJECT GOAL
Build a web-based Barber Shop Queue Management System.
Roles: CUSTOMER, OWNER, ADMIN.

Customer flow:
Register/login with mobile OTP -> discover shops -> select services -> pay ->
submit queue request -> owner accepts -> enter active queue -> monitor position
and ETA in realtime -> arrive -> service starts -> optional extra service/payment
-> service completes -> history/review.

Owner flow:
Register/login -> create shop -> submit for admin approval -> manage shop/services
-> open/close shop -> receive queue requests -> accept/reject -> manage active
queue -> start/complete/skip/cancel service -> view history and earnings.

Admin flow:
Login -> approve/reject shops -> manage/disable shops -> manage users ->
platform analytics.

## 2. FINALIZED STACK
Frontend: React + Vite + Tailwind CSS + React Router.
Backend: Node.js + Express + JavaScript.
Architecture: Feature-based Modular Monolith.
Database: MySQL 8 using mysql2 + raw SQL.
Realtime: Server-Sent Events (SSE).
Cache/locks/jobs: Redis + BullMQ.
Payments: Razorpay.
OTP: Twilio initially, behind an OTP provider abstraction.
Images: AWS S3.
Maps: React Leaflet + OpenStreetMap ecosystem.
Email: Nodemailer initially, behind EmailProvider abstraction.
Validation: Zod.
Auth: JWT in HTTP-only cookie + RBAC.
ML: Separate Python ETA service, added later.
Deployment: AWS EC2 later.
Logging: Structured JSON/file logging initially; AWS logging later.

## 3. NON-NEGOTIABLE ARCHITECTURE
MySQL is the source of truth.
The queue is NOT a JavaScript array and NOT authoritative Redis state.
Node.js/Express contains the Queue Engine.
REST APIs perform state changes.
SSE only pushes committed state changes to browsers.
Redis/BullMQ supports locks, caching and background jobs.
Controllers stay thin; services contain business logic; repositories contain SQL.
Use parameterized SQL.
Use transactions and row-level locking for queue mutations.
Emit SSE only after the DB transaction commits.

## 4. PROJECT STRUCTURE
backend/src/modules/
  auth/
  users/
  shops/
  queue/
  payments/
  reviews/
  notifications/
  admin/
backend/src/common/
  middleware/
  errors/
  validation/
  logger/
  db/
  redis/
  events/
backend/src/jobs/
  queue-expiration.job.js
  shop-closing.job.js
  email.job.js

The Queue Engine lives in:
modules/queue/queue.service.js

Important Queue Service methods:
createRequest()
acceptRequest()
rejectRequest()
expireRequest()
getQueue()
getCustomerQueuePosition()
reorderQueue()
markArrived()
startService()
completeService()
skipCustomer()
cancelQueueEntry()
requestCancellation()

## 5. DATABASE — FINAL 12 TABLES

### users
id BIGINT PK AUTO_INCREMENT
name VARCHAR(100) NOT NULL
phone VARCHAR(15) UNIQUE NOT NULL
role ENUM(CUSTOMER, OWNER, ADMIN) NOT NULL
is_verified BOOLEAN DEFAULT FALSE
is_active BOOLEAN DEFAULT TRUE
is_deleted BOOLEAN DEFAULT FALSE
created_at DATETIME
updated_at DATETIME

### shops
id BIGINT PK AUTO_INCREMENT
owner_id BIGINT FK users.id UNIQUE
name VARCHAR(150) NOT NULL
description TEXT NULL
address TEXT NOT NULL
latitude DECIMAL(10,8) NOT NULL
longitude DECIMAL(11,8) NOT NULL
contact_number VARCHAR(15) NOT NULL
opening_time TIME NOT NULL
closing_time TIME NOT NULL
is_opened BOOLEAN DEFAULT FALSE
average_rating DECIMAL(2,1) DEFAULT 0.0
total_ratings INT DEFAULT 0
status ENUM(PENDING, ACTIVE, REJECTED, DISABLED) NOT NULL
rejection_reason TEXT NULL
is_deleted BOOLEAN DEFAULT FALSE
created_at DATETIME
updated_at DATETIME

### shop_images
id BIGINT PK AUTO_INCREMENT
shop_id BIGINT FK shops.id
image_url TEXT NOT NULL
display_order INT DEFAULT 0
created_at DATETIME

### services
id BIGINT PK AUTO_INCREMENT
shop_id BIGINT FK shops.id
name VARCHAR(100) NOT NULL
price DECIMAL(10,2) NOT NULL
duration_minutes INT NOT NULL

### queue_requests
id BIGINT PK AUTO_INCREMENT
customer_id BIGINT FK users.id
shop_id BIGINT FK shops.id
status ENUM(REQUESTED, ACCEPTED, REJECTED, EXPIRED, CANCELLED) NOT NULL
requested_at DATETIME NOT NULL
expires_at DATETIME NULL

expires_at = requested_at + exactly 10 minutes.

### queue_request_services
id BIGINT PK AUTO_INCREMENT
queue_request_id BIGINT FK queue_requests.id
service_id BIGINT FK services.id
price_at_booking DECIMAL(10,2) NOT NULL

### queue_entries
id BIGINT PK AUTO_INCREMENT
queue_request_id BIGINT FK queue_requests.id
customer_id BIGINT FK users.id
shop_id BIGINT FK shops.id
queue_position INT NOT NULL
status ENUM(WAITING, IN_SERVICE, COMPLETED, SKIPPED, CANCELLED, PAYMENT_PENDING) NOT NULL
joined_at DATETIME NOT NULL

### payments
id BIGINT PK AUTO_INCREMENT
queue_request_id BIGINT FK queue_requests.id
amount DECIMAL(10,2) NOT NULL
status ENUM(CREATED, SUCCESS, FAILED, REFUND_PENDING, REFUNDED) NOT NULL
payment_type ENUM(QUEUE_PAYMENT, EXTRA_SERVICE_PAYMENT) NOT NULL
razorpay_order_id VARCHAR(100) NULL
razorpay_payment_id VARCHAR(100) NULL
created_at DATETIME NOT NULL

### service_sessions
id BIGINT PK AUTO_INCREMENT
queue_entry_id BIGINT FK queue_entries.id
service_id BIGINT FK services.id
start_time DATETIME NULL
end_time DATETIME NULL
actual_duration INT NULL
status ENUM(PENDING, IN_SERVICE, COMPLETED, CANCELLED) NOT NULL

### reviews
id BIGINT PK AUTO_INCREMENT
customer_id BIGINT FK users.id
shop_id BIGINT FK shops.id
queue_entry_id BIGINT FK queue_entries.id UNIQUE
rating TINYINT NOT NULL
feedback_text TEXT NULL
created_at DATETIME NOT NULL

Rating 1-5. One review per queue entry.
No separate feedback-tags table.

### favorites
id BIGINT PK AUTO_INCREMENT
customer_id BIGINT FK users.id
shop_id BIGINT FK shops.id
UNIQUE(customer_id, shop_id)

### notifications
id BIGINT PK AUTO_INCREMENT
user_id BIGINT FK users.id
type VARCHAR(50) NOT NULL
title VARCHAR(150) NOT NULL
message TEXT NOT NULL
is_read BOOLEAN DEFAULT FALSE
created_at DATETIME NOT NULL

## 6. ID POLICY
Use BIGINT AUTO_INCREMENT for all database IDs and BIGINT foreign keys.
Do not switch to UUID/string IDs in V1 without explicit approval.

## 7. SHOP RULES
One owner has one shop in V1.
Shop status controls approval/public lifecycle:
PENDING -> ACTIVE or REJECTED; DISABLED is admin-controlled.
is_opened controls current operational state.
ACTIVE + FALSE = approved but closed.
ACTIVE + TRUE = open.
Owner can open/close manually.
Configured closing time sets is_opened=false.
Closed shops do not accept new queue requests.
Admin approval is mandatory before public visibility.
Rejected shops require a rejection reason and can be edited/resubmitted.

Location:
Owner selects coordinates on a Leaflet map using click/draggable marker.
Address is human-readable; no address-to-coordinate dependency.
Use OpenStreetMap ecosystem; do not introduce Google Maps/Mapbox in V1.
Shop image files go to S3; DB stores URL/reference and display order.

## 8. AUTH RULES
Single users table with role ENUM.
Customer and owner use mobile + OTP.
Twilio is the initial OTP provider.
OTP provider must be abstracted.
JWT is stored in HTTP-only cookie.
RBAC is enforced server-side.
is_verified, is_active and is_deleted must be checked appropriately.
Never trust frontend role/permissions.

## 9. QUEUE BUSINESS RULES
Customer can have only one active queue at a time.
Customer selects one or more services.
Customer pays before queue request processing.
Owner receives request and must accept/reject.
Only ACCEPTED requests create queue_entries.
Request expires exactly 10 minutes after creation if unanswered.
Rejected/expired requests enter manual refund workflow.
Maximum active queue size = 15 by default.
Initial queue order is FCFS.
Owner can manually reorder active queue.
Queue position is an integer.
MySQL is authoritative.
Queue mutations require transactions and row locking where needed.

Queue request states:
REQUESTED -> ACCEPTED / REJECTED / EXPIRED / CANCELLED

Queue entry states:
WAITING -> IN_SERVICE -> COMPLETED
Other states: SKIPPED, CANCELLED, PAYMENT_PENDING.

## 10. QUEUE ENGINE IMPLEMENTATION
acceptRequest():
1. Begin MySQL transaction.
2. SELECT request FOR UPDATE.
3. Verify owner owns the shop.
4. Verify request is REQUESTED.
5. Verify shop is ACTIVE and open.
6. Check active queue count < 15.
7. Lock/reliably inspect active queue rows.
8. Calculate next queue_position.
9. INSERT queue_entries.
10. UPDATE queue_requests -> ACCEPTED.
11. COMMIT.
12. Emit QUEUE_ACCEPTED after commit.

Do not use an in-memory JS queue.

When service completes:
WAITING customers are repositioned as required.
Positions and ETA are recalculated.
SSE is emitted after commit.

Manual reorder:
Owner sends desired queue order.
Backend validates ownership and active status.
Backend performs reorder in one transaction.
Commit -> emit QUEUE_REORDERED/QUEUE_POSITION_CHANGED.

Concurrency:
Two simultaneous joins must never receive the same queue position.
Use MySQL transaction + row-level locking.

## 11. CUSTOMER ARRIVAL / SKIPPING
Customer may arrive early; GPS is not mandatory.
Owner can manually mark arrived.
When customer is #1, owner starts service when ready.
If customer is not present, owner waits 5 minutes.
Customer remains #1 during that period.
Then owner can skip/push back.
Possible reasons: CUSTOMER_NOT_PRESENT, CUSTOMER_REQUESTED, OTHER.
If persistence of skip reason requires schema change, explicitly review before adding it.

## 12. SERVICE LIFECYCLE
Owner actions:
Accept Request
Reject Request
Start Service
Complete Service
Skip/Push Back
Cancel Service
Contact Customer

Start:
queue_entry WAITING -> IN_SERVICE
service_session.start_time = now
service_session.status = IN_SERVICE

Complete:
service_session.end_time = now
actual_duration = end-start
service_session.status = COMPLETED
queue_entry.status = COMPLETED

Customer cancellation requires owner approval.
Owner cancellation uses the agreed manual refund rule.
Refund execution is manual in V1.

## 13. EXTRA SERVICES
Allowed only while customer is IN_SERVICE.
Flow:
IN_SERVICE -> add service -> PAYMENT_PENDING -> successful payment -> IN_SERVICE.
Owner cannot complete while required extra payment is pending.
Use payment_type = EXTRA_SERVICE_PAYMENT.

## 14. PAYMENTS
Use Razorpay.
Payment flow:
Create payment record CREATED
-> create Razorpay order
-> checkout
-> Razorpay payment
-> webhook
-> signature verification
-> idempotent DB update
-> SUCCESS/FAILED

Never trust only the frontend callback.
Store Razorpay order/payment IDs for reconciliation.
Do not show Razorpay IDs in customer payment history.
Refund execution is manual; no separate refunds table in V1.

## 15. ETA
Initial ETA is rule-based:
customers ahead x relevant service duration.
Recalculate after join, completion, skip, cancellation, reorder.
Store actual service duration in service_sessions.
Later:
MySQL historical durations -> Python ML service -> predicted ETA.
ML is optional and must never block core queue operation.
Fallback to rule-based ETA if ML service is unavailable.

## 16. REALTIME
Use Server-Sent Events.
REST changes state; SSE delivers changes.

Events:
QUEUE_ACCEPTED
QUEUE_REJECTED
QUEUE_EXPIRED
QUEUE_REORDERED
QUEUE_POSITION_CHANGED
TURN_APPROACHING
SERVICE_STARTED
SERVICE_COMPLETED
SERVICE_CANCELLED
EXTRA_PAYMENT_PENDING
EXTRA_PAYMENT_SUCCESS

Initial page load:
REST -> current queue state.

Realtime:
SSE -> React state update.

If SSE disconnects:
reconnect and fetch current state via REST.
Do not treat client memory as authoritative.

## 17. REDIS / BULLMQ
Redis is supporting infrastructure, not queue source of truth.
Use it for:
- distributed locks where necessary
- caching
- temporary state
- BullMQ
- delayed expiration
- shop-closing jobs
- email jobs
- future analytics/ML jobs

## 18. NOTIFICATIONS
Persistent in-app notifications use notifications table.
SSE provides realtime delivery.
Important notifications:
request accepted/rejected/expired
turn approaching
service started/completed
cancellation status
extra payment status

Email:
Nodemailer initially, provider abstraction, async via BullMQ.
Mobile/browser push is future scope.

## 19. CUSTOMER FEATURES
- Register/login
- OTP verification
- Shop listing
- Search by shop name/area/services
- Sort by distance/waiting time/price
- Filter by distance/location/price/queue time
- Shop details
- Services/prices
- Queue info
- Map
- Contact shop
- Favorites
- Select multiple services
- Pay
- Queue request
- Live queue position
- ETA
- History
- Payment history
- Reviews
- Notifications

## 20. OWNER FEATURES
- Register/login
- Create/edit shop
- Map location
- Upload/manage images
- Manage services
- Submit shop for approval
- Open/close shop
- Pending requests
- Accept/reject
- Current queue
- Manual reorder
- Mark arrived
- Start service
- Complete service
- Skip/push back
- Cancel
- Contact customer
- Daily/weekly/monthly earnings
- Completed/cancelled/refunded breakdown
- Customer/service history
- Feedback

## 21. ADMIN FEATURES
- Login
- Review pending shops
- Approve shop
- Reject with mandatory reason
- View/disable shops
- Manage customers
- Manage owners
- Deactivate accounts
- Platform analytics

## 22. VALIDATION / ERRORS / SECURITY
Use Zod for request validation.
Use centralized error middleware.
Use parameterized SQL.
Use HTTP-only JWT cookies.
Use RBAC and ownership checks.
Rate-limit all APIs.
Use stricter limits for OTP/auth/payment endpoints.
Do not leak stack traces in production.
Use structured JSON logs.
Do not log OTPs, passwords, secrets or phone numbers.
Use shopId/ownerId where useful for correlation.
Soft delete where finalized.

Suggested API error:
{
  "success": false,
  "error": {
    "code": "QUEUE_FULL",
    "message": "The queue is currently full."
  }
}

## 23. DEVELOPMENT PHASES

### PHASE 0 — FOUNDATION
Build:
- Node/Express
- React/Vite/Tailwind
- feature-based structure
- .env
- MySQL connection
- Redis connection
- Zod
- centralized errors
- logger
- health endpoint
- test setup

Exit:
Frontend and backend run.
MySQL connects.
Health endpoint works.

### PHASE 1 — AUTH & USERS
Build:
- users table
- customer/owner registration
- OTP abstraction + Twilio
- OTP verification
- login/logout
- JWT HTTP-only cookie
- RBAC

Exit:
Customer and owner can register/login.
Protected APIs enforce roles.

### PHASE 2 — SHOP MANAGEMENT
Build:
- shops
- shop_images
- services
- CRUD
- S3 image storage
- Leaflet/OSM map
- open/close
- admin approval/rejection/resubmission/disable

Exit:
Owner creates shop -> admin approves -> shop becomes ACTIVE -> owner opens shop.

### PHASE 3 — CUSTOMER DISCOVERY
Build:
- listing
- search
- filters
- sorting
- distance
- details
- services/prices
- map
- favorites
- queue information

Exit:
Customer can discover and inspect shops.

### PHASE 4 — QUEUE CORE
Implement in order:
1. queue_requests
2. queue_request_services
3. queue_entries
4. create request
5. accept request
6. reject request
7. expiration
8. queue position
9. queue limit
10. one-active-queue restriction
11. reorder
12. transactions/locking
13. arrival
14. skip/push-back

Exit:
Concurrent joins are safe.
Positions are correct.
Owner can reorder.
Queue remains consistent after mutations.

### PHASE 5 — PAYMENTS
Build:
- Razorpay order
- checkout
- webhook
- signature verification
- idempotency
- failed payment
- manual refund workflow
- extra service payment

Exit:
Verified payment flow works and duplicate webhooks are harmless.

### PHASE 6 — SERVICE LIFECYCLE + ETA
Build:
- service_sessions
- start
- complete
- actual duration
- cancellation
- customer cancellation request
- owner approval
- extra service flow
- rule-based ETA

Exit:
WAITING -> IN_SERVICE -> COMPLETED works and duration is recorded.

### PHASE 7 — REALTIME + NOTIFICATIONS
Build:
- SSE endpoint
- authenticated connections
- queue events
- position updates
- turn approaching
- service events
- persistent notifications
- read/unread
- email job

Exit:
Owner changes queue and connected customer UI updates without refresh.

### PHASE 8 — HISTORY + REVIEWS + EARNINGS
Build:
- customer history
- payment history
- owner history
- earnings
- cancellations/refunds
- reviews
- rating aggregates

Exit:
Completed service appears in history and can be reviewed.

### PHASE 9 — ADMIN + SECURITY HARDENING
Build:
- analytics
- user management
- shop management
- rate limiting
- authorization audit
- validation audit
- structured logging
- edge cases
- production-safe errors

Exit:
Major authorization and reliability checks pass.

### PHASE 10 — ML ETA + PRODUCTION
Build:
- Python ETA service
- historical dataset
- features
- model
- prediction endpoint
- fallback
- retraining
Then:
- Docker
- EC2
- Nginx
- HTTPS
- production S3
- DB backups
- production env
- monitoring

Exit:
ML is optional/fallback-safe and deployment is repeatable.

## 24. MVP
MVP = Phases 0-7.

MVP includes:
auth
shop onboarding/approval
discovery
service selection
payment
queue request
owner acceptance
active queue
positions
reorder
skip
service lifecycle
ETA
SSE realtime
basic notifications

## 25. TESTING STRATEGY
Unit tests:
- state transitions
- queue position logic
- validation
- authorization
- ETA
- idempotency

Integration tests:
- MySQL repositories
- request -> accept -> queue entry
- service lifecycle
- payment webhook
- reviews

Concurrency tests:
- simultaneous joins
- no duplicate positions
- no lost entries
- rollback correctness

SSE tests:
- connect
- mutate queue
- receive event
- reconnect
- REST resync

## 26. DEFINITION OF DONE
For every story:
[ ] backend implemented
[ ] validation implemented
[ ] authorization implemented
[ ] DB operation implemented
[ ] transaction/locking where needed
[ ] frontend integrated where applicable
[ ] errors handled
[ ] tests added
[ ] happy path manually tested
[ ] relevant edge cases tested
[ ] no secrets committed
[ ] safe logging
[ ] docs updated when API/behavior changes

## 27. OUT OF SCOPE V1
Do not add unless explicitly requested:
- native mobile app
- multi-barber scheduling
- automatic refunds
- mobile push notifications
- microservices
- Kubernetes
- advanced event streaming
- Google Maps/Mapbox
- mandatory customer GPS
- separate refunds table
- feedback tag system
- multiple shops per owner
- ML before enough historical data exists

## 28. IMPLEMENTATION RULE FOR ANTIGRAVITY
Start with PHASE 0 only.
Do not generate the complete application in one pass.
Inspect existing repository before changing files.
Preserve working code.
After each phase:
1. implement
2. test/build
3. fix failures
4. summarize changes
5. record API/schema changes
6. wait for approval before the next major phase.

The User Stories DOCX is the detailed product backlog.
This plan is the technical implementation blueprint.
Both should be used together.

## 29. FINAL END-TO-END FLOW
CUSTOMER:
Register -> OTP -> Login -> Discover -> Select shop/services -> Pay ->
Queue Request -> Owner Accepts -> Queue Entry -> Position/ETA -> Realtime ->
Arrive -> Start -> Optional Extra Service/Payment -> Complete -> History -> Review.

OWNER:
Register -> Create Shop -> Admin Approval -> Open -> Receive Requests ->
Accept/Reject -> Queue Management -> Arrive/Start/Complete/Skip/Cancel ->
Earnings/History.

ADMIN:
Login -> Shop Review -> Approve/Reject -> Manage Shops/Users -> Analytics.

END OF PLAN
