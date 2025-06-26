# FanDuel Bet Slip Parser

This is a web application built with Next.js that allows users to upload a screenshot of a FanDuel betting slip. The app extracts relevant betting data using Optical Character Recognition (OCR) and displays the parsed information in a structured and interactive format.

## Features

- Upload a screenshot of a FanDuel bet slip (PNG or JPG)
- Extract text using Tesseract.js (OCR)
- Parse and structure key information:
  - Bet type, odds, game, stake, payout
  - Individual bet legs (players and actions)
  - Metadata such as bet ID and placed time
- Display the parsed data in a responsive UI
- Modal view of the original uploaded screenshot
- Option to input a custom stake and calculate projected payout
- Copy or download parsed bet data as a JSON file

## Technologies Used

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Tesseract.js](https://github.com/naptha/tesseract.js)
- [Headless UI](https://headlessui.com/) (for modals)

## Getting Started

### Prerequisites

- Node.js (v18 or later recommended)
- npm (or yarn, pnpm)

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/your-username/bet-slip-parser.git
cd bet-slip-parser
npm install
```

### Running the Development Server

```bash
npm run dev
```

Then visit [http://localhost:3000](http://localhost:3000) in your browser.

## Folder Structure

```
/app           → Next.js App Router (pages, layout)
/components    → Reusable UI components (Dropzone, BetCard)
/lib           → OCR and parsing utilities
/types         → Shared TypeScript types
/public        → Static assets (if needed)
```

## Notes

- Parsing logic is tuned for FanDuel betting slip templates and may require adjustment for other formats.
- OCR quality depends on the clarity of the uploaded screenshot.

## License

This project is open source and available under the MIT License.