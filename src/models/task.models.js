import mongoose, { Schema } from 'mongoose';
import { TaskStatusEnum, AvailableTaskStatus } from '../utils/constants.js';

const TaskSchema = new Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    status: { type: String, enum: AvailableTaskStatus, default: TaskStatusEnum.TODO },
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    assignedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    attachments: {type: [{ url: String, mimetype: String,size: Number }], default: []}, // Array of file paths or URLs
    
}, { timestamps: true });

export const Task = mongoose.model('Task', TaskSchema);

