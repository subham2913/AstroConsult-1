const mongoose = require("mongoose");

const consultationSchema = new mongoose.Schema(
  {
    // Personal Details (Required)
    name: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    timeOfBirth: { type: String, required: true }, // Format: "HH:MM"
    placeOfBirth: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String }, // Optional
    
    // Family Details (Optional)
    fatherName: { type: String },
    motherName: { type: String },
    grandfatherName: { type: String },
    
    // Address Details (Optional)
    address: { type: String },
    pincode: { type: String },
    
    // Consultation Details
    consultationDate: { type: Date, default: Date.now },
    
    // Astrological Data
    planetaryPositions: { type: String }, // JSON string or text
    prediction: { type: String },
    suggestions: { type: String },
    
    // File Upload - Enhanced with GridFS support
    kundaliPdfUrl: { type: String }, // Firebase Storage URL (keeping for backward compatibility)
    kundaliPdfName: { type: String }, // Original filename
    kundaliFileId: { type: mongoose.Schema.Types.ObjectId }, // GridFS file ID
    
    // Category Assignment
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
    
    // Legacy fields (keeping for backward compatibility)
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    date: { type: Date },
    notes: { type: String },
    
    // Status
    status: { 
      type: String, 
      enum: ['pending', 'in-progress', 'completed'], 
      default: 'pending' 
    }
  },
  { timestamps: true }
);

// Index for search functionality
consultationSchema.index({ name: 'text', fatherName: 'text', motherName: 'text' });
consultationSchema.index({ dateOfBirth: 1 });
consultationSchema.index({ consultationDate: 1 });
consultationSchema.index({ phone: 1 }); // Added for better search performance
consultationSchema.index({ status: 1 }); // Added for status filtering

// Virtual to check if PDF exists
consultationSchema.virtual('hasPDF').get(function() {
  return !!(this.kundaliFileId || this.kundaliPdfUrl);
});

// Method to get PDF info
consultationSchema.methods.getPDFInfo = function() {
  return {
    hasFile: !!(this.kundaliFileId || this.kundaliPdfUrl),
    fileName: this.kundaliPdfName,
    fileId: this.kundaliFileId,
    legacyUrl: this.kundaliPdfUrl
  };
};

// Pre-remove middleware to handle PDF cleanup
consultationSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  if (this.kundaliFileId) {
    try {
      const mongoose = require('mongoose');
      const { GridFSBucket } = require('mongodb');
      
      const gfsBucket = new GridFSBucket(mongoose.connection.db, {
        bucketName: 'kundaliPdfs'
      });
      
      await gfsBucket.delete(this.kundaliFileId);
      console.log('PDF deleted from GridFS in pre-remove middleware');
    } catch (error) {
      console.log('PDF not found in GridFS during pre-remove cleanup');
    }
  }
  next();
});

// Pre-findOneAndDelete middleware for PDF cleanup
consultationSchema.pre('findOneAndDelete', async function(next) {
  try {
    const doc = await this.model.findOne(this.getQuery());
    if (doc && doc.kundaliFileId) {
      try {
        const mongoose = require('mongoose');
        const { GridFSBucket } = require('mongodb');
        
        const gfsBucket = new GridFSBucket(mongoose.connection.db, {
          bucketName: 'kundaliPdfs'
        });
        
        await gfsBucket.delete(doc.kundaliFileId);
        console.log('PDF deleted from GridFS in pre-findOneAndDelete middleware');
      } catch (error) {
        console.log('PDF not found in GridFS during pre-findOneAndDelete cleanup');
      }
    }
  } catch (error) {
    console.error('Error in pre-findOneAndDelete middleware:', error);
  }
  next();
});

module.exports = mongoose.model("Consultation", consultationSchema);