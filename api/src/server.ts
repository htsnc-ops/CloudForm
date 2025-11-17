import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { authRouter } from './routes/auth';
import { clientsRouter } from './routes/clients';
import { terminalRouter } from './routes/terminal';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/clients', clientsRouter);
app.use('/api/terminal', terminalRouter);

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});