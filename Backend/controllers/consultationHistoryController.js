const ConsultationHistory = require("../models/ConsultationHistory");
const Consultation = require("../models/Consultation");

// Add new consultation history entry
exports.addConsultationHistory = async (req, res) => {
  try {
    const { consultationId } = req.params;
    const { consultationDate, planetaryPositions, prediction, suggestions, sessionNotes, status } = req.body;

    // Validate required fields
    if (!consultationDate || !planetaryPositions || !prediction || !suggestions) {
      return res.status(400).json({ 
        msg: "Missing required fields: consultationDate, planetaryPositions, prediction, suggestions" 
      });
    }

    // Verify that the consultation exists and user owns it
    const consultation = await Consultation.findById(consultationId);
    if (!consultation) {
      return res.status(404).json({ msg: "Consultation not found" });
    }

    // NEW: Check if user owns this consultation
    if (!consultation.isOwnedBy(req.user.id)) {
      return res.status(403).json({ msg: "Access denied. You can only add history to your own consultations." });
    }

    // Create new consultation history entry
    const historyEntry = await ConsultationHistory.create({
      consultationId,
      consultationDate,
      planetaryPositions,
      prediction,
      suggestions,
      sessionNotes: sessionNotes || '',
      status: status || 'completed',
      consultedBy: req.user?.id // Track who conducted the consultation
    });

    // Populate the created entry before returning
    const populatedEntry = await ConsultationHistory.findById(historyEntry._id)
      .populate('consultedBy', 'name email');

    res.status(201).json({
      msg: "Consultation history added successfully",
      data: populatedEntry
    });
  } catch (error) {
    console.error('Error adding consultation history:', error);
    res.status(500).json({ msg: error.message });
  }
};

// Get consultation history for a specific consultation
exports.getConsultationHistory = async (req, res) => {
  try {
    const { consultationId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Verify consultation exists and user owns it
    const consultation = await Consultation.findById(consultationId);
    if (!consultation) {
      return res.status(404).json({ msg: "Consultation not found" });
    }

    // NEW: Check if user owns this consultation
    if (!consultation.isOwnedBy(req.user.id)) {
      return res.status(403).json({ msg: "Access denied. You can only view history of your own consultations." });
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get history entries with pagination
    const historyEntries = await ConsultationHistory.find({ consultationId })
      .populate('consultedBy', 'name email')
      .sort({ consultationDate: -1 }) // Most recent first
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const totalEntries = await ConsultationHistory.countDocuments({ consultationId });
    const totalPages = Math.ceil(totalEntries / limit);

    res.json({
      data: historyEntries,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalEntries,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching consultation history:', error);
    res.status(500).json({ msg: error.message });
  }
};

// Get specific consultation history entry
exports.getConsultationHistoryById = async (req, res) => {
  try {
    const { historyId } = req.params;

    const historyEntry = await ConsultationHistory.findById(historyId)
      .populate('consultationId', 'name phone dateOfBirth createdBy')
      .populate('consultedBy', 'name email');

    if (!historyEntry) {
      return res.status(404).json({ msg: "Consultation history entry not found" });
    }

    // NEW: Check if user owns the consultation this history belongs to
    if (!historyEntry.consultationId.createdBy.equals(req.user.id)) {
      return res.status(403).json({ msg: "Access denied. You can only view history of your own consultations." });
    }

    res.json(historyEntry);
  } catch (error) {
    console.error('Error fetching consultation history entry:', error);
    res.status(500).json({ msg: error.message });
  }
};

// Update consultation history entry
exports.updateConsultationHistory = async (req, res) => {
  try {
    const { historyId } = req.params;

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ msg: "Request body is missing or empty" });
    }

    const {
      consultationDate,
      planetaryPositions,
      prediction,
      suggestions,
      sessionNotes,
      status,
    } = req.body;

    // Find the entry
    const historyEntry = await ConsultationHistory.findById(historyId).populate(
      "consultationId",
      "createdBy"
    );

    if (!historyEntry) {
      return res
        .status(404)
        .json({ msg: "Consultation history entry not found" });
    }

    // Authorization check
    if (!historyEntry.consultationId.createdBy.equals(req.user.id)) {
      return res.status(403).json({
        msg: "Access denied. You can only update history of your own consultations.",
      });
    }

    // Update fields (only those provided in req.body)
    const updatedEntry = await ConsultationHistory.findByIdAndUpdate(
      historyId,
      {
        ...(consultationDate && { consultationDate }),
        ...(planetaryPositions && { planetaryPositions }),
        ...(prediction && { prediction }),
        ...(suggestions && { suggestions }),
        ...(sessionNotes && { sessionNotes }),
        ...(status && { status }),
      },
      { new: true, runValidators: true }
    ).populate("consultedBy", "name email");

    res.json({
      msg: "Consultation history updated successfully",
      data: updatedEntry,
    });
  } catch (error) {
    console.error("Error updating consultation history:", error);
    res.status(500).json({ msg: error.message });
  }
};

// Delete consultation history entry
exports.deleteConsultationHistory = async (req, res) => {
  try {
    const { historyId } = req.params;

    const historyEntry = await ConsultationHistory.findById(historyId)
      .populate('consultationId', 'createdBy');
      
    if (!historyEntry) {
      return res.status(404).json({ msg: "Consultation history entry not found" });
    }

    // NEW: Check if user owns the consultation this history belongs to
    if (!historyEntry.consultationId.createdBy.equals(req.user.id)) {
      return res.status(403).json({ msg: "Access denied. You can only delete history of your own consultations." });
    }

    await ConsultationHistory.findByIdAndDelete(historyId);

    res.json({ msg: "Consultation history entry deleted successfully" });
  } catch (error) {
    console.error('Error deleting consultation history:', error);
    res.status(500).json({ msg: error.message });
  }
};

// NEW: Get all consultation history entries for current user
exports.getMyConsultationHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10, consultationId } = req.query;

    // Build query - get all consultations owned by user
    const consultationQuery = { createdBy: req.user.id };
    if (consultationId) {
      consultationQuery._id = consultationId;
    }

    const consultations = await Consultation.find(consultationQuery).select('_id');
    const consultationIds = consultations.map(c => c._id);

    // Get history entries for user's consultations
    const skip = (page - 1) * limit;
    const historyEntries = await ConsultationHistory.find({ 
      consultationId: { $in: consultationIds } 
    })
      .populate('consultationId', 'name phone dateOfBirth')
      .populate('consultedBy', 'name email')
      .sort({ consultationDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalEntries = await ConsultationHistory.countDocuments({ 
      consultationId: { $in: consultationIds } 
    });
    const totalPages = Math.ceil(totalEntries / limit);

    res.json({
      data: historyEntries,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalEntries,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching user consultation history:', error);
    res.status(500).json({ msg: error.message });
  }
};