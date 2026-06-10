import { Note } from "../models/notes.model.js";
import { Project } from "../models/project.model.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";

const listNotes = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);
    if (!project) throw new ApiError(404, "Project not found");

    const notes = await Note.find({ project: projectId })
        .populate("createdBy", "username email avatar");

    return res
        .status(200)
        .json(new ApiResponse(200, notes, "Notes fetched successfully!!!"));
});

const createNote = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const { content } = req.body;

    const project = await Project.findById(projectId);
    if (!project) throw new ApiError(404, "Project not found");

    const note = await Note.create({
        content,
        project: projectId,
        createdBy: req.user._id,
    });

    return res
        .status(201)
        .json(new ApiResponse(201, note, "Note created successfully!!!"));
});

const getNote = asyncHandler(async (req, res) => {
    const { projectId, noteId } = req.params;

    const note = await Note.findOne({
        _id: noteId,
        project: projectId,
    }).populate("createdBy", "username email avatar");

    if (!note) throw new ApiError(404, "Note not found!!!");

    return res
        .status(200)
        .json(new ApiResponse(200, note, "Note fetched successfully!!!"));
});

const updateNote = asyncHandler(async (req, res) => {
    const { content } = req.body;
    const { projectId, noteId } = req.params;

    const note = await Note.findOneAndUpdate(
        {
            _id: noteId,
            project: projectId,
        },
        {
            $set: { content },
        },
        {
            returnDocument: "after",
        }
    );

    if (!note) throw new ApiError(404, "Note not found!!!");

    return res
        .status(200)
        .json(new ApiResponse(200, note, "Note updated successfully!!!"));
});

const deleteNote = asyncHandler(async (req, res) => {
    const { projectId, noteId } = req.params;

    const note = await Note.findOneAndDelete({
        _id: noteId,
        project: projectId,
    });

    if (!note) throw new ApiError(404, "Note not found!!!");

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Note deleted successfully!!!"));
});

export {
    listNotes,
    createNote,
    getNote,
    updateNote,
    deleteNote,
};
