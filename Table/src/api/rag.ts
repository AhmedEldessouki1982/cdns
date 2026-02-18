import axios from 'axios';

const baseURL = 'http://localhost:4000/';
//create a client instance for rag api
const ragClient = axios.create({
  baseURL,
});

//initiate a pdf from faiss
//http://localhost:4000/pdf/process?file=cv.pdf
const initiatePdf = async (pdfUrl: string) => {
  const response = await ragClient.post('/pdf/process?file=cv.pdf', { pdfUrl });
  return response.data;
};

//asking the rag to answer a question
//http://localhost:4000/pdf/analyze
const analyzePdf = async (question: string) => {
  const response = await ragClient.post('/pdf/analyze', { question });
  return response.data;
};

//export the rag api
export const ragAPI = {
  initiatePdf,
  analyzePdf,
};
