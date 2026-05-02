# FlowSync

I got tired of issue trackers that take 10 seconds to load a ticket and look like an airplane cockpit. So I built FlowSync. 

It's a completely flat, monochromatic workspace that doesn't get in your way. No rounded-full buttons. No massive drop shadows. Just pure signal, zero noise.

Under the hood, it's relentlessly fast. I dropped the bloated ORMs and went straight for Prisma talking directly to a Postgres database. The entire API validates inputs through strict Zod schemas before they even touch the database, meaning zero junk data slips through.

## The Stack
- **Frontend**: React (Vite) + Tailwind CSS (Strictly minimal constraints)
- **Backend**: Node.js + Express
- **Database**: PostgreSQL
- **Data Layer**: Prisma ORM
- **Validation**: Zod
- **Auth**: JWT + bcryptjs

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register a new account (Email, Password, Role: Owner/Collaborator)
- `POST /api/auth/login` - Exchange credentials for a JWT

### Workspaces
- `POST /api/workspaces` - Spin up a new workspace (Requires Auth)
- `GET /api/workspaces` - Pull down all workspaces
- `GET /api/workspaces/:id` - Get a specific workspace and eagerly load its tickets
- `PUT /api/workspaces/:id` - Update workspace details
- `DELETE /api/workspaces/:id` - Destroy a workspace (Strictly limited to the actual Workspace Owner)

### Tickets
- `POST /api/tickets` - Create a ticket in a workspace
- `PATCH /api/tickets/:id` - Update ticket status (`Open`, `In-Progress`, `Resolved`, `Overdue`) or assign it

## Running Locally

1. Clone the repo.
2. Spin up a Postgres instance and drop your `DATABASE_URL` in an `.env` file at the root.
3. Add a random `JWT_SECRET` string to the `.env`.
4. Run `npx prisma db push` to sync the schema.
5. In the root directory, run `npm install` and `npm run dev`.
6. Open a new terminal, cd into `frontend/`, run `npm install` and `npm run dev`.

## Deployment (Railway)

I packed this entire setup into a highly optimized, multi-stage Dockerfile. 

When you deploy this to Railway (or any Docker host), it compiles the Vite React app in an Alpine container, then shifts the static assets over to the Node.js backend. Node serves the API on `/api` and hands off everything else to the React router. 

To deploy:
1. Connect your GitHub repo to Railway.
2. Attach a PostgreSQL database from the Railway dashboard.
3. Add your `DATABASE_URL` and `JWT_SECRET` variables.
4. Deploy. The Dockerfile handles the rest natively.
