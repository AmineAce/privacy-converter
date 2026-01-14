# Secure Converter

A privacy-first, client-side image transformation tool.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React + Vite](https://img.shields.io/badge/React%20%2B%20Vite-18.2.0%20%2B%204.3.9-blue.svg)](https://reactjs.org/)
[![Privacy: 100%](https://img.shields.io/badge/Privacy-100%25-green.svg)](https://github.com/AmineAce/privacy-converter)

[View Live Demo](https://secure-jpg-to-png.pages.dev)

![App Screenshot](./public/og-image.png)

## Why

Modern image converters are often bloated with ads, trackers, and upload your files to servers for processing, compromising your privacy. This tool was built to solve that problem by keeping all processing in the browser memory using the HTML5 Canvas API - your images never leave your device.

## Features

- **Strictly Local**: Zero server uploads. Files never leave the device.
- **Universal Input**: Supports JPG, PNG, WebP, and SVG (Vector).
- **Multi-Format Output**: Convert to JPG, PNG, or WebP.
- **Batch Engine**: Process unlimited files simultaneously.
- **Clean UI**: Ad-supported but non-intrusive (Symmetrical Layout).

## Tech Stack

- **Vite 6** (Build Tool)
- **React + TypeScript** (Framework)
- **Zustand** (State Management)
- **Tailwind CSS** (Styling)

## Running Locally

```bash
git clone https://github.com/AmineAce/privacy-converter.git
cd privacy-converter
npm install
npm run dev
```
