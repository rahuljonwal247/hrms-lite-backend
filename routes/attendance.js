const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const { protect, authorize } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(protect);

// @route   GET /api/attendance
// @desc    Get attendance records
// @access  Private
router.get('/', async (req, res) => {
  try {
    const { employeeId, startDate, endDate, status } = req.query;

    let query = {};

    // If employee role, only show their attendance
    if (req.user.role === 'employee') {
      query.employeeId = req.user.employeeId;
    } else if (employeeId) {
      query.employeeId = employeeId;
    }

    // Date range filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Status filter
    if (status) {
      query.status = status;
    }

    const attendance = await Attendance.find(query).sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: attendance.length,
      data: attendance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   GET /api/attendance/:id
// @desc    Get single attendance record
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id);

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found',
      });
    }

    res.status(200).json({
      success: true,
      data: attendance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   POST /api/attendance
// @desc    Mark attendance
// @access  Private/Admin
router.post('/', authorize('admin'), async (req, res) => {
  try {
    const { employeeId, date } = req.body;

    // Check if attendance already exists for this date
    const existingAttendance = await Attendance.findOne({
      employeeId,
      date: new Date(date),
    });

    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        message: 'Attendance already marked for this date',
      });
    }

    const attendance = await Attendance.create(req.body);

    res.status(201).json({
      success: true,
      data: attendance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   PUT /api/attendance/:id
// @desc    Update attendance record
// @access  Private/Admin
router.put('/:id', authorize('admin'), async (req, res) => {
  try {
    let attendance = await Attendance.findById(req.params.id);

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found',
      });
    }

    attendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      data: attendance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   DELETE /api/attendance/:id
// @desc    Delete attendance record
// @access  Private/Admin
router.delete('/:id', authorize('admin'), async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id);

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found',
      });
    }

    await attendance.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
      message: 'Attendance record deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   GET /api/attendance/stats/:employeeId
// @desc    Get attendance statistics for an employee
// @access  Private
router.get('/stats/:employeeId', async (req, res) => {
  try {
    const { employeeId } = req.params;

    // Verify authorization
    if (req.user.role === 'employee' && req.user.employeeId !== employeeId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this data',
      });
    }

    const stats = await Attendance.aggregate([
      { $match: { employeeId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalHours: { $sum: '$workHours' },
        },
      },
    ]);

    const totalRecords = await Attendance.countDocuments({ employeeId });

    res.status(200).json({
      success: true,
      data: {
        stats,
        totalRecords,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;