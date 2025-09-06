import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:8081/', // Replace with your Spring Boot API base URL
  headers: {
    'Content-Type': 'application/json',
  },
});

export default instance;
