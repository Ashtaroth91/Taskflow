import { User } from "../models/user.model.js";
import { Project } from "../models/project.model.js";
import { ProjectMember } from "../models/projectmember.model.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import {
    sendEmail,
    emailVerificationTemplate,
    forgotPasswordTemplate,
} from "../utils/mail.js";
import mongoose from "mongoose";
import { AvailableUserRoles, UserRolesEnum } from "../utils/constants.js";

const getProjectbyId = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);
    if (!project) throw new ApiError(404, "Project not found!!!");
    return res
        .status(200)
        .json(new ApiResponse(200, project, "Project fetched successfully!!!"));
});

const createProject = asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    const project = await Project.create({
        name,
        description,
        createdBy: req.user?._id,
    });

    await ProjectMember.create({
        user: req.user?._id,
        project: project._id,
        role: UserRolesEnum.ADMIN,
    });
    return res
        .status(201)
        .json(new ApiResponse(201, project, "Project created successfully"));
});

const listProject = asyncHandler(async (req, res) => {
    const projects = await ProjectMember.aggregate([
        {
            $match: {
                user: req.user._id,
            },
        },
        {
            $lookup: {
                from: "projects",
                localField: "project",
                foreignField: "_id",
                as: "projects",
                pipeline: [
                    {
                        $lookup: {
                            from: "projectmembers",
                            localField: "_id",
                            foreignField: "project",
                            as: "projectmembers",
                        },
                    },
                    {
                        $addFields: {
                            members: {
                                $size: "$projectmembers",
                            },
                        },
                    },
                ],
            },
        },
        {
            $unwind: "$projects",
        },
        {
            $project: {
                project: {
                    _id: 1,
                    name: 1,
                    description: 1,
                    members: 1,
                    createdAt: 1,
                    createdBy: 1,
                },
                role: 1,
                _id: 0,
            },
        },
    ]);

    return res
        .status(200)
        .json(
            new ApiResponse(200, projects, "Projects fetched successfully!!!"),
        );
});

const updateProject = asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    const { projectId } = req.params;
    let updateData = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    const project = await Project.findByIdAndUpdate(
        projectId,
        {
            $set: updateData,
        },
        {
            returnDocument: "after",
        },
    );
    if (!project) throw new ApiError(404, "Project Not found!!!");
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                project,
                "Project details updated successfully!!!",
            ),
        );
});

const deleteProject = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);

    if (!project) throw new ApiError(404, "Project Not found!!!");

    await Project.findByIdAndDelete(projectId);

    await ProjectMember.deleteMany({
        project: projectId,
    });

    await Task.deleteMany({
        project: projectId,
    });

    await Note.deleteMany({
        project: projectId,
    });

    await SubTask.deleteMany({
        project: projectId,
    });

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Project deleted successfully!!!"));
});

const getProjectMembers = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);

    if (!project) throw new ApiError(404, "Project not found!!!");

    const members = await ProjectMember.find({
        project: projectId,
    }).populate("user", "username email avatar");

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                members,
                "Project members fetched successfully",
            ),
        );
});

const addProjectMembers = asyncHandler(async (req, res) => {
    const { email, role } = req.body;
    const { projectId } = req.params;

    const user = await User.findOne({ email });
    const project = await Project.findById(projectId);

    if (!user) throw new ApiError(404, "User not found!!!");
    if (!project) throw new ApiError(404, "Project not found!!!");

    const existingMember = await ProjectMember.findOne({
        user: user._id,
        project: projectId,
    });
    if (existingMember) {
        throw new ApiError(409, "User is already a member of this project");
    }

    const member = await ProjectMember.create({
        user: user._id,
        project: projectId,
        role,
    });
    await sendEmail({
        mail: user?.email,
        subject: `Added to ${project.name}`,
        mailgenContent: projectInvitationTemplate(
            user.username,
            project.name,
            role,
            `${req.protocol}://${req.get("host")}/api/v1/projects/${project._id}`,
        ),
    });
    return res
        .status(201)
        .json(new ApiResponse(201, member, "Member added successfully"));
});

const updateMemberRole = asyncHandler(async (req, res) => {
    const { newRole } = req.body;
    const { projectId, userId } = req.params;

    if(!AvailableUserRoles.includes(newRole)) throw new ApiError(400, "Invalid Role!!!");

    const member = await ProjectMember.findOne({
        user: userId,
        project: projectId,
    });

    if(!member) throw new ApiError(404, "Member not found!!!");
    if (member.role === newRole) throw new ApiError(400, "User already has this role");

    member.role = newRole;
    await member.save();

    return res
        .status(200)
        .json(new ApiResponse(200, member, "Role updated succesfully!!!"));
});

const removeMember = asyncHandler(async (req, res) => {
    const { projectId, userId } = req.params;

    const member = await ProjectMember.findOne({
        user: userId,
        project: projectId,
    });

    if (!member) throw new ApiError(404, "Member not found!!!");

    const projectMember = await ProjectMember.findByIdAndDelete(member._id);

    if (!projectMember) throw new ApiError(404, "Project Member not found!!!");

    return res
        .status(200)
        .json(new ApiResponse(200, member, "Member removed successfully!!!"));
});

export {
    getProjectbyId,
    createProject,
    listProject,
    updateProject,
    deleteProject,
    getProjectMembers,
    addProjectMembers,
    updateMemberRole,
    removeMember,
};
