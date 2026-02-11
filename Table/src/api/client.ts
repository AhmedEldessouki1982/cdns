//src/api/client.ts
import axios from 'axios';

const baseURL = 'http://localhost:3000/';

//create a client instance
const client = axios.create({
  baseURL,
});

//add token to headers
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

//add error handling
client.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

//check is user is authenticated
// const isUserAuthenticated = () => {
//   const token = localStorage.getItem('token');
//   if (token) {
//     return true;
//   }
//   return false;
// };

//function for update user information
const updateUserById = (id: string | number, data: { name?: string; email?: string; mobile?: string }) => {
  return client.patch(`/users/${id}`, data).then((response) => response.data);
};

//function is user authenticated
const isAuthenticated = () => {
  return client.get('/auth/isAuthenticated');
};

//function for signout
const signout = () => {
  localStorage.removeItem('token');
  return true;
};

//function for login
const signin = ({ email, password }: { email: string; password: string }) => {
  return client.post('/auth/signin', { email, password });
};

//function for register
const register = ({
  email,
  password,
  mobile,
  name,
}: {
  email: string;
  password: string;
  mobile: string;
  name: string;
}) => {
  return client.post('/users/register', { email, password, mobile, name });
};

//define function route to /auth/profile
const profile = () => {
  return client.get('/auth/profile');
};

//function for RAG AI analysis
const askAI = (question: string) => {
  return client.get('/rag/answer', { params: { q: question } }).then((response) => response.data);
};

export const api = {
  signin: signin,
  register: register,
  myProfile: profile,
  isAuthenticated: isAuthenticated,
  signout: signout,
  updateUser: updateUserById,
  askAI: askAI,
};
