const Consultation = require("../models/Consultation");
const { GridFSBucket } = require('mongodb');
const mongoose = require('mongoose');

// Helper function to get GridFS bucket
const getGFSBucket = () => {
  return new GridFSBucket(mongoose.connection.db, {
    bucketName: 'kundaliPdfs'
  });
};

exports.addConsultation = async (req, res) => {
  try {
    // NEW: Add the authenticated user as the creator
    const consultationData = {
      ...req.body,
      createdBy: req.user.id // Set the authenticated user as creator
    };
    
    const consultation = await Consultation.create(consultationData);
    
    // Update GridFS metadata if file was uploaded
    if (consultation.kundaliFileId && req.gfsBucket) {
      try {
        const gfsBucket = req.gfsBucket;
        const files = gfsBucket.find({ _id: consultation.kundaliFileId });
        const file = await files.next();
        
        if (file) {
          // Update metadata with consultation ID
          await gfsBucket.rename(consultation.kundaliFileId, file.filename, {
            metadata: {
              ...file.metadata,
              consultationId: consultation._id
            }
          });
        }
      } catch (error) {
        console.log('Could not update GridFS metadata:', error.message);
      }
    }

    const populatedConsultation = await Consultation.findById(consultation._id)
      .populate("categories", "name")
      .populate("clientId", "name email")
      .populate("createdBy", "name email"); // NEW: Populate creator info
    
    res.status(201).json(populatedConsultation);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

exports.getConsultations = async (req, res) => {
  try {
    const { 
      category, 
      dob, 
      name, 
      search, 
      status,
      page = 1, 
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    // NEW: Base query filters by authenticated user
    let query = {
      createdBy: req.user.id // Only get consultations created by this user
    };
    
    // Filter by category
    if (category) {
      query.categories = category;
    }
    
    // Filter by date of birth
    if (dob) {
      const searchDate = new Date(dob);
      const nextDay = new Date(searchDate);
      nextDay.setDate(searchDate.getDate() + 1);
      
      query.dateOfBirth = {
        $gte: searchDate,
        $lt: nextDay
      };
    }
    
    // Filter by name (exact match)
    if (name) {
      query.name = new RegExp(name, 'i'); // Case insensitive
    }
    
    // Text search across multiple fields
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { fatherName: new RegExp(search, 'i') },
        { motherName: new RegExp(search, 'i') },
        { phone: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { placeOfBirth: new RegExp(search, 'i') }
      ];
    }
    
    // Filter by status
    if (status) {
      query.status = status;
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    // Get consultations with pagination
    const consultations = await Consultation.find(query)
      .populate("categories", "name")
      .populate("clientId", "name email")
      .populate("createdBy", "name email") // NEW: Populate creator info
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count for pagination
    const totalConsultations = await Consultation.countDocuments(query);
    const totalPages = Math.ceil(totalConsultations / limit);
    
    // Add PDF availability info to each consultation
    const consultationsWithPDFInfo = consultations.map(consultation => ({
      ...consultation.toObject(),
      hasPDF: consultation.hasPDF,
      pdfInfo: consultation.getPDFInfo()
    }));
    
    res.json({
      data: consultationsWithPDFInfo,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalConsultations,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

exports.getConsultationById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const consultation = await Consultation.findById(id)
      .populate("categories", "name")
      .populate("clientId", "name email")
      .populate("createdBy", "name email"); // NEW: Populate creator info
    
    if (!consultation) {
      return res.status(404).json({ msg: "Consultation not found" });
    }
    
    // NEW: Check if user owns this consultation
    if (!consultation.isOwnedBy(req.user.id)) {
      return res.status(403).json({ msg: "Access denied. You can only view your own consultations." });
    }
    
    // Add PDF info to response
    const consultationWithPDFInfo = {
      ...consultation.toObject(),
      hasPDF: consultation.hasPDF,
      pdfInfo: consultation.getPDFInfo()
    };
    
    res.json(consultationWithPDFInfo);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

exports.updateConsultation = async (req, res) => {
  try {
    const { id } = req.params;
    
    const consultation = await Consultation.findById(id);
    if (!consultation) {
      return res.status(404).json({ msg: "Consultation not found" });
    }
    
    // NEW: Check if user owns this consultation
    if (!consultation.isOwnedBy(req.user.id)) {
      return res.status(403).json({ msg: "Access denied. You can only update your own consultations." });
    }
    
    const updatedConsultation = await Consultation.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    ).populate("categories", "name")
     .populate("clientId", "name email")
     .populate("createdBy", "name email"); // NEW: Populate creator info
    
    res.json(updatedConsultation);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

exports.deleteConsultation = async (req, res) => {
  try {
    const { id } = req.params;
    
    const consultation = await Consultation.findById(id);
    if (!consultation) {
      return res.status(404).json({ msg: "Consultation not found" });
    }
    
    // NEW: Check if user owns this consultation
    if (!consultation.isOwnedBy(req.user.id)) {
      return res.status(403).json({ msg: "Access denied. You can only delete your own consultations." });
    }
    
    // Delete PDF from GridFS if exists (this is also handled in the model's pre-middleware)
    if (consultation.kundaliFileId) {
      try {
        const gfsBucket = getGFSBucket();
        await gfsBucket.delete(consultation.kundaliFileId);
        console.log('PDF deleted from GridFS successfully');
      } catch (error) {
        console.log('PDF file not found in GridFS, continuing with consultation deletion...');
      }
    }
    
    await Consultation.findByIdAndDelete(id);
    res.json({ msg: "Consultation deleted successfully" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

exports.getConsultationsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // NEW: Check if user is trying to access their own consultations
    if (userId !== req.user.id) {
      return res.status(403).json({ msg: "Access denied. You can only view your own consultations." });
    }
    
    const consultations = await Consultation.find({ createdBy: userId }) // Changed from clientId to createdBy
      .populate("categories", "name")
      .populate("clientId", "name email")
      .populate("createdBy", "name email") // NEW: Populate creator info
      .sort({ createdAt: -1 });
    
    // Add PDF info to each consultation
    const consultationsWithPDFInfo = consultations.map(consultation => ({
      ...consultation.toObject(),
      hasPDF: consultation.hasPDF,
      pdfInfo: consultation.getPDFInfo()
    }));
    
    res.json(consultationsWithPDFInfo);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// NEW: Get current user's consultations (simplified endpoint)
exports.getMyConsultations = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      status,
      search
    } = req.query;
    
    let query = {
      createdBy: req.user.id
    };
    
    // Apply filters
    if (status) {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { fatherName: new RegExp(search, 'i') },
        { motherName: new RegExp(search, 'i') },
        { phone: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { placeOfBirth: new RegExp(search, 'i') }
      ];
    }
    
    const skip = (page - 1) * limit;
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    const consultations = await Consultation.find(query)
      .populate("categories", "name")
      .populate("clientId", "name email")
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));
    
    const totalConsultations = await Consultation.countDocuments(query);
    const totalPages = Math.ceil(totalConsultations / limit);
    
    const consultationsWithPDFInfo = consultations.map(consultation => ({
      ...consultation.toObject(),
      hasPDF: consultation.hasPDF,
      pdfInfo: consultation.getPDFInfo()
    }));
    
    res.json({
      data: consultationsWithPDFInfo,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalConsultations,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};