# Dokument wymagań produktu (PRD) - 10x-cards

## 1. Przegląd produktu

Aplikacja webowa do generowania i zarządzania fiszkami edukacyjnymi z wykorzystaniem AI. Główne funkcje:

- Automatyczne tworzenie fiszek Q&A z tekstu źródłowego via OpenRouter.ai
- Manualna edycja i organizacja fiszek
- System powtórek spaced repetition z algorytmem SM-2
- Konta użytkowników z historią postępów

## 2. Problem użytkownika

Manualne przygotowanie wysokiej jakości fiszek:

- Średni czas tworzenia 1 fiszki ręcznie: 3-5 minut
- 68% studentów rezygnuje z metody spaced repetition z powodu nakładu czasowego
- Brak narzędzi łączących AI z algorytmami powtórek w jednej platformie

## 3. Wymagania funkcjonalne

### 3.1 Generowanie fiszek przez AI

- Obsługa tekstu do 50k znaków (Uzytkownik wkleja dowolny tekst)
- Aplikacja wysyła tekst do OpenRouter.ai i generuje fiszki
- Możliwość podania własnego klucza API OpenRouter
- Model LLM proponuje zestaw fiszek (pytania i odpowiedzi)

### 3.2 Zarządzanie fiszkami

- Mozliwosc storzenia recznie zestawu fiszek
- Edycja metadanych (kategorie, tagi)
- Archiwizacja bez utraty danych historycznych

### 3.3 System powtórek

- Implementacja algorytmu SM-2 z biblioteką opensource
- Automatyczne planowanie sesji powtórkowych
- Wskaźnik postępu nauki w dashboardzie
- Mechanizm pomijania fiszek na 24h

### 3.4 Konta użytkowników

- Rejestracja przez email + hasło
- Automatyczne wylogowanie po 7 dniach nieaktywności
- Reset hasła via email
- Usuwanie konta z potwierdzeniem

### 3.5 Bezpieczeństwo

- Hashowanie haseł bcrypt z salt 12
- Rate limiting 5 żądań/minutę
- Sesje JWT z ważnością 7 dni
- Sanityzacja wszystkich inputów użytkownika

### 3.6 Interfejs recenzji

- Filtrowanie fiszek po statusie (nowe/do poprawki)
- Wyszukiwanie po frazach w pytaniach
- Podświetlanie dopasowań w długich tekstach

## 4. Granice produktu

### Nie obejmuje MVP:

- Import plików PDF/DOCX
- Współdzielenie zestawów między użytkownikami
- Integracje z zewnętrznymi platformami (np. Moodle)
- Niestandardowe algorytmy spaced repetition
- Aplikacje mobilne
- Generowanie fiszek z materiałów audio/wideo

### Ograniczenia techniczne:

- Maks. 3 równoległe generacje AI na użytkownika
- Czas przetwarzania AI: do 10 minut na 50k znaków
- Maks. 10k aktywnych fiszek na konto

## 5. Historyjki użytkowników

### US-001: Generowanie fiszek z tekstu

**Opis**: Jako uczący się chcę wkleić tekst, aby otrzymać fiszki w ciągu 10 minut  
**Kryteria akceptacji**:

1. System wyświetla postęp generacji w czasie rzeczywistym
2. Powiadomienie email przy generacji >5 minut
3. Limit 50k znaków z podglądem liczby znaków

### US-002: Recenzja fiszek

**Opis**: Jako użytkownik chcę szybko poprawiać fiszki AI  
**Kryteria akceptacji**:

1. Batch selection 10+ fiszek jednocześnie
2. Odrzucenie z opcją "Zablokuj podobne"
3. Autozapis zmian co 30 sekund

### US-003: Planowanie powtórek

**Opis**: Jako student potrzebuję powtarzać materiały w optymalnych odstępach  
**Kryteria akceptacji**:

1. Algorytm SM-2 z możliwością ręcznej korekty interwałów
2. Widok kalendarza z zaplanowanymi sesjami
3. Eksport harmonogramu do iCalendar

### US-004: Zarządzanie kontem

**Opis**: Jako użytkownik chcę bezpiecznie zarządzać danymi konta  
**Kryteria akceptacji**:

1. Wymagania hasła: 12 znaków, 1 cyfra, 1 znak specjalny
2. 2FA dostępny opcjonalnie
3. Pełne usunięcie danych w 48h

### US-005: Archiwizacja fiszek

**Opis**: Jako użytkownik chcę ukryć nieaktualne fiszki bez utraty historii  
**Kryteria akceptacji**:

1. Filtrowanie "pokazuj tylko aktywne"
2. Automatyczna archiwizacja po 90 dniach nieużycia
3. Statystyki skuteczności dla fiszek archiwalnych

### US-006: Obsługa błędów AI

**Opis**: Jako użytkownik chcę rozumieć przyczyny nieudanych generacji  
**Kryteria akceptacji**:

1. Komunikaty błędów z kodem referencyjnym
2. Sugestie poprawy formatu tekstu źródłowego
3. Historia ostatnich 10 prób generacji

## 6. Metryki sukcesu

| Wskaźnik             | Cel  | Sposób pomiaru                          |
| -------------------- | ---- | --------------------------------------- |
| Akceptacja fiszek AI | ≥75% | Stosunek zaakceptowanych/wygenerowanych |
| Wykorzystanie AI     | ≥75% | % fiszek stworzonych via AI             |
