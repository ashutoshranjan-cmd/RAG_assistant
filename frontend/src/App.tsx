
import { useState, ChangeEvent, KeyboardEvent } from "react";
import { FileText, Send, Upload, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster, toast } from "react-hot-toast";

interface AnswerResponse {
  answer: string;
}

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [question, setQuestion] = useState<string>("");
  const [answer, setAnswer] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isAsking, setIsAsking] = useState<boolean>(false);

  const formatMarkdown = (text: string): string => {
    if (!text) return "";

    let formatted = text
      .replace(/### (.*?)(\n|$)/g, '<h3 class="text-lg font-semibold text-gray-100 mt-4 mb-2">$1</h3>')
      .replace(/## (.*?)(\n|$)/g, '<h2 class="text-xl font-semibold text-gray-100 mt-5 mb-3">$1</h2>')
      .replace(/# (.*?)(\n|$)/g, '<h1 class="text-2xl font-bold text-gray-100 mt-6 mb-3">$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-100">$1</strong>')
      .replace(/__(.*?)__/g, '<strong class="font-semibold text-gray-100">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic text-gray-300">$1</em>')
      .replace(/_(.*?)_/g, '<em class="italic text-gray-300">$1</em>')
      .replace(/^\* (.*?)$/gm, '<li class="ml-4 text-gray-200">$1</li>')
      .replace(/^- (.*?)$/gm, '<li class="ml-4 text-gray-200">$1</li>')
      .replace(/`([^`]+)`/g, '<code class="bg-[#2A2A2A] px-2 py-1 rounded text-gray-200">$1</code>')
      .replace(/\n\n/g, "<br/><br/>")
      .replace(/\n/g, "<br/>");

    return formatted;
  };

  const uploadPDF = async () => {
    if (!file) return toast.error("Select a PDF first!");

    setIsUploading(true);
  
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("http://localhost:8000/upload-pdf", {
        method: "POST",
        body: formData,
      });

      res.ok ? toast.success("PDF Uploaded!") : toast.error("Failed to upload.");
    } catch {
      toast.error("Upload failed.");
    }

    setIsUploading(false);
  };

  const askQuestion = async () => {
    if (!question.trim()) return toast.error("Enter a question!");

    setIsAsking(true);

    try {
      const formData = new FormData();
      formData.append("question", question);

      const res = await fetch("http://localhost:8000/ask", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data: AnswerResponse = await res.json();
        setAnswer(data.answer);
      } else toast.error("Failed to get answer.");
    } catch {
      toast.error("Error getting answer.");
    }

    setIsAsking(false);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") askQuestion();
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-gray-100 flex flex-col">
      <Toaster position="top-right" />

      {/* Header */}
      <header className="w-full bg-[#171717] border-b border-[#2A2A2A] py-4 px-6">
        <h1 className="text-2xl font-semibold">RAG Assistant</h1>
        <p className="text-sm text-gray-400">Upload PDF → Ask Questions → Get Answers</p>
      </header>

      {/* TWO COLUMN LAYOUT */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* LEFT SECTION — Upload + Ask */}
        <div className="w-1/3 min-w-[300px] border-r border-[#2A2A2A] p-5 flex flex-col gap-6 bg-[#121212]">
          
          {/* Upload */}
          <div className="bg-[#1a1a1a] border border-[#2A2A2A] p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-400" />
              Upload PDF
            </h2>

            <input
              type="file"
              accept="application/pdf"
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setFile(e.target.files?.[0] || null)
              }
              className="w-full p-2 bg-[#0D0D0D] text-gray-300 rounded border border-[#2A2A2A]"
            />

            <button
              onClick={uploadPDF}
              disabled={!file || isUploading}
              className="mt-3 w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-md text-white font-medium disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              Upload
            </button>
          </div>

          {/* Ask */}
          <div className="bg-[#1a1a1a] border border-[#2A2A2A] p-4 rounded-lg flex flex-col">
            <h2 className="text-lg font-semibold mb-3">Ask a Question</h2>

            <input
              type="text"
              placeholder="Type your question..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyPress}
              className="w-full px-3 py-2 bg-[#0D0D0D] border border-[#2A2A2A] rounded text-gray-200"
            />

            <button
              onClick={askQuestion}
              disabled={isAsking || !question.trim()}
              className="mt-3 w-full bg-green-600 hover:bg-green-700 py-2 rounded-md text-white font-medium disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {isAsking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Ask
            </button>
          </div>
        </div>

        {/* RIGHT SECTION — Answer */}
        <div className="flex-1 p-5 overflow-y-auto bg-[#0D0D0D]">
          <div className="bg-[#171717] border border-[#2A2A2A] p-6 rounded-xl min-h-full">
            <h2 className="text-xl font-semibold mb-4">Answer</h2>

            <div
              className="text-gray-200 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: formatMarkdown(answer || "Ask something to get started!") }}
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default App;
