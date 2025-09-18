const express = require("express");
const multer = require('multer');
const { GridFSBucket } = require('mongodb');
const mongoose = require('mongoose');
const { 
  addConsultation, 
  getConsultations,
  getConsultationById,
  updateConsultation,
  deleteConsultation,
  getConsultationsByUser,
  getMyConsultations // NEW: Import the new controller method
} = require("../controllers/consultationController");
const {authMiddleware} = require("../middleware/authmiddleware");

const router = express.Router();

// Configure multer for PDF uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// Initialize GridFS bucket
let gfsBucket;
mongoose.connection.once('open', () => {
  gfsBucket = new GridFSBucket(mongoose.connection.db, {
    bucketName: 'kundaliPdfs'
  });
});

// Error handling middleware for multer
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ msg: 'File too large. Maximum size is 10MB.' });
    }
  }
  if (error.message === 'Only PDF files are allowed') {
    return res.status(400).json({ msg: 'Only PDF files are allowed.' });
  }
  next(error);
};

// NEW: Helper middleware to check consultation ownership
const checkConsultationOwnership = async (req, res, next) => {
  try {
    const Consultation = require('../models/Consultation');
    const consultation = await Consultation.findById(req.params.id);
    
    if (!consultation) {
      return res.status(404).json({ msg: 'Consultation not found' });
    }
    
    if (!consultation.isOwnedBy(req.user.id)) {
      return res.status(403).json({ msg: 'Access denied. You can only access your own consultations.' });
    }
    
    req.consultation = consultation;
    next();
  } catch (error) {
    res.status(500).json({ msg: 'Server error while checking consultation ownership' });
  }
};

// NEW: Get current user's consultations (simplified endpoint)
router.get("/my", authMiddleware(), getMyConsultations);

// Get all consultations with filters and search (user-specific)
router.get("/", authMiddleware(), getConsultations);

// Get consultation by ID (with ownership check)
router.get("/details/:id", authMiddleware(), getConsultationById);

// Get consultations by user ID (with ownership validation)
router.get("/user/:userId", authMiddleware(), getConsultationsByUser);

// View PDF file (with ownership check)
router.get("/:id/pdf/view", authMiddleware(), checkConsultationOwnership, async (req, res) => {
  try {
    const consultation = req.consultation;

    if (!consultation.kundaliFileId) {
      return res.status(404).json({ msg: 'PDF not found' });
    }

    const downloadStream = gfsBucket.openDownloadStream(consultation.kundaliFileId);
    
    downloadStream.on('error', (error) => {
      console.error('GridFS download error:', error);
      return res.status(404).json({ msg: 'PDF file not found' });
    });

    // Set headers for inline PDF viewing
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline',
      'Cache-Control': 'private, max-age=3600'
    });

    downloadStream.pipe(res);
  } catch (error) {
    console.error('Error viewing PDF:', error);
    res.status(500).json({ msg: 'Server error while viewing PDF' });
  }
});

// Download PDF file (with ownership check)
router.get("/:id/pdf", authMiddleware(), checkConsultationOwnership, async (req, res) => {
  try {
    const consultation = req.consultation;

    if (!consultation.kundaliFileId) {
      return res.status(404).json({ msg: 'PDF not found' });
    }

    const downloadStream = gfsBucket.openDownloadStream(consultation.kundaliFileId);
    
    downloadStream.on('error', (error) => {
      console.error('GridFS download error:', error);
      return res.status(404).json({ msg: 'PDF file not found' });
    });

    // Set headers for PDF download
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${consultation.kundaliPdfName || 'kundali.pdf'}"`,
      'Cache-Control': 'private, max-age=0'
    });

    downloadStream.pipe(res);
  } catch (error) {
    console.error('Error downloading PDF:', error);
    res.status(500).json({ msg: 'Server error while downloading PDF' });
  }
});

