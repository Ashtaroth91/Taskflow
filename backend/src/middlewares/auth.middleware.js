import { ProjectMember } from "../models/projectmember.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, res, next) => {
    const token =
        req.cookies?.accessToken ||
        req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
        throw new ApiError(401, "Unauthorized request", []);
    }
    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decoded._id).select(
            "-password -refreshToken -emailVerificationToken -emailVerificationTokenExpiry",
        );
        if (!user) {
            throw new ApiError(401, "Token is invalid", []);
        }
        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, "Invalid access token", []);
    }
});

export const roleBasedPermission = (roles = []) => {
    return asyncHandler(async (req, res, next) => {
        const { projectId } = req.params;
        if (!projectId) throw new ApiError(400, "Project ID is required!!!");
        const projectMember = await ProjectMember.findOne({
            user: req.user?._id,
            project: projectId
        })
        if(!projectMember) throw new ApiError(403, "You are not a member of this project");

        const givenRole = projectMember?.role;
        req.projectMember = projectMember;
        if(!roles.includes(givenRole)) throw new ApiError(
            403,
            "You do not have permission to perform this action",
        );
        next();
    });
};
