import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Brain, Sparkles, AlertCircle } from 'lucide-react';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/text-area';
import { Input } from '@/components/ui/input';

export default function AIGenerate() {
  const navigate = useNavigate();
  // const { collections, fetchCollections, createFlashcardsBatch } = useFlashcardStore();
  
  const [sourceText, setSourceText] = useState('');
  const [collectionName, setCollectionName] = useState('');
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const [numberOfCards, setNumberOfCards] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedCards, setGeneratedCards] = useState<{ question: string; answer: string }[]>([]);
  const [targetCollectionId, setTargetCollectionId] = useState<string | null>(null);
  
  // React.useEffect(() => {
  //   fetchCollections();
  // }, [fetchCollections]);
  
  const handleBack = () => {
    navigate(-1);
  };
  
  const handleGenerate = async () => {
    // Validation
    if (!sourceText.trim()) {
      setError('Please enter some text to generate flashcards from');
      return;
    }
    
    if (!selectedCollectionId && !collectionName.trim()) {
      setError('Please select an existing collection or enter a name for a new one');
      return;
    }
    
    setError(null);
    setIsGenerating(true);
    
    try {
      const result = await generateFlashcards({
        sourceText,
        numberOfCards,
        collectionId: selectedCollectionId || undefined,
        collectionName: selectedCollectionId ? undefined : collectionName,
      });
      
      setGeneratedCards(result.flashcards);
      setTargetCollectionId(result.collectionId);
      setIsGenerating(false);
    } catch (err) {
      setError('An error occurred while generating flashcards. Please try again.');
      setIsGenerating(false);
    }
  };
  
  const handleSelectCollection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedCollectionId(value === "new" ? null : value);
  };
  
  const handleSaveCards = async () => {
    if (!targetCollectionId || generatedCards.length === 0) {
      setError('No flashcards to save');
      return;
    }
    
    try {
      await createFlashcardsBatch(targetCollectionId, generatedCards);
      navigate(`/collections/${targetCollectionId}`);
    } catch (err) {
      setError('Failed to save flashcards');
    }
  };
  
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" onClick={handleBack} className="h-9 w-9 p-0">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold">Generate with AI</h1>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-lg text-error-700 flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}
      
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          {!generatedCards.length ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="h-5 w-5 mr-2 text-primary-600" />
                  Text to Flashcards
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <Textarea
                    label="Enter your text"
                    placeholder="Paste paragraphs, notes, or any text you want to convert into flashcards..."
                    value={sourceText}
                    onChange={(e) => setSourceText(e.target.value)}
                    className="min-h-[200px]"
                  />
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="collection-select" className="block text-sm font-medium text-neutral-700 mb-1">
                        Select Collection
                      </label>
                      <select
                        id="collection-select"
                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-300 focus:border-primary-500 focus:outline-none transition-all duration-200"
                        value={selectedCollectionId || "new"}
                        onChange={handleSelectCollection}
                      >
                        <option value="new">Create New Collection</option>
                        {collections.map(collection => (
                          <option key={collection.id} value={collection.id}>
                            {collection.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {!selectedCollectionId && (
                      <Input
                        label="New Collection Name"
                        placeholder="e.g., History Notes"
                        value={collectionName}
                        onChange={(e) => setCollectionName(e.target.value)}
                      />
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="card-count" className="block text-sm font-medium text-neutral-700 mb-1">
                      Number of Cards to Generate
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        id="card-count"
                        min="3"
                        max="20"
                        value={numberOfCards}
                        onChange={(e) => setNumberOfCards(parseInt(e.target.value))}
                        className="flex-1"
                      />
                      <span className="font-medium text-lg w-8 text-center">{numberOfCards}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant="primary"
                  className="w-full"
                  leftIcon={<Sparkles className="h-4 w-4" />}
                  onClick={handleGenerate}
                  isLoading={isGenerating}
                >
                  {isGenerating ? 'Generating...' : 'Generate Flashcards'}
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <div>
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Generated Flashcards</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">
                    We've generated {generatedCards.length} flashcards based on your text. You can edit them before saving.
                  </p>
                </CardContent>
              </Card>
              
              <div className="space-y-4">
                {generatedCards.map((card, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card>
                      <CardContent className="pt-5">
                        <div className="space-y-4">
                          <div>
                            <h3 className="font-medium mb-2">Question</h3>
                            <Textarea
                              value={card.question}
                              onChange={(e) => {
                                const updatedCards = [...generatedCards];
                                updatedCards[index] = {
                                  ...updatedCards[index],
                                  question: e.target.value
                                };
                                setGeneratedCards(updatedCards);
                              }}
                            />
                          </div>
                          
                          <div>
                            <h3 className="font-medium mb-2">Answer</h3>
                            <Textarea
                              value={card.answer}
                              onChange={(e) => {
                                const updatedCards = [...generatedCards];
                                updatedCards[index] = {
                                  ...updatedCards[index],
                                  answer: e.target.value
                                };
                                setGeneratedCards(updatedCards);
                              }}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
              
              <div className="mt-6 flex justify-end gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setGeneratedCards([]);
                    setTargetCollectionId(null);
                  }}
                >
                  Go Back
                </Button>
                <Button variant="primary" onClick={handleSaveCards}>
                  Save All Flashcards
                </Button>
              </div>
            </div>
          )}
        </div>
        
        <div className="md:col-span-1">
          <div className="sticky top-20">
            <Card>
              <CardHeader>
                <CardTitle>How It Works</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-4 list-decimal list-inside text-neutral-700">
                  <li>
                    <span className="font-medium text-neutral-900">Input your text</span>
                    <p className="mt-1 pl-5 text-sm">
                      Paste any content you want to learn - lecture notes, articles, book chapters, or study materials.
                    </p>
                  </li>
                  <li>
                    <span className="font-medium text-neutral-900">AI generates flashcards</span>
                    <p className="mt-1 pl-5 text-sm">
                      Our AI analyzes your text and creates question-answer pairs focused on key concepts.
                    </p>
                  </li>
                  <li>
                    <span className="font-medium text-neutral-900">Review and edit</span>
                    <p className="mt-1 pl-5 text-sm">
                      Tweak the generated flashcards to better suit your learning style.
                    </p>
                  </li>
                  <li>
                    <span className="font-medium text-neutral-900">Save and study</span>
                    <p className="mt-1 pl-5 text-sm">
                      Add the flashcards to your collection and start studying with our spaced repetition system.
                    </p>
                  </li>
                </ol>
                
                <div className="mt-6 p-3 bg-primary-50 border border-primary-200 rounded-lg">
                  <p className="text-sm text-primary-800">
                    <span className="font-medium">Pro tip:</span> For best results, use clear, structured text with well-defined concepts.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}