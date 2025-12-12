📘 RAG Assistant – Chat With Your PDF (React + FastAPI + Gemini)

A full-stack Retrieval-Augmented Generation (RAG) application that lets you upload a PDF, ask questions, and get context-aware AI answers using Google Gemini, FAISS vector search, Cloudinary storage, and FastAPI backend.

🚀 Features
✅ Frontend (React + TypeScript + TailwindCSS)

Beautiful dark UI

Real-time typing-like AI answers

Upload PDFs + Ask questions

Fully responsive (Mobile, Tablet, PC)

Markdown-styled answers

Smooth animations with Framer Motion

✅ Backend (FastAPI + Python)

PDF extraction using PyMuPDF (fitz)

Chunking + Embedding using Gemini API

Vector search using FAISS CPU

Cloudinary upload for file hosting

Full chat history memory

Supports multiple users

🧠 RAG Pipeline

User uploads a PDF

PDF → text → chunks

Chunks converted into vector embeddings

FAISS stores & retrieves top-matching chunks

Gemini LLM answers using context + chat history

🏗️ Tech Stack
Frontend

React (TypeScript)

TailwindCSS

Framer Motion

React Hot Toast

Lucide Icons

Vite

Backend

FastAPI

FAISS CPU

PyMuPDF

Google Generative AI

Cloudinary

Python-dotenv

Uvicorn
