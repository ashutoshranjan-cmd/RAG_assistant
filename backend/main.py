
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from rag import RAGChat
from cloudinary.uploader import upload
from cloudinary_config import *
import requests

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

rag_chat = RAGChat()

@app.on_event("startup")
def clear_data():
    rag_chat.index = None
    rag_chat.chunks = []
    rag_chat.chat_history = []

@app.post("/upload-pdf")
async def upload_pdf(file: UploadFile = File(...)):
    temp_bytes = await file.read()

    cloud = upload(temp_bytes, resource_type="raw")
    pdf_url = cloud.get("secure_url")

    file_bytes = requests.get(pdf_url).content

    from PyPDF2 import PdfReader
    import io

    reader = PdfReader(io.BytesIO(file_bytes))
    text = ""
    for page in reader.pages:
        text += page.extract_text() or ""

    words = text.split()
    chunks = [" ".join(words[i:i + 500]) for i in range(0, len(words), 500)]

    rag_chat.build_vector_store(chunks)

    return {"message": "PDF processed", "chunks": len(chunks), "pdf_url": pdf_url}

@app.post("/ask")
async def ask_question(question: str = Form(...)):
    answer = rag_chat.answer_question(question)
    return {"answer": answer}
