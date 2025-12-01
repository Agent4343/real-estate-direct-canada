# Real Estate Direct Platform - Frontend

Modern React/Next.js frontend for the Real Estate Direct Platform.

## 🚀 Getting Started

### Installation

```bash
cd frontend
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
frontend/
├── app/                 # Next.js 14 App Router
│   ├── (auth)/         # Authentication pages
│   ├── (dashboard)/    # Dashboard pages
│   ├── properties/     # Property pages
│   └── layout.tsx      # Root layout
├── components/         # React components
│   ├── ui/            # UI components
│   ├── property/      # Property components
│   └── layout/        # Layout components
├── lib/               # Utilities and API client
├── hooks/             # Custom React hooks
├── types/             # TypeScript types
└── public/            # Static assets
```

## 🎨 Features

- ✅ Modern, responsive design
- ✅ Property search and filtering
- ✅ User authentication
- ✅ Property listings
- ✅ Transaction management
- ✅ Mortgage calculator
- ✅ Lawyer directory
- ✅ Admin dashboard

## 🔗 API Integration

The frontend connects to the backend API at:
- Development: `http://localhost:3000`
- Configure in `.env.local`

## 🛠️ Tech Stack

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Query** - Data fetching
- **Axios** - HTTP client
- **React Hook Form** - Form handling

