import mongoose from 'mongoose';

const AIAssistantSchema = new mongoose.Schema({
    webhookUrl: {
        type: String,
        required: true,
        trim: true
    },
    title: {
        type: String,
        default: 'Loga AI Assistant'
    },
    welcomeMessage: {
        type: String,
        default: 'Hello! How can I help you today?'
    },
    primaryColor: {
        type: String,
        default: '#32127a'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    position: {
        type: String,
        enum: ['bottom-right', 'bottom-left'],
        default: 'bottom-right'
    },
    buttonIcon: {
        type: String,
        default: 'bot' // bot, message, spark
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

export default mongoose.models.AIAssistant || mongoose.model('AIAssistant', AIAssistantSchema);
