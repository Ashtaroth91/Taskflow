import { User } from "../models/user.model.js";
import { Project } from "../models/project.model.js";
import { ProjectMember } from "../models/projectmember.model.js";
import { Task } from "../models/tasks.model.js";
import { SubTask } from "../models/subtask.model.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import {
    sendEmail,
    emailVerificationTemplate,
    forgotPasswordTemplate,
} from "../utils/mail.js";
import mongoose from "mongoose";
import { AvailableTaskStatus, TaskStatusEnum } from "../utils/constants.js";

const listTasks = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);
    if (!project) throw new ApiError(404, "Project not found");

    const tasks = await Task.find({ project: projectId })
        .populate("assignedTo", "username email")
        .populate("assignedBy", "username");

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                tasks,
                "All tasks related to project fetched successfully!!!",
            ),
        );
});

const createTask = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const { title, description, assignedTo } = req.body;

    const project = await Project.findById(projectId);
    if (!project) throw new ApiError(404, "Project not found");

    const member = await ProjectMember.findOne({
        user: assignedTo,
        project: projectId,
    });
    if (!member) {
        throw new ApiError(400, "User is not a member of this project");
    }

    const files = req.files || [];
    const attachments = files.map((file) => {
        return {
            url: `${process.env.SERVER_URL}/images/${file.filename}`,
            mimeType: file.mimetype,
            size: file.size,
        };
    });

    const task = await Task.create({
        title,
        description,
        project: projectId,
        assignedTo,
        assignedBy: req.user._id,
        attachments,
    });
    return res
        .status(201)
        .json(new ApiResponse(201, task, "Task created successfully!!!"));
});

const getTask = asyncHandler(async (req, res) => {
    const { projectId, taskId } = req.params;

    const task = await Task.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(taskId),
                project: new mongoose.Types.ObjectId(projectId),
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "assignedTo",
                foreignField: "_id",
                as: "assignedTo",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            username: 1,
                            fullName: 1,
                            avatar: 1,
                        },
                    },
                ],
            },
        },
        {
            $lookup: {
                from: "subtasks",
                localField: "_id",
                foreignField: "task",
                as: "subtasks",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "assignedBy",
                            foreignField: "_id",
                            as: "assignedBy",
                            pipeline: [
                                {
                                    $project: {
                                        _id: 1,
                                        username: 1,
                                        fullName: 1,
                                        avatar: 1,
                                    },
                                },
                            ],
                        },
                    },
                    {
                        $addFields: {
                            assignedBy: {
                                $arrayElemAt: ["$assignedBy", 0],
                            },
                        },
                    },
                ],
            },
        },
        {
            $addFields: {
                assignedTo: {
                    $arrayElemAt: ["$assignedTo", 0],
                },
            },
        },
    ]);

    if (!task || task.length === 0)
        throw new ApiError(404, "Task not found!!!");

    return res
        .status(200)
        .json(new ApiResponse(200, task[0], "Task fetched successfully!!!"));
});

const updateTask = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    const { projectId, taskId } = req.params;

    let updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;

    const task = await Task.findOneAndUpdate(
        {
            _id: taskId,
            project: projectId,
        },
        {
            $set: updateData,
        },
        {
            returnDocument: "after",
        },
    );

    if (!task) throw new ApiError(404, "Task Not found!!!");

    return res
        .status(200)
        .json(
            new ApiResponse(200, task, "Task details updated successfully!!!"),
        );
});

const deleteTask = asyncHandler(async (req, res) => {
    const { projectId, taskId } = req.params;

    const task = await Task.findOneAndDelete({
        _id: taskId,
        project: projectId,
    });
    if (!task) {
        throw new ApiError(404, "Task not found");
    }

    await SubTask.deleteMany({
        task: taskId,
    });

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Task deleted successfully!!!"));
});

const createSubTask = asyncHandler(async (req, res) => {
    const { projectId, taskId } = req.params;
    const { title } = req.body;

    const task = await Task.findOne({
        _id: taskId,
        project: projectId,
    });
    if (!task) throw new ApiError(404, "Task not found");

    const subTask = await SubTask.create({
        title,
        task: taskId,
        assignedBy: req.user._id,
        project: projectId,
    });

    return res
        .status(201)
        .json(new ApiResponse(201, subTask, "Subtask created successfully!!!"));
});

const updateSubTask = asyncHandler(async (req, res) => {
    const { title } = req.body;
    const { projectId, subTaskId } = req.params;

    const subTask = await SubTask.findOneAndUpdate(
        {
            _id: subTaskId,
            project: projectId,
        },
        {
            $set: { title },
        },
        {
            returnDocument: "after",
        },
    );

    if (!subTask) throw new ApiError(404, "SubTask Not found!!!");

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                subTask,
                "SubTask details updated successfully!!!",
            ),
        );
});

const deleteSubTask = asyncHandler(async (req, res) => {
    const { projectId, subTaskId } = req.params;

    const subTask = await SubTask.findOneAndDelete({
        _id: subTaskId,
        project: projectId,
    });
    
    if (!subTask) {
        throw new ApiError(404, "SubTask not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, null, "SubTask deleted successfully!!!"));
});

export {
    listTasks,
    createTask,
    getTask,
    updateTask,
    deleteTask,
    createSubTask,
    updateSubTask,
    deleteSubTask,
};
