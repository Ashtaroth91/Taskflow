import { Router } from "express";
import {
    getProjectbyId,
    createProject,
    listProject,
    updateProject,
    deleteProject,
    getProjectMembers,
    addProjectMembers,
    updateMemberRole,
    removeMember,
} from "../controllers/project.controller.js";
import {
    createProjectRules,
    addMembertoProjectRules,
} from "../validators/validator.js";
import { validate } from "../middlewares/validator.middleware.js";
import {
    verifyJWT,
    roleBasedPermission,
} from "../middlewares/auth.middleware.js";
import { UserRolesEnum, AvailableUserRoles } from "../utils/constants.js";

const router = Router();
router.use(verifyJWT);

router
    .route("/")
    .get(listProject)
    .post(createProjectRules(), validate, createProject);

router
    .route("/:projectId")
    .get(roleBasedPermission(AvailableUserRoles), getProjectbyId)
    .put(
        roleBasedPermission([UserRolesEnum.ADMIN]),
        createProjectRules(),
        validate,
        updateProject,
    )
    .delete(roleBasedPermission([UserRolesEnum.ADMIN]), deleteProject);

router
    .route("/:projectId/members")
    .get(roleBasedPermission(AvailableUserRoles), getProjectMembers)
    .post(
        roleBasedPermission([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]),
        addMembertoProjectRules(),
        validate,
        addProjectMembers,
    );

router
    .route("/:projectId/members/:userId")
    .put(roleBasedPermission([UserRolesEnum.ADMIN]), updateMemberRole)
    .delete(roleBasedPermission([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]), removeMember);

export default router;
