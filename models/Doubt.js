import mongoose from 'mongoose';

const DoubtSchema = new mongoose.Schema({
  resourceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resource' },
  askerId: { type: String, required: true },
  questionText: { type: String, required: true },
  status: { type: String, enum: ['open', 'resolved'], default: 'open' }
}, { timestamps: true });

export default mongoose.models.Doubt || mongoose.model('Doubt', DoubtSchema);
