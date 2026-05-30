import { User } from "../models/user.models.js";
import { Project } from "../models/project.models.js";
import { projectMember } from "../models/projectMember.models.js";
import { ApiResponse } from "../utils/api-Response.utils.js";
import { ApiError } from "../utils/api-Error.utils.js";
import { asyncHandler } from "../utils/async-Handler.utils.js";
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
    //test
});

const updateProject = asyncHandler(async (req, res, next) => {
    //test
});

const deleteProject = asyncHandler(async (req, res, next) => {
    //test
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
