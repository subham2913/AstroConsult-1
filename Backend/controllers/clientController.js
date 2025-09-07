const Client = require("../models/Client");
const Consultation = require("../models/Consultation");

exports.addClient = async (req, res) => {
  try {
    console.log('Creating client with data:', req.body);
    
    const client = await Client.create({ 
      ...req.body, 
      createdBy: req.user.id 
    });
    
    res.status(201).json({ data: client }); // Add "data" wrapper
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({ 
      msg: error.message,
      details: error.errors || 'Unknown error'
    });
  }
};

exports.getClients = async (req, res) => {
  try {
    const { search, category, dob } = req.query;
    let query = { createdBy: req.user.id };

    if (search) query.name = { $regex: search, $options: "i" };
    if (dob) query.dob = dob;

    const clients = await Client.find(query).sort({ createdAt: -1 });
    res.json({ data: clients }); // Add "data" wrapper
  } catch (error) {
    console.error('Error getting clients:', error);
    res.status(500).json({ msg: error.message });
  }
};

exports.getClientById = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    const consultations = await Consultation.find({ clientId: req.params.id }).sort({ date: -1 });
    res.json({ client, consultations });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

exports.updateClient = async (req, res) => {
  try {
    const { id } = req.params;

    // Find and update client
    const client = await Client.findOneAndUpdate(
      { _id: id, createdBy: req.user.id }, // only allow updating own clients
      req.body,
      { new: true, runValidators: true }
    );

    if (!client) {
      return res.status(404).json({ msg: "Client not found or not authorized" });
    }

    res.json({ data: client });
  } catch (error) {
    console.error("Error updating client:", error);
    res.status(500).json({ msg: error.message });
  }
};
exports.deleteClient = async (req, res) => {
  try {
    const { id } = req.params;

    const client = await Client.findOneAndDelete({ _id: id, createdBy: req.user.id });

    if (!client) {
      return res.status(404).json({ msg: "Client not found or not authorized" });
    }

    res.json({ msg: "Client deleted successfully" });
  } catch (error) {
    console.error("Error deleting client:", error);
    res.status(500).json({ msg: error.message });
  }
};
