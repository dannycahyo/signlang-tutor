# Technical Requirements Document (TRD): Sign Language Tutor

## 1. System Overview

**Sign Language Tutor** is a Single Page Application (SPA) that performs heavy client-side computation. The core logic involves capturing a video stream, running a computer vision model to extract hand landmarks, and passing those landmarks to a secondary classifier to identify sign language gestures (e.g., ASL, SIBI, BISINDO alphabets).

## 2. Technology Stack & Dependencies

### 2.1 Core Framework

- **Runtime:** Node.js (v18+ recommended for development).
- **Build Tool:** Vite (for fast HMR and optimized bundling).
- **Framework:** React 18+.
- **Routing:** **React Router v7** (using the new Data Router APIs for seamless loading states).

### 2.2 Machine Learning & Vision

- **Core Engine:** `@tensorflow/tfjs` (WebGL backend for acceleration).
- **Hand Detection:** `@tensorflow-models/hand-pose-detection` (specifically the MediaPipe runtime for high fidelity).
- **Landmark Backend:** `@mediapipe/hands` (peer dependency for the detector).
- **Custom Classifier:** A lightweight JSON-based model (created via `tfjs-layers` or a KNN classifier) to map 21 landmarks to A-Z labels.

### 2.3 UI & Styling

- **Styling Engine:** Tailwind CSS.
- **Component Library:** **shadcn/ui** (headless, accessible components).
- **Icons:** `lucide-react` (standard with shadcn).
- **Utilities:** `clsx`, `tailwind-merge` (for dynamic class merging).

### 2.4 Essential Utilities (The "Etc")

- **Camera Handling:** `react-webcam` (simplifies `getUserMedia` access).
- **State Management:** `zustand` (lightweight, perfect for tracking high-frequency updates like "current letter confidence" without excessive re-renders).
- **Math Utilities:** `mathjs` (optional, or native JS) for calculating vector angles between finger joints.
- **Animations:** `framer-motion` (for smooth UI transitions and success feedback).
- **Notifications:** `sonner` (for toast notifications on success/error).

---

## 3. System Architecture

### 3.1 High-Level Data Flow

1. **Video Capture:** `react-webcam` renders a video element at 640x480 resolution.
2. **Inference Loop:** A `requestAnimationFrame` loop captures the current DOM video frame.
3. **Landmark Extraction:** `handPoseDetection.estimateHands(video)` returns an array of 21 3D keypoints.
4. **Normalization:** Keypoints are shifted relative to the wrist (0,0,0) to make the model position-invariant.
5. **Classification:** Normalized data is passed to the custom Classifier Model.
6. **State Update:** If `Confidence > Threshold`, update the `GameState` (Zustand store).
7. **UI Render:** React components react to state changes (e.g., turn the border green, show confetti).

### 3.2 Diagram: Inference Pipeline

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          USER'S HAND                                     │
│                               👋                                         │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   react-webcam       │
                    │   <video> Element    │
                    │   640x480 @ 30fps    │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │  requestAnimationFrame│
                    │  Inference Loop       │
                    │  (60 FPS)            │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────────────┐
                    │ @tensorflow-models/          │
                    │ hand-pose-detection          │
                    │ MediaPipe Hands              │
                    │                              │
                    │ estimateHands(video)         │
                    └──────────┬───────────────────┘
                               │
                               │ Raw Keypoints
                               │ [{x,y,z} × 21]
                               ▼
                    ┌──────────────────────────────┐
                    │  NORMALIZATION LAYER         │
                    │                              │
                    │  1. Shift to Wrist Origin    │
                    │     P_new = P - P_wrist      │
                    │                              │
                    │  2. Scale Invariance         │
                    │     Normalize hand size      │
                    └──────────┬───────────────────┘
                               │
                               │ Normalized Data
                               │ [42-63 floats]
                               ▼
                    ┌──────────────────────────────┐
                    │  CUSTOM CLASSIFIER MODEL     │
                    │  (TensorFlow.js)             │
                    │                              │
                    │  Input: 42-63 floats         │
                    │  Output: 26 classes (A-Z)    │
                    │  + Confidence Score          │
                    └──────────┬───────────────────┘
                               │
                               │ Prediction Result
                               │ {letter: 'A', confidence: 0.95}
                               ▼
                    ┌──────────────────────────────┐
                    │  CONFIDENCE THRESHOLD CHECK  │
                    │  if (confidence > 0.85) {    │
                    │    proceed...                │
                    │  }                           │
                    └──────────┬───────────────────┘
                               │
                               ▼
                    ┌──────────────────────────────┐
                    │  ZUSTAND GAME STATE          │
                    │  (State Management)          │
                    │                              │
                    │  - currentLetter             │
                    │  - isCorrect                 │
                    │  - confidence                │
                    └──────────┬───────────────────┘
                               │
                               │ State Change Event
                               ▼
         ┌─────────────────────┴─────────────────────┐
         │                                           │
         ▼                                           ▼
