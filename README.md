1. Project Architecture
The application follows a standard MVC (Model-View-Controller) pattern. Node.js and Express handle the logic, MongoDB stores the data, and Bootstrap provides a responsive interface for the frontend.

Core Data Models
User: Stores credentials (email, password), role (Admin vs. Voter), and a flag for whether they have already voted.

Candidate: Stores the name, party affiliation, and current vote count.

2. Tech Stack & Dependencies
You will need to initialize your project and install the following core packages:

Backend: express, mongoose (for MongoDB), dotenv (for environment variables).

Security: bcryptjs (to hash passwords) and jsonwebtoken (JWT) for secure login sessions.

Frontend: Bootstrap 5 (via CDN or npm) and a templating engine like ejs to render dynamic data from the server.

Development Workflow
Phase 1: Authentication & Authorization
Safety is the priority in a voting app. You need to ensure:

Unique Identity: Users should register with a unique ID (like a National ID or Email).

One Vote Per Person: In the User schema, use a boolean field like isVoted: { type: Boolean, default: false }. Once a user submits a vote, this flips to true, and the middleware should block further attempts.

Phase 2: Candidate Management (Admin Only)

Create a protected route where only an "Admin" role can:

Add new candidates.

Manage Candidates.

Phase 3: The Voting Logic

When a user clicks "Vote":

Verify the user hasn't voted yet.

Find the Candidate by ID and increment their voteCount by 1.

Update the User’s isVoted status to true.

Transaction Tip: Wrap these steps in a MongoDB session/transaction to ensure that if one step fails, the whole process rolls back, preventing "ghost" votes.

4. UI Design with Bootstrap
Since you are using Bootstrap, focus on making the dashboard "glanceable."

Voting Page: Use Bootstrap Cards to display candidates. Each card should feature the candidate's name, party, and a prominent "Vote" button.

Live Results: Use Bootstrap Progress Bars to show the percentage of votes each candidate has received in real-time.
