# PAPERPULSE: A DSA-BASED PAST QUESTION PAPER ANALYSIS SYSTEM

<p align="center">
  <strong>Find recurring questions. Understand the evidence. Revise smarter.</strong>
</p>

<p align="center">
  <a href="https://barathvasan-dev.github.io/paperpulse-dsa-mini-project/">▶ View the interactive demo</a>
  ·
  <a href="https://github.com/barathvasan-dev/paperpulse-dsa-mini-project">View source</a>
</p>

PaperPulse is a browser-based academic mini project that analyzes past question papers and identifies recurring questions across multiple source papers. It combines a JavaScript interface, a C analysis engine compiled to WebAssembly, and local browser storage to provide a private, install-free study workspace.

> **Project title:** PAPERPULSE: A DSA-BASED PAST QUESTION PAPER ANALYSIS SYSTEM

## Project highlights

| Area | Implementation |
| --- | --- |
| Input | Plain text, PDF, image, and OCR-based extraction |
| Analysis | Token normalization and ordered similarity |
| Grouping | Transitive recurring-question groups |
| Output | Ranked evidence view and CSV export |
| Runtime | Browser, WebAssembly, and local storage |
| Privacy | Papers are processed locally on the device |

## Features

- Import plain-text, PDF, PNG, JPEG, WebP, and BMP question papers.
- Extract questions and review their wording, topics, marks, paper name, and year.
- Compare questions using token normalization and longest common subsequence similarity.
- Group recurring questions with Union-Find (Disjoint Set Union).
- Rank question groups by distinct source-paper coverage and known marks.
- Search and filter ranked questions.
- Export the current ranking as CSV.
- Run entirely in the browser with local storage; uploaded source files are not sent to a server.

## DSA algorithms used

The project’s main contribution is the use of classical Data Structures and Algorithms to turn unstructured past papers into ranked revision evidence.

The analysis engine in [`engine/pulse.c`](engine/pulse.c) uses:

| Algorithm / data structure | Purpose in PaperPulse | Complexity |
| --- | --- | --- |
| **Chained hash-map inverted index** | Finds candidate question pairs that share normalized tokens without comparing every pair blindly. | Expected near-linear index lookup |
| **Longest Common Subsequence (LCS)** | Measures how much of two questions appears in the same order. Similarity is `2 × LCS / (length A + length B)`. | `O(m × n)` per comparison |
| **Union-Find / Disjoint Set Union** | Merges matching pairs transitively, so related questions form one recurring group. Uses path compression and union by size. | Near-constant amortized union/find |
| **Randomized Quick Sort** | Ranks groups by distinct-paper coverage, known marks, and component ID. | Expected `O(g log g)` |

The compiled WebAssembly engine is included at [`dist/pulse.wasm`](dist/pulse.wasm), so no build step is required for normal use.

## Run locally

### Windows

Double-click [`Start PaperPulse.cmd`](Start%20PaperPulse.cmd), then open <http://127.0.0.1:8174/>.

### Command line

From the project directory:

```powershell
python -m http.server 8174 --bind 127.0.0.1 --directory dist
```

Open <http://127.0.0.1:8174/> in a browser. Serving through localhost enables browser storage, workers, and WebAssembly.

## Try the sample data

The [`sample-data/`](sample-data/) directory contains six plain-text past-paper examples. Import them one at a time through **Paper library**, review the extracted questions, and select **Save and analyze**.

## Project structure

```text
paperpulse-dsa-mini-project/
├── dist/                 # Browser application, WebAssembly, OCR, and PDF assets
├── engine/pulse.c        # C analysis engine
├── sample-data/          # Sample past question papers
├── screenshots/          # UI screenshots
├── output/               # Example CSV export
├── Start PaperPulse.cmd  # Windows launcher
└── README.md
```

## Build the WebAssembly engine

If Zig 0.14.1 is installed, rebuild the included engine from the project directory:

```powershell
zig build-exe engine/pulse.c -target wasm32-freestanding -O ReleaseSmall -fno-entry --export=reset --export=input --export=analyze --export=ranked --export=group --export=coverage --export=score --export-memory -femit-bin=dist/pulse.wasm
```

## Screenshots and demo

### Application screens

The screenshots below are intentionally sized for readability in the GitHub page. Full-resolution files are available in [`screenshots/`](screenshots/).

<p>
  <strong>Workspace</strong><br>
  <img src="screenshots/workspace.png" alt="PaperPulse workspace" width="720">
</p>

<p>
  <strong>Paper library</strong><br>
  <img src="screenshots/paper-library.png" alt="PaperPulse paper library" width="720">
</p>

<p>
  <strong>Question ranking</strong><br>
  <img src="screenshots/question-ranking.png" alt="PaperPulse question ranking" width="720">
</p>

<p>
  <strong>Algorithm lab</strong><br>
  <img src="screenshots/algorithm-lab.png" alt="PaperPulse algorithm lab" width="720">
</p>

### Video demonstration

<p align="center">
  <a href="https://barathvasan-dev.github.io/paperpulse-dsa-mini-project/"><strong>▶ Open the PaperPulse interactive demo and video player</strong></a>
</p>

The [GitHub Pages video player](https://barathvasan-dev.github.io/paperpulse-dsa-mini-project/) provides native browser playback using the hosted MP4.

- [`output/paperpulse-rankings.csv`](output/paperpulse-rankings.csv) is an example ranking export.

## Privacy and limitations

PaperPulse processes papers on the device. Reviewed data is stored in this browser's local storage for this site. Original uploaded files are discarded after extraction. Clearing site data removes the collection. There are no accounts or cross-device backups.

Current limits are 25 MB per upload, 60 pages per PDF, 600 questions per subject, and 128 normalized tokens per question. OCR, mathematical notation, and multi-column layouts should be reviewed manually.

## License

This project is provided as an educational mini project. Add a license file before redistributing it publicly.