// Create new consultation with PDF upload
router.post("/", authMiddleware(), upload.single('kundaliPdf'), handleMulterError, async (req, res) => {
  try {
    // Parse consultation data from form
    let consultationData;
    if (req.body.consultationData) {
      consultationData = JSON.parse(req.body.consultationData);
    } else {
      consultationData = req.body;
    }

    // Handle PDF upload if file is provided
    if (req.file) {
      const uploadStream = gfsBucket.openUploadStream(req.file.originalname, {
        metadata: {
          originalName: req.file.originalname,
          uploadDate: new Date(),
          consultationId: null, // Will be updated after consultation is created
          createdBy: req.user.id // NEW: Track who uploaded the file
        }
      });

      uploadStream.end(req.file.buffer);
      
      await new Promise((resolve, reject) => {
        uploadStream.on('finish', () => {
          consultationData.kundaliFileId = uploadStream.id;
          consultationData.kundaliPdfName = req.file.originalname;
          resolve();
        });
        uploadStream.on('error', reject);
      });
    }

    // Call your existing controller with modified request
    req.body = consultationData;
    req.gfsBucket = gfsBucket; // Pass gfsBucket to controller for metadata update
    await addConsultation(req, res);

  } catch (error) {
    console.error('Error creating consultation:', error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
});

// Update consultation with optional PDF upload (with ownership check)
router.put("/:id", authMiddleware(), upload.single('kundaliPdf'), handleMulterError, async (req, res) => {
  try {
    const Consultation = require('../models/Consultation');
    const existingConsultation = await Consultation.findById(req.params.id);

    if (!existingConsultation) {
      return res.status(404).json({ msg: 'Consultation not found' });
    }

    // NEW: Check ownership before allowing update
    if (!existingConsultation.isOwnedBy(req.user.id)) {
      return res.status(403).json({ msg: 'Access denied. You can only update your own consultations.' });
    }

    // Parse consultation data
    let consultationData;
    if (req.body.consultationData) {
      consultationData = JSON.parse(req.body.consultationData);
    } else {
      consultationData = req.body;
    }

    // Handle new PDF upload
    if (req.file) {
      // Delete old PDF if exists
      if (existingConsultation.kundaliFileId) {
        try {
          await gfsBucket.delete(existingConsultation.kundaliFileId);
          console.log('Old PDF deleted successfully');
        } catch (error) {
          console.log('Old PDF not found in GridFS, continuing...');
        }
      }

      // Upload new PDF
      const uploadStream = gfsBucket.openUploadStream(req.file.originalname, {
        metadata: {
          originalName: req.file.originalname,
          uploadDate: new Date(),
          consultationId: req.params.id,
          createdBy: req.user.id // NEW: Track who uploaded the file
        }
      });

      uploadStream.end(req.file.buffer);
      
      await new Promise((resolve, reject) => {
        uploadStream.on('finish', () => {
          consultationData.kundaliFileId = uploadStream.id;
          consultationData.kundaliPdfName = req.file.originalname;
          resolve();
        });
        uploadStream.on('error', reject);
      });
    }

    // Call your existing controller
    req.body = consultationData;
    await updateConsultation(req, res);

  } catch (error) {
    console.error('Error updating consultation:', error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
});

// Delete consultation (enhanced to delete PDF with ownership check)
router.delete("/:id", authMiddleware(), async (req, res) => {
  try {
    const Consultation = require('../models/Consultation');
    const consultation = await Consultation.findById(req.params.id);

    if (!consultation) {
      return res.status(404).json({ msg: 'Consultation not found' });
    }

    // NEW: Check ownership before allowing deletion
    if (!consultation.isOwnedBy(req.user.id)) {
      return res.status(403).json({ msg: 'Access denied. You can only delete your own consultations.' });
    }

    // Delete PDF from GridFS if exists
    if (consultation.kundaliFileId) {
      try {
        await gfsBucket.delete(consultation.kundaliFileId);
        console.log('PDF deleted from GridFS successfully');
      } catch (error) {
        console.log('PDF file not found in GridFS, continuing with consultation deletion...');
      }
    }

    // Call your existing delete controller
    await deleteConsultation(req, res);

  } catch (error) {
    console.error('Error deleting consultation:', error);
    res.status(500).json({ msg: 'Server error while deleting consultation' });
  }
});

module.exports = router;