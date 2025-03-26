const express = require('express');
const cors = require('cors');
const { PatientController } = require('./controllers/PatientController');

const app = express();

// ตั้งค่า CORS
app.use(cors({
  origin: 'http://localhost:3000', // อนุญาตให้เฉพาะ frontend เข้าถึง
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Middleware สำหรับ parse JSON
app.use(express.json());

// API endpoints
app.get('/api/patients', async (req, res) => {
  const search = req.query.search as string;

  try {
    if (search) {
      const result = await PatientController.searchPatients(search);
      res.json(result);
    } else {
      const result = await PatientController.getAllPatients();
      res.json(result);
    }
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.post('/api/patients', async (req, res) => {
  try {
    const result = await PatientController.createPatient(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.put('/api/patients/:id', async (req, res) => {
  try {
    const result = await PatientController.updatePatient(req.params.id, req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.delete('/api/patients/:id', async (req, res) => {
  try {
    const result = await PatientController.deletePatient(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
