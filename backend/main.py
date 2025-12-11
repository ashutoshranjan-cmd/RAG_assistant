from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from rag import PDFProcessor, RAGChat
import os
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

pdf_processor = PDFProcessor()
rag_chat = RAGChat()

@app.post("/upload-pdf")
async def upload_pdf(file:UploadFile = File(...)):
    file_path = f"uploaded_files/{file.filename}"
    with open(file_path,"wb") as f:
        f.write(await file.read())
    
    text_chunks = pdf_processor.extract_and_split(file_path)
    rag_chat.build_vector_store(text_chunks)
    return {"message":"PDF processed","chunks":len(text_chunks)}

@app.post("/ask")
async def ask_question(question:str = Form(...)):
    answer = rag_chat.answer_question(question)
    return {"answer":answer}
