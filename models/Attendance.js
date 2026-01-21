const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: [true, 'Please add employee ID'],
      trim: true,
    },
    employeeName: {
      type: String,
      required: [true, 'Please add employee name'],
    },
    date: {
      type: Date,
      required: [true, 'Please add date'],
    },
    checkIn: {
      type: String,
      trim: true,
    },
    checkOut: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'late', 'half-day', 'on-leave'],
      default: 'absent',
    },
    workHours: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create compound index to ensure one attendance record per employee per day
attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

// Calculate work hours before saving
attendanceSchema.pre('save', function (next) {
  if (this.checkIn && this.checkOut) {
    const checkInTime = new Date(`1970-01-01T${this.checkIn}`);
    const checkOutTime = new Date(`1970-01-01T${this.checkOut}`);
    const diffMs = checkOutTime - checkInTime;
    this.workHours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
  }
  next();
});

module.exports = mongoose.model('Attendance', attendanceSchema);