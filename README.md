# Sign Language Tutor

Interactive browser-based app for learning sign language through real-time hand gesture recognition. Train and practice various sign language systems (ASL, SIBI, BISINDO, etc.) using your webcam.

## Features

- 🤖 **Real-time Hand Detection** - Uses TensorFlow.js and MediaPipe for accurate hand landmark tracking
- 📚 **Training Mode** - Collect custom training samples for any sign language system
- 🎯 **Practice Mode** - Get instant feedback on your signing accuracy
- 💾 **Local Storage** - All training data stored in browser (privacy-first)
- 📤 **Import/Export** - Share trained models across devices
- ⚡ **Client-side ML** - No backend required, works completely offline
- 🎨 **Visual Feedback** - Real-time confidence scores and hand skeleton overlay

## Tech Stack

- **Framework:** React 19 + React Router v7
- **ML Engine:** TensorFlow.js + MediaPipe Hands
- **Classifier:** KNN Classifier (customizable)
- **Styling:** Tailwind CSS + shadcn/ui
- **State:** Zustand
- **Animations:** Framer Motion

## Getting Started

### Prerequisites

- Node.js 18+
- Webcam access

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

App runs at `http://localhost:5173`

### Build

```bash
npm run build
```

## How to Use

### Training Mode

1. Select a letter from the grid
2. Position your hand to form the sign
3. Click "Capture Sample" repeatedly (10+ samples recommended per letter)
4. Repeat for all letters you want to train
5. Export your trained model for backup

### Practice Mode

1. Switch to Practice Mode (requires trained samples)
2. Select a target letter
3. Form the sign with your hand
4. Get real-time feedback on accuracy and confidence

### Import/Export Models

- **Export:** Save your trained classifier as JSON
- **Import:** Load previously saved models
- Share models with others learning the same sign language system

## Supported Sign Languages

Train any sign language system:

- ASL (American Sign Language)
- SIBI (Indonesian Sign Language System)
- BISINDO (Indonesian Sign Language)
- BSL (British Sign Language)
- Any other gesture-based alphabet system

## Performance

- Min 20 FPS on standard laptops
- Works on modern mobile browsers
- < 3s model initialization
- No internet required after initial load

## Project Structure

```
app/
├── features/tutor/
│   ├── components/     # UI components
│   ├── hooks/          # ML hooks (detector, classifier)
│   ├── store.ts        # Zustand state
│   └── utils/          # Storage, geometry helpers
├── routes/             # Pages
└── components/ui/      # shadcn components
```

## Documentation

- [Technical Requirements Doc](./docs/TRD.md)
- [Product Requirements Doc](./docs/PRD.md)

## License

MIT

---

Built with React Router + TensorFlow.js
