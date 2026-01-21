const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const { protect, authorize } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(protect);

// @route   GET /api/employees
// @desc    Get all employees
// @access  Private/Admin
router.get('/', authorize('admin'), async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: employees.length,
      data: employees,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   GET /api/employees/:id
// @desc    Get single employee
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    // Employees can only view their own profile
    if (req.user.role === 'employee' && req.user.employeeId !== employee.employeeId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this employee',
      });
    }

    res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   POST /api/employees
// @desc    Create new employee
// @access  Private/Admin
router.post('/', authorize('admin'), async (req, res) => {
  try {
    const { employeeId, email } = req.body;

    // Check if employee already exists
    const employeeExists = await Employee.findOne({
      $or: [{ employeeId }, { email }],
    });

    if (employeeExists) {
      return res.status(400).json({
        success: false,
        message: 'Employee with this ID or email already exists',
      });
    }

    const employee = await Employee.create(req.body);

    res.status(201).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   PUT /api/employees/:id
// @desc    Update employee
// @access  Private/Admin
router.put('/:id', authorize('admin'), async (req, res) => {
  try {
    let employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    employee = await Employee.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   DELETE /api/employees/:id
// @desc    Delete employee
// @access  Private/Admin
router.delete('/:id', authorize('admin'), async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    await employee.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
      message: 'Employee deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;