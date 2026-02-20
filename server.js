const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Serve static files from current directory

// MongoDB Connection
const MONGO_URI = "mongodb+srv://sanzidis99_db_user:sanzidMONGOdb@proj1.2pgqduk.mongodb.net/portfolio_db?retryWrites=true&w=majority&appName=PROJ1";

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// --- Schemas & Models ---

const ProjectSchema = new mongoose.Schema({
  title: String,
  category: String,
  desc: String,
  tags: String,
  image: { type: String, default: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=600&auto=format&fit=crop' }
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

// --- Routes ---

// 1. Projects
app.get('/api/projects', async (req, res) => {
  try {
    const projects = await Project.find();
    res.json(projects);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/projects', async (req, res) => {
  try {
    const newProject = new Project(req.body);
    await newProject.save();
    res.json(newProject);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 2. Education
app.get('/api/education', async (req, res) => {
  try {
    const edu = await Education.find();
    res.json(edu);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/education', async (req, res) => {
  try {
    const newEdu = new Education(req.body);
    await newEdu.save();
    res.json(newEdu);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 3. Stats
app.get('/api/stats', async (req, res) => {
  try {
    // Return the most recently updated stats or default
    let stats = await Stats.findOne().sort({ _id: -1 });
    if (!stats) {
      stats = new Stats();
      await stats.save();
    }
    res.json(stats);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/stats', async (req, res) => {
  try {
    // Update existing or create new
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
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 4. CV Upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, __dirname),
  filename: (req, file, cb) => cb(null, 'cv.pdf') // Overwrite cv.pdf
});
const upload = multer({ storage: storage });

app.post('/api/upload-cv', upload.single('cvFile'), (req, res) => {
  if (!req.file) return res.status(400).send('No file uploaded.');
  res.send('CV Updated Successfully');
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));