const { loadMockData } = require('../utils/dataLoader');

// Get blockchain transactions
const getTransactions = async (req, res) => {
  try {
    const data = await loadMockData();
    const { walletAddress, limit = 20 } = req.query;
    
    let transactions = data.transactions || [];
    
    if (walletAddress) {
      const addressLower = walletAddress.toLowerCase();
      transactions = transactions.filter(t =>
        t.from.toLowerCase().includes(addressLower) ||
        t.to.toLowerCase().includes(addressLower)
      );
    }
    
    transactions = transactions.slice(0, parseInt(limit));
    
    res.json({ transactions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Verify wallet signature
const verifySignature = async (req, res) => {
  try {
    const { message, signature, address } = req.body;
    
    if (!message || !signature || !address) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // In a real application, you would verify the signature using ethers.js
    // For this assessment, we'll simulate verification
    const isValid = signature && signature.length > 0;
    
    res.json({ 
      valid: isValid,
      address,
      message: 'Signature verified successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getTransactions,
  verifySignature
};


