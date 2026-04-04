import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import surveyRoutes from './routes/surveyRoutes';
import responseRoutes from './routes/responseRoutes';
import { db } from './services/firebase';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

db.collection('test').get()
  .then(() => console.log('Firestore connected'))
  .catch(err => console.error('Firestore error:', err));

app.use('/api/surveys', surveyRoutes);
app.use('/api/responses', responseRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});