import { User } from "../models/user.models.js";
import { Project } from "../models/project.models.js";
import { projectMember } from "../models/projectMember.models.js";
import { ApiResponse } from "../utils/api-Response.utils.js";
import { ApiError } from "../utils/api-Error.utils.js";
import { asyncHandler } from "../utils/async-Handler.utils.js";
import mongoose from "mongoose";
// import { emailverificationMailgenContent, forgotPasswordMailgenContent, sendEmail } from "../utils/mail.utils.js";
// import jwt from "jsonwebtoken";
// import crypto from "crypto";

const getProjects = asyncHandler(async (req, res, next) => {
    //test
});

const getProjectById = asyncHandler(async (req, res, next) => {
    //test
});

const createProject = asyncHandler(async (req, res, next) => {
    const { name, description } = req.body;

    const project = await Project.create({
        name,
        description,
        createdBy: new mongoose.Types.ObjectId(req.user._id) 
    });
    await projectMember.create({
        project: new mongoose.Types.ObjectId(project._id),
        user: new mongoose.Types.ObjectId(req.user._id),
        role: UserRolesEnum.ADMIN
    });
    return res.status(201).json(new ApiResponse(201, project, "Project created successfully"));
});

const updateProject = asyncHandler(async (req, res, next) => {
    const { name, description } = req.body;
    const {projectId} = req.params;
    const project = await Project.findByIdAndUpdate(projectId, { name, description }, { new: true });
    if (!project) {
        throw new ApiError(404, "Project not found");
    }
    return res.status(200).json(new ApiResponse(200, project, "Project updated successfully"));
});

const deleteProject = asyncHandler(async (req, res, next) => {
    const {projectId} = req.params;
    const project = await Project.findByIdAndDelete(projectId);
    if (!project) {
        throw new ApiError(404, "Project not found");
    }
    return res.status(200).json(new ApiResponse(200, null, "Project deleted successfully"));
});

const addMemberToProject = asyncHandler(async (req, res, next) => {
    //test
});

const getProjectMembers = asyncHandler(async (req, res, next) => {
    //test
});

const updateMemberRole = asyncHandler(async (req, res, next) => {
    //test
});

const deleteMember = asyncHandler(async (req, res, next) => {
    //test
});

export { getProjects, getProjectById, createProject, updateProject, deleteProject, addMemberToProject, deleteMember, getProjectMembers, updateMemberRole };
