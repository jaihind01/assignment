const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs'); 
const connectDB = require('./config/db'); 
const User = require('./models/User'); 
const Student = require('./models/Student'); 
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;
connectDB();

app.use(bodyParser.json());
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(bodyParser.urlencoded({ extended: true }));


app.post('/register', async (req, res) => {
  const { username, email, password, repeatPassword } = req.body;

 
  if (!username || !email || !password || password !== repeatPassword) {
    return res.status(400).json({ message: 'Invalid input data or passwords do not match' });
  }

  try {
    // if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create and save the  user
    user = new User({
      username,
      email,
      password: hashedPassword, 
    });

    await user.save(); // Save user to MongoDB

    res.json({ message: 'User registered successfully!', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});


app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide both email and password' });
  }

  try {
   
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

   
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Successful login
    res.json({ message: 'Login successful!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Block a user
app.put('/users/:id/block', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    user.isBlocked = true;
    await user.save();
    
    res.json({ message: 'User blocked successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Unblock a user
app.put('/users/:id/unblock', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    user.isBlocked = false;
    await user.save();
    
    res.json({ message: 'User unblocked successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user role
app.put('/users/:id/role', async (req, res) => {
  const { role } = req.body;
  
  if (!['admin', 'user'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }
  
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    user.role = role;
    await user.save();
    
    res.json({ message: 'User role updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a new student
app.post('/students', async (req, res) => {
  const { firstName, lastName, email, dateOfBirth, enrolledCourses } = req.body;
  
  try {
    const student = new Student({ firstName, lastName, email, dateOfBirth, enrolledCourses });
    await student.save();
    
    res.status(201).json({ message: 'Student added successfully', student });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Edit student details
app.put('/students/:id', async (req, res) => {
  const { firstName, lastName, email, dateOfBirth, enrolledCourses } = req.body;
  
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, { firstName, lastName, email, dateOfBirth, enrolledCourses }, { new: true });
    if (!student) return res.status(404).json({ message: 'Student not found' });
    
    res.json({ message: 'Student updated successfully', student });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a student
app.delete('/students/:id', async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
