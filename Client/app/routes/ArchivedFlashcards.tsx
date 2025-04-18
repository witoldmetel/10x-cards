import React, { useState, useEffect } from "react";
import { FlashcardList } from "../components/FlashcardList";
import { Navbar } from "../components/Navbar";
import { useAuth } from "../contexts/AuthContext";

export default function ArchivedFlashcards() {
  const { session } = useAuth();
  const [archivedCards, setArchivedCards] = useState<any[]>([]);

  useEffect(() => {
    // In a real app, we would fetch archived cards from the API
    // For now, we'll use an empty array to prevent errors
    setArchivedCards([]);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Archived Flashcards
          </h1>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <FlashcardList flashcards={archivedCards} />
          </div>
        </div>
      </main>
    </div>
  );
}
