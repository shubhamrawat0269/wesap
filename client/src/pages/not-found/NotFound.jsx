import React from 'react'
import { Home, ArrowLeft, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-green-100 px-6">
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 h-72 w-72 rounded-full bg-red-500/20 blur-2xl" />
        <div className="absolute bottom-20 right-20 h-72 w-72 rounded-full bg-red-500/20 blur-2xl" />
        <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500/10 blur-2xl" />
      </div>

      <div className="relative z-10 max-w-2xl text-center">
        <h1 className="bg-linear-to-r from-red-400 via-red-500 to-red-700 bg-clip-text text-6xl font-extrabold text-transparent md:text-[150px] animate-pulse">
          404
        </h1>

        <div className="mt-4 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl shadow-2xl">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
            <Search className="h-8 w-8 text-stone-700" />
          </div>

          <h2 className="mb-3 text-3xl font-bold text-stone-600">
            Page Not Found
          </h2>

          <p className="mb-8 text-stone-500">
            Sorry, the page you're looking for doesn't exist, has been
            moved, or is temporarily unavailable. Please check the URL
            or navigate back to continue browsing.
          </p>

          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <button
              onClick={() => window.history.back()}
              className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-6 py-3 font-medium text-white transition-all duration-300 hover:border-cyan-500 hover:bg-slate-800"
            >
              <ArrowLeft size={18} />
              Go Back
            </button>

            <button
              onClick={() => (window.location.href = '/')}
              className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-xl bg-stone-900 px-6 py-3 font-medium text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-cyan-500/30"
            >
              <Home size={18} />
              Back to Home
            </button>
          </div>
        </div>

        <p className="mt-6 text-sm text-slate-500">
          Error Code: 404 • Resource Not Found
        </p>
      </div>
    </div>
  )
}
