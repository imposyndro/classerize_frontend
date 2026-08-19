This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/[id].js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## AI Usage Tracker

Classerize includes a built-in **AI Usage Tracker** at [`/ai-usage`](http://localhost:3000/ai-usage)
(linked from the dashboard navbar). It tracks, visualizes, and helps optimize AI spend across
Claude, Gemini, and other models — with a KPI dashboard, cost/token trends, model comparison,
optimization insights, and CSV/JSON import.

Unlike the rest of the app (which talks to the external backend), this section is self-contained:
it uses **Prisma + SQLite** with its own API routes under `/api/ai-usage/*`.

First-time setup:

```bash
cp .env.example .env          # sets DATABASE_URL="file:./dev.db"
npx prisma migrate deploy     # create prisma/dev.db and apply migrations
npm run seed                  # pricing catalog + ~80 days of sample usage
```

Reseed / reset anytime with `npm run seed` or `npm run db:reset`. For production, point
`DATABASE_URL` at Postgres and change the datasource `provider` in `prisma/schema.prisma`.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
