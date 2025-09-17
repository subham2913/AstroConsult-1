const mongoose = require("mongoose");

const consultationHistorySchema = new mongoose.Schema(
  {
    // Reference to the main consultation
    consultationId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Consultation", 
      required: true 
    },
    
    // Consultation session details
    consultationDate: { 
      type: Date, 
      required: true,
      default: Date.now 
    },
    
    // Astrological data for this session
    planetaryPositions: { 
      type: String, 
      required: true 
    },
    
    prediction: { 
      type: String, 
      required: true 
    },
    
    suggestions: { 
      type: String, 
      required: true 
    },
    
    // Additional session info
    sessionNotes: { 
      type: String 
    },
    
    // Status of this consultation session
    status: { 
      type: String, 
      enum: ['completed', 'in-progress', 'scheduled'], 
      default: 'completed' 
    },
    
    // Who conducted this consultation (optional)
    consultedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" 
    }
  },
  { 
    timestamps: true 
  }
);

// Index for faster queries
consultationHistorySchema.index({ consultationId: 1, consultationDate: -1 });
consultationHistorySchema.index({ consultationDate: -1 });

module.exports = mongoose.model("ConsultationHistory", consultationHistorySchema);