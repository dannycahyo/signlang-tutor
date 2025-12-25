# Product Requirements Document (PRD): Sign Language Tutor

## 1. Executive Summary

**Sign Language Tutor** is an interactive, browser-based web application designed for learning and practicing sign language. By utilizing client-side machine learning (TensorFlow.js), the application functions as a "smart mirror," analyzing user hand signs via webcam and providing real-time corrective feedback. This tool targets students, educators, and learners of various sign language systems (ASL, SIBI, BISINDO, etc.), providing accessible training without specialized hardware.

## 2. Problem Statement

- **Lack of Accessibility:** Learning sign language often requires in-person instruction or static 2D images, which are difficult to mimic accurately.
- **Delayed Feedback:** Traditional self-study methods (books, videos) lack immediate validation, leading to the formation of incorrect muscle memory.
- **Hardware Barriers:** Existing digital solutions often require heavy downloads or high-end processing power, alienating users with standard devices.

## 3. Goals & Objectives

- **Accuracy:** Achieve >85% prediction accuracy for trained sign language gestures (e.g., alphabet signs A-Z) under standard lighting conditions.
- **Performance:** Maintain a minimum of 20 FPS on mid-range devices (e.g., standard laptops, modern smartphones) to ensure feedback feels "instant."
- **Accessibility:** Ensure the app is lightweight, requiring no backend server for inference (privacy-first & low latency).

---

## 4. User Personas

| Persona                       | Description                                                 | Needs                                                                         |
| ----------------------------- | ----------------------------------------------------------- | ----------------------------------------------------------------------------- |
| **The Novice Learner**        | A student or volunteer starting from scratch.               | Clear visual guides, gamified progress tracking, and encouraging feedback.    |
| **The Educator**              | A teacher looking for supplemental tools for the classroom. | Reliability, customizable training data, and ease of deployment (just a URL). |
| **The Developer/Contributor** | An open-source enthusiast interested in accessibility tech. | Clean codebase, modular ML components, and documentation.                     |

---

## 5. Functional Requirements

### 5.1 Core Features

- **Real-Time Hand Detection:** Use TensorFlow.js (specifically the HandPose or MediaPipe Hands model) to detect 21 3D hand landmarks.
- **Sign Classification:** A custom lightweight classifier (KNN or neural network) to classify the vector data from hand landmarks into target sign language gestures (e.g., alphabet letters A-Z).
- **Visual Guide Overlay:** Display a semi-transparent "ghost" hand or wireframe guide over the camera feed showing the _correct_ pose for the target sign.
- **Instant Feedback Loop:**
- **Success:** Visual confetti or green highlight when the confidence threshold (>90%) is met for 2 seconds.
- **Correction:** Text hints (e.g., "Straighten your index finger," "Show your palm") based on heuristic checks of specific landmarks.

### 5.2 Learning Modes

- **Practice Mode:** The user selects a specific letter to practice indefinitely.
- **Quiz Mode:** The app prompts random letters, and the user must sign them within a time limit.
- **Alphabet Run:** A linear progression challenge from A to Z, timing how fast the user can complete the full alphabet.

---

## 6. Technical Specifications

### 6.1 Technology Stack

- **Frontend Framework:** React.js or Vue.js (for reactive UI components).
- **ML Engine:** TensorFlow.js with the MediaPipe Hands runtime (specifically `tfjs-models/hand-pose-detection`).
- **Rendering:** HTML5 Canvas (for drawing skeletons/landmarks) layered over the Video element.
- **State Management:** Redux or Context API (to manage user progress and settings).

### 6.2 Data Flow

1. **Input:** Webcam stream captures video frames.
2. **Preprocessing:** Frames are resized and normalized in the browser.
3. **Detection:** MediaPipe extracts 21 keypoints (x, y, z coordinates).
4. **Classification:** Keypoints are fed into the custom sign language classifier model.
5. **Output:** Prediction class and confidence score trigger UI updates.

### 6.3 Constraints & Edge Cases

- **Lighting:** The model must be robust enough to handle varying indoor lighting, though extreme darkness will trigger a "Low Light" warning.
- **Occlusion:** The UI must detect when a hand is out of frame or obscured and prompt the user to "Center your hand."
- **Ambiguity:** Similar signs across different sign language systems require higher confidence thresholds or specific heuristic tie-breakers.

---

## 7. UI/UX Design Guidelines

### 7.1 Layout

- **Split Screen:** On desktop, show the reference image or control panel on the left and the "Smart Mirror" (webcam feed) on the right.
- **Mobile View:** Stacked layout with the webcam feed taking priority; reference images appear as small floating overlays.

### 7.2 Visual Indicators

- **Skeleton Overlay:** Draw the user's hand skeleton in **Red** when incorrect and transition to **Green** as they approach the correct shape.
- **Confidence Bar:** A dynamic bar showing how close the AI thinks the user is to the target sign.

---

## 8. Roadmap & Milestones

### Phase 1: MVP

- [ ] Setup basic React + TensorFlow.js environment.
- [ ] Implement MediaPipe Hand detection loop.
- [ ] Train a basic K-Nearest Neighbors (KNN) or small Neural Network classifier for vowels (A, I, U, E, O).
- [ ] Basic UI with webcam feed and prediction text.

### Phase 2: Refinement

- [ ] Expand training data to include the full alphabet (A-Z).
- [ ] Implement the "Visual Guide Overlay" (ghost hand).
- [ ] Add "Practice Mode" and "Quiz Mode."
- [ ] optimize FPS performance for mobile browsers.

### Phase 3: Polish & Launch

- [ ] Add visual polish (animations, confetti).
- [ ] Accessibility audit (screen reader support for navigation).
- [ ] Deploy to Vercel/Netlify.
- [ ] Write user documentation and release.
