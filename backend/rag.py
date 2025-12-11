import faiss
from pypdf import PdfReader
import google.generativeai as genai
import numpy as np

genai.configure(api_key="AIzaSyAKz6oBJnxnRoMZ66R4jC3IR4ppJSE4Oic")

class PDFProcessor:
    def extract_and_split(self,pdf_path):
        reader = PdfReader(pdf_path)
        text = ""
    
        for page in reader.pages:
            text+= page.extract_text() + "\n"

        
        # split text into chunks (RAG best practice)
        chunks = []
        chunk_size = 500
        words = text.split()

        for i in  range(0,len(words), chunk_size):
            chunks.append(" ".join(words[i:i + chunk_size]))

        return chunks
    
class RAGChat:
    def __init__(self):
        self.embeddings_model = genai.embed_content
        self.llm_model = genai.GenerativeModel("gemini-2.5-flash")
        self.index = None
        self.text_chunks = []


    def get_embeddings(self, text):
        res = self.embeddings_model(
            model = "models/text-embedding-004",
            content=text
        )
        return np.array(res["embedding"],dtype="float32")
    
    def build_vector_store(self,chunks):
        self.text_chunks = chunks
        embeddings = [self.get_embeddings(c) for c in chunks]
        dim = len(embeddings[0])
        self.index = faiss.IndexFlatL2(dim)
        self.index.add(np.array(embeddings))

    def search(self, query, k = 3):
        q_embed = self.get_embeddings(query)
        distances,indexes = self.index.search(np.array([q_embed]),k)
        return [self.text_chunks[i] for i in indexes[0]]
    
    def answer_question(self,question):
        context_chunks = self.search(question)
        context = "\n".join(context_chunks)

        prompt = f""" use the following PDF Context to answer the question. PDF Context {context} Question "{question} """

        response = self.llm_model.generate_content(prompt)
        return response.text
    
