require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const MONGO_URI = process.env.MONGO_URI;   // ✅ THIS LINE IS REQUIRED

const app = express();
const PORT = process.env.PORT || 3000;


// ===============================
// Middleware
// ===============================
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://sanzid-portfolio.netlify.app'
  ]
}));

app.use(express.json());

// ===============================
// MongoDB Connection
// ===============================
if (!MONGO_URI) {
  console.error("❌ MONGO_URI not defined. Check your .env or Render environment variables.");
  process.exit(1);
}

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err);
    process.exit(1);
  });

// ===============================
// Schemas & Models
// ===============================
const ProjectSchema = new mongoose.Schema({
  title: String,
  category: String,
  desc: String,
  tags: String,
  image: {
    type: String,
    default: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=600&auto=format&fit=crop'
  }
});
const Project = mongoose.model('Project', ProjectSchema);

const EducationSchema = new mongoose.Schema({
  degree: String,
  inst: String,
  year: String,
  status: String
});
const Education = mongoose.model('Education', EducationSchema);

const StatsSchema = new mongoose.Schema({
  projects: { type: Number, default: 0 },
  tech: { type: Number, default: 0 },
  years: { type: Number, default: 0 },
  commit: { type: Number, default: 100 }
});
const Stats = mongoose.model('Stats', StatsSchema);

// ===============================
// Routes
// ===============================

// Health Check Route (for Render)
app.get('/', (req, res) => {
  res.send('API is running...');
});

// 1️⃣ Projects
app.get('/api/projects', async (req, res) => {
  try {
    const projects = await Project.find();
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/projects', async (req, res) => {
  try {
    const newProject = new Project(req.body);
    await newProject.save();
    res.json(newProject);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2️⃣ Education
app.get('/api/education', async (req, res) => {
  try {
    const edu = await Education.find();
    res.json(edu);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/education', async (req, res) => {
  try {
    const newEdu = new Education(req.body);
    await newEdu.save();
    res.json(newEdu);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3️⃣ Stats
app.get('/api/stats', async (req, res) => {
  try {
    let stats = await Stats.findOne().sort({ _id: -1 });

    if (!stats) {
      stats = new Stats();
      await stats.save();
    }

    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/stats', async (req, res) => {
  try {
    let stats = await Stats.findOne().sort({ _id: -1 });

    if (stats) {
      stats.projects = req.body.projects;
      stats.tech = req.body.tech;
      stats.years = req.body.years;
      stats.commit = req.body.commit;
      await stats.save();
    } else {
      stats = new Stats(req.body);
      await stats.save();
    }

    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4️⃣ CV Upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, __dirname),
  filename: (req, file, cb) => cb(null, 'cv.pdf')
});

const upload = multer({ storage });

app.post('/api/upload-cv', upload.single('cvFile'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  res.send('CV Updated Successfully');
});

// ===============================
// Start Server
// ===============================
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});