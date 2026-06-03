# Feature Specification: Grade 2 Ontario Mathematics Learning App

**Feature Branch**: `001-grade2-ontario-math`

**Created**: 2026-06-03

**Status**: Draft

**Input**: User description: "A web app that uses the Ontario Public School curriculum for Grade 2 Mathematics, organized by units, with information to teach each unit to a Grade 2 child, plus testing and homework built into the app."

## Overview

A self-contained, kid-friendly web application that teaches the **Ontario Grade 2 Mathematics
(2020) curriculum**. Content is organized into **units that mirror the five curriculum strands**.
Every unit offers three modes: **Learn** (teaching), **Practice** (a graded test/quiz with instant
feedback), and **Homework** (a problem set the child can complete and self-check). Progress and
scores are saved on the device so a child can return and continue.

### Curriculum strands → units

| # | Unit (Strand)        | Sample Grade 2 expectations covered |
|---|----------------------|--------------------------------------|
| 1 | Number               | Count/represent numbers to 200, place value, skip counting by 2/5/10/25, compare & order, add & subtract to 100, fractions (halves & fourths) |
| 2 | Algebra              | Repeating/growing/shrinking patterns, equality & the equal sign, simple equations |
| 3 | Data                 | Tally charts, pictographs & bar graphs, reading data, probability (likely/unlikely) |
| 4 | Spatial Sense        | 2D shapes & 3D solids, location & movement, measure length/mass/capacity/area/time/temperature |
| 5 | Financial Literacy   | Canadian coins & bills, counting money, making amounts, simple spending choices |

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Child learns a unit (Priority: P1)

A Grade 2 child (with a parent/guardian nearby) opens the app, picks a unit, and reads/interacts
with the **Learn** content written at a Grade 2 reading level with visuals and examples.

**Why this priority**: Teaching content is the core value; without it the app cannot teach.

**Independent Test**: Open the app, choose "Number", read the lesson cards, and confirm the
material explains the concept with examples a 7-year-old can follow.

**Acceptance Scenarios**:

1. **Given** the home screen, **When** the child taps a unit card, **Then** the unit's Learn tab opens with lesson content.
2. **Given** a unit's Learn tab, **When** the child taps "Practice", **Then** the quiz for that unit opens.

### User Story 2 - Child takes a practice test (Priority: P1)

The child answers a short interactive quiz for a unit and receives **instant feedback** per question
and a **final score** with encouragement.

**Why this priority**: Testing reinforces learning and shows mastery; explicitly requested.

**Independent Test**: Open any unit's Practice tab, answer all questions, and confirm a score and
feedback are shown, and the score is saved.

**Acceptance Scenarios**:

1. **Given** a quiz question, **When** the child selects/enters an answer, **Then** the app marks it right/wrong and shows a short explanation.
2. **Given** the last question is answered, **When** the quiz ends, **Then** a score summary (e.g., 6/8) and a star rating are displayed and stored.

### User Story 3 - Child does homework (Priority: P2)

The child opens the **Homework** tab for a unit, works through problems, and uses a **Check answers**
button to self-mark. Homework can be printed for offline work.

**Why this priority**: Homework extends practice; requested but secondary to learn+test.

**Independent Test**: Open a unit's Homework tab, fill in answers, click Check, and confirm correct
answers are marked and a printable view is available.

**Acceptance Scenarios**:

1. **Given** a homework set, **When** the child clicks "Check answers", **Then** each item is marked correct/incorrect with the right answer revealed.
2. **Given** a homework set, **When** the child clicks "Print", **Then** a clean printable worksheet is produced.

### User Story 4 - Parent sees progress (Priority: P3)

A parent views a simple dashboard showing which units have been started/completed and the latest
quiz scores.

**Acceptance Scenarios**:

1. **Given** completed quizzes, **When** the home screen loads, **Then** each unit card shows progress (e.g., best score / stars).
2. **Given** stored progress, **When** the parent clicks "Reset progress", **Then** all saved data is cleared after confirmation.

## Functional Requirements

- **FR-1**: Present 5 units mapping to the Ontario Grade 2 math strands.
- **FR-2**: Each unit provides Learn, Practice, and Homework modes.
- **FR-3**: Learn content is age-appropriate (Grade 2 reading level), with examples/visuals.
- **FR-4**: Practice quizzes give per-question feedback and a final score; multiple question types (multiple choice and numeric entry).
- **FR-5**: Homework supports self-check and printing.
- **FR-6**: Progress and best scores persist locally (localStorage) and display on the home dashboard.
- **FR-7**: App is responsive and works offline as static files (no backend, no build step).
- **FR-8**: Accessible: keyboard operable, sufficient contrast, large touch targets, readable font.

## Non-Goals

- No accounts, login, or server/database.
- Not an official Ontario Ministry product; content is aligned to public curriculum expectations for educational use.

## Success Criteria

- A child can complete a full Learn → Practice → Homework loop for every unit.
- Quiz scores and unit progress are saved and shown on return.
- Runs by opening `index.html` or via any static host, on desktop and tablet.
