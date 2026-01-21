const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: [true, 'Please add employee ID'],
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Please add employee name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please add email'],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    department: {
      type: String,
      required: [true, 'Please add department'],
      trim: true,
    },
    position: {
      type: String,
      required: [true, 'Please add position'],
      trim: true,
    },
    joinDate: {
      type: Date,
      default: Date.now,
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    salary: {
      type: Number,
      min: 0,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'on-leave'],
      default: 'active',
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Employee', employeeSchema);