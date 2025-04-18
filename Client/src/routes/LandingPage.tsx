import { Brain, CheckCircle } from "lucide-react";

import { Link } from "react-router";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Brain className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">
                FlashCard Pro
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-900 hover:text-blue-600 px-3 py-2">
                Login
              </Link>
              <Link
                to="/register"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-8">
            Master Any Subject with
            <span className="text-blue-600 block mt-2">Smart Flashcards</span>
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Transform any text into effective study materials. Our AI-powered
            system creates intelligent flashcards to help you learn faster and
            remember longer.
          </p>
          <Link
            to="/register"
            className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center">
            Get Started Free
            <CheckCircle className="ml-2 h-5 w-5" />
          </Link>
        </div>

        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-sm">
            <h3 className="text-xl font-semibold mb-4">
              AI-Powered Generation
            </h3>
            <p className="text-gray-600">
              Our advanced AI creates high-quality flashcards from any text in
              seconds.
            </p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-sm">
            <h3 className="text-xl font-semibold mb-4">Easy Organization</h3>
            <p className="text-gray-600">
              Keep your flashcards organized and access them anywhere, anytime.
            </p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-sm">
            <h3 className="text-xl font-semibold mb-4">Effective Learning</h3>
            <p className="text-gray-600">
              Learn smarter with our carefully crafted question-answer pairs.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
