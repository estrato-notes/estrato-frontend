# Estrato Frontend

Frontend application for Estrato, built with Next.js 16, React 19, and Tailwind CSS.

## Tech Stack

* **Framework:** Next.js 16 (App Router)
* **Library:** React 19
* **Language:** TypeScript
* **Styling:** Tailwind CSS 4
* **UI Components:** Shadcn/ui (Radix UI)
* **Icons:** Lucide React
* **HTTP Client:** Axios

## Configuration

1.  Clone the repository.
2.  Create a `.env.local` file in the root directory.
3.  Define the API URL variable:
    ```bash
    NEXT_PUBLIC_API_URL=http://localhost:8000
    ```

## Running the Application

This project uses **pnpm**. Ensure you have it installed.

### Installation

```bash
pnpm install
```

### Development Server
To start the application in development mode:

```bash
pnpm dev
```

- The application will be available at: `http://localhost:3000`

## Production Build
To build and start the application for production:

```bash
pnpm build
pnpm start
```