import express from 'express';
import chatRouter from './routes/chatRoutes';
import { setup } from './setup';
const cors = require('cors');

const app = express();

const { botResponse, query } = setup();

app.use(cors());
app.use(express.json()); 
app.use('/', chatRouter);

export { botResponse, query };
export default app;