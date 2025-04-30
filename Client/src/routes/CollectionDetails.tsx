import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Plus, Edit, Trash2, ArrowLeft, BookOpen, X, Check } from 'lucide-react';

import { useCollection } from '../api/collections/queries';
import { useDeleteCollection } from '../api/collections/mutations';
import { useFlashcards } from '@/api/flashcard/queries';
import { useDeleteFlashcard, useUpdateFlashcard } from '@/api/flashcard/mutations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/text-area';
import { Flashcard as FlashcardType } from '@/api/flashcard/types';
import { Flashcard } from '@/components/Flashcard';

export default function CollectionDetails() {
  const { collectionId } = useParams<{ collectionId: string }>();
  const navigate = useNavigate();

  // Fetch collection details
  const { data: collection, isLoading: isCollectionLoading, isError: isCollectionError } = useCollection(collectionId || '');
  // Fetch flashcards
  const { data: flashcardsResp, isLoading: isFlashcardsLoading, isError: isFlashcardsError } = useFlashcards(collectionId || '');
  // Delete collection mutation
  const deleteCollectionMutation = useDeleteCollection();
  // Delete flashcard mutation
  const deleteFlashcardMutation = useDeleteFlashcard();
  // Update flashcard mutation
  const updateFlashcardMutation = useUpdateFlashcard();

  const [previewCard, setPreviewCard] = useState<FlashcardType | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ front: '', back: '' });

  const handleBack = () => navigate('/dashboard');
  const handleStudy = () => collectionId && navigate(`/study/${collectionId}`);
  const handleAddFlashcard = () => collectionId && navigate('/create', { state: { collectionId } });
  const handleDeleteCollection = async () => {
    if (!collectionId) return;
    await deleteCollectionMutation.mutateAsync(collectionId);
    navigate('/dashboard');
  };

  const handleDeleteFlashcard = async (flashcardId: string) => {
    if (previewCard?.id === flashcardId) {
      setPreviewCard(null);
    }
    await deleteFlashcardMutation.mutateAsync(flashcardId);
  };

  const handlePreviewCard = (card: FlashcardType) => {
    if (editingCard !== card.id) {
      setPreviewCard(card);
    }
  };

  const handleEditCard = (card: FlashcardType) => {
    setEditingCard(card.id);
    setEditForm({ front: card.front, back: card.back });
    setPreviewCard(null);
  };

  const handleSaveEdit = async (cardId: string) => {
    if (editForm.front.trim() && editForm.back.trim()) {
      await updateFlashcardMutation.mutateAsync({ id: cardId, front: editForm.front, back: editForm.back });
      setEditingCard(null);
      setEditForm({ front: '', back: '' });
    }
  };

  if (isCollectionLoading || isFlashcardsLoading) return <div>Loading...</div>;
  if (isCollectionError || isFlashcardsError || !collection || !flashcardsResp) return <div>Collection not found.</div>;

  const flashcards = flashcardsResp.items;

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center mb-6">
        <Button onClick={handleBack} variant="ghost" className="mr-2"><ArrowLeft size={20} /></Button>
        <h1 className="text-2xl font-bold">{collection.name}</h1>
        <Button onClick={() => setIsDeleteModalOpen(true)} variant="outline" className="ml-auto"><Trash2 size={18} className="mr-1" /> Delete</Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{collection.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-2">{collection.description}</p>
          <div className="flex gap-4 mb-2">
            <span className="text-sm text-gray-600">Total cards: {collection.totalCards}</span>
            <span className="text-sm text-gray-600">Due cards: {collection.dueCards}</span>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleStudy} variant="primary"><BookOpen className="mr-2" size={18} /> Study</Button>
          <Button onClick={handleAddFlashcard} variant="secondary" className="ml-2"><Plus className="mr-2" size={18} /> Add Flashcard</Button>
        </CardFooter>
      </Card>
      <div className="grid md:grid-cols-3 gap-8 mt-8">
        <div className="md:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Flashcards</h2>
          </div>
          {flashcards.length === 0 ? (
                        <Card>
                        <CardContent className="py-12 text-center">
                          <BookOpen className="h-12 w-12 mx-auto text-neutral-300 mb-4" />
                          <h3 className="text-xl font-semibold mb-2">No flashcards yet</h3>
                          <p className="text-neutral-600 mb-4">
                            Start adding flashcards to build your collection
                          </p>
                          <Button variant="primary" onClick={handleAddFlashcard}>
                            Add First Flashcard
                          </Button>
                        </CardContent>
                      </Card>
          ) : (
            <div className="space-y-4">
              {flashcards.map(card => (
                <Card key={card.id}>
                  <CardContent className="py-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-semibold">{card.front}</div>
                        <div className="text-neutral-500 text-sm mt-1">{card.back}</div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" onClick={() => handlePreviewCard(card)}><BookOpen size={16} /></Button>
                        <Button variant="ghost" onClick={() => handleEditCard(card)}><Edit size={16} /></Button>
                        <Button variant="ghost" onClick={() => handleDeleteFlashcard(card.id)}><Trash2 size={16} /></Button>
                      </div>
                    </div>
                  </CardContent>
                  {editingCard === card.id && (
                    <CardFooter>
                      <form className="flex flex-col gap-2 w-full" onSubmit={e => { e.preventDefault(); handleSaveEdit(card.id); }}>
                        <Textarea
                          value={editForm.front}
                          onChange={e => setEditForm(f => ({ ...f, front: e.target.value }))}
                          placeholder="Front (question)"
                          rows={2}
                        />
                        <Textarea
                          value={editForm.back}
                          onChange={e => setEditForm(f => ({ ...f, back: e.target.value }))}
                          placeholder="Back (answer)"
                          rows={2}
                        />
                        <div className="flex gap-2 justify-end">
                          <Button type="button" variant="outline" onClick={() => setEditingCard(null)}><X size={16} /></Button>
                          <Button type="submit" variant="primary"><Check size={16} /></Button>
                        </div>
                      </form>
                    </CardFooter>
                  )}
                </Card>
              ))}
            </div>
          )}
          {previewCard && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-3">Preview</h2>
              <Flashcard front={previewCard.front} back={previewCard.back} />
            </div>
          )}
        </div>
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Collection Info</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-neutral-500">Description</p>
                  <p>{collection.description}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Total Cards</p>
                  <p>{collection.totalCards}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Cards Due for Review</p>
                  <p>{collection.dueCards}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Created</p>
                  <p>{new Date(collection.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="primary"
                className="w-full"
                disabled={collection.dueCards === 0}
                onClick={handleStudy}
              >
                Study Now
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-neutral-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Delete Collection</h3>
            <p className="mb-6">
              Are you sure you want to delete "{collection.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="outline" onClick={handleDeleteCollection}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}