┌──────────────────┐                    ┌──────────────────────┐
│  UI COMPONENTS   │                    │  CANVAS OVERLAY      │
│                  │                    │                      │
│  - FeedbackCard  │                    │  - HandOverlay       │
│    "Correct! ✓"  │                    │  - Draw Skeleton     │
│                  │                    │  - Visual Guides     │
│  - Confetti 🎉   │                    │  - Keypoint Markers  │
│                  │                    │                      │
│  - Border Green  │                    │                      │
└──────────────────┘                    └──────────────────────┘
         │                                           │
         └─────────────────────┬─────────────────────┘
                               │
                               ▼
                        ┌──────────────┐
                        │   BROWSER    │
                        │   DISPLAY    │
                        └──────────────┘

Performance Notes:
━━━━━━━━━━━━━━━━
• Landmark data stored in useRef (not useState) to avoid 60 re-renders/sec
• tf.tidy() wraps inference to prevent GPU memory leaks
• Frame skipping option: run inference every 2-3 frames on slower devices
• WebGL backend for GPU acceleration
```

---

## 4. Component Architecture

### 4.1 Directory Structure (feature-based)

```bash
src/
├── features/
│   ├── tutor/
│   │   ├── components/
│   │   │   ├── SmartMirror.tsx    # Wraps Webcam + Canvas
│   │   │   ├── HandOverlay.tsx    # Draws skeleton/guides using Canvas API
│   │   │   └── FeedbackCard.tsx   # Shows "Correct!" or "Straighten finger"
│   │   ├── hooks/
│   │   │   ├── useHandDetector.ts # Initializes TF.js model
│   │   │   └── useClassifier.ts   # Runs the A-Z classification logic
│   │   └── utils/
│   │       ├── drawUtils.ts       # Canvas drawing helpers
│   │       └── geometry.ts        # Angle calculations
│   ├── dashboard/                 # Progress tracking
│   └── dictionary/                # Static sign language reference
├── lib/
│   ├── tensorflow.ts              # Singleton TF backend initialization
│   └── utils.ts                   # cn() helper

```

### 4.2 Key Component Specifications

**`SmartMirror.tsx`**

- **Props:** `targetLetter` (string), `onSuccess` (callback).
- **Logic:**
- Initialize `useHandDetector`.
- Maintain a generic HTML5 `<canvas>` layered absolutely over the `<Webcam>`.
- Run the prediction loop.
- **Performance Note:** **Do not** store landmark data in React State (useState) for every frame. This will cause 60 re-renders per second. Use a Ref (`useRef`) for drawing and only trigger State updates when a significant game event occurs (e.g., letter recognized).

**`useHandDetector.ts` (Hook)**

- **Responsibilities:**
- Load the `hand-pose-detection` model once (singleton pattern).
- Ensure `tf.ready()` is awaited.
- Handle backend selection ('webgl').

---

## 5. ML Implementation Strategy

### 5.1 The Classifier (The "Brain")

Since HandPose only gives points, we need a second step to say "These points look like the letter A."

- **Approach:** Train a simple Feed Forward Neural Network (Input: 42 or 63 floats representing x,y,z of 21 points; Output: 26 classes).
- **Model Format:** `model.json` (TensorFlow.js graph model) loaded into the public directory.
- **Preprocessing:**
- **Relative Coordinates:** Convert all points to be relative to the Wrist (Index 0). P*{new} = P*{old} - P\_{wrist}.
- **Scale Invariance:** Normalize the hand size so the distance between Wrist and Middle Finger MCP is constant (e.g., 1.0). This ensures a hand close to the camera works the same as one far away.

### 5.2 Performance Optimization

- **`tf.tidy()`:** Wrap the inference loop in `tf.tidy()` to automatically dispose of intermediate tensors and prevent GPU memory leaks.
- **Frame Skipping:** If the device is slow, run inference on every 2nd or 3rd frame, but keep the video feed at 60fps.

---

## 6. Non-Functional Requirements

### 6.1 Performance

- **Initialization Time:** < 3 seconds to load the TF.js model on 4G networks.
- **FPS Target:** Min 20 FPS for inference on a standard integrated GPU (e.g., Intel Iris/UHD).
- **Bundle Size:** Use code splitting (React Router `lazy` loading) to ensure the heavy TF.js libraries are only loaded when the user enters the "Tutor" route.
