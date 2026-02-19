import axios from 'axios';

const baseURL = 'http://localhost:4000/';
//create a client instance for rag api
const ragClient = axios.create({
  baseURL,
  timeout: 30000, // 30 second timeout
});

// Add error interceptor for better error messages
ragClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
      error.message = 'Cannot connect to RAG backend. Make sure it is running on port 4000.';
    }
    return Promise.reject(error);
  }
);

//initiate a pdf from faiss
//http://localhost:4000/pdf/process?file=cv.pdf
const initiatePdf = async (pdfUrl: string) => {
  const response = await ragClient.post('/pdf/process?file=cv.pdf', { pdfUrl });
  return response.data;
};

// Ask the RAG backend a question (GET /pdf/analyze?q=...)
const analyzePdf = async (question: string) => {
  const response = await ragClient.get('/pdf/analyze', {
    params: { q: question },
  });
  return response.data;
};

//export the rag api
export const ragAPI = {
  initiatePdf,
  analyzePdf,
};
