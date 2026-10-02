import mongoose from 'mongoose';

const birthdaySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  dob: {
    type: Date,
    required: [true, 'Date of birth is required'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    unique: true,
    index: true,
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],
  },
  emailVerified: {
    type: Boolean,
    default: false,
    index: true,
  },
  verificationToken: {
    type: String,
    default: null,
    index: true,
  },
  verificationTokenExpires: {
    type: Date,
    default: null,
  },
  lastWishedYear: {
    type: Number,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Birthday = mongoose.model('Birthday', birthdaySchema);

export default Birthday;
