const mongoose = require('mongoose');

const saveSchema = new mongoose.Schema({
  promptId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prompt',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

saveSchema.index({ promptId: 1, userId: 1 }, { unique: true });
saveSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Save', saveSchema);
