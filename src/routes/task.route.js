import { Router } from "express";
import {
    listTasks,
    createTask,
    getTask,
    updateTask,
    deleteTask,
    createSubTask,
    updateSubTask,
    deleteSubTask,
} from "../controllers/task.controller.js";
import {
    createTaskRules,
    createSubTaskRules,
    updateTaskRules,
} from "../validators/validator.js";
import { validate } from "../middlewares/validator.middleware.js";
import {
    verifyJWT,
    roleBasedPermission,
} from "../middlewares/auth.middleware.js";
import {
    UserRolesEnum,
    AvailableUserRoles,
} from "../utils/constants.js";

const router = Router();
router.use(verifyJWT);

router
    .route("/:projectId")
    .get(roleBasedPermission(AvailableUserRoles), listTasks)
    .post(
        createTaskRules(),
        validate,
        roleBasedPermission([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]),
        createTask,
    );

router
    .route("/:projectId/tasks/:taskId")
    .get(roleBasedPermission(AvailableUserRoles), getTask)
    .put(
        updateTaskRules(),
        validate,
        roleBasedPermission([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]),
        updateTask,
    )
    .delete(
        roleBasedPermission([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]),
        deleteTask,
    );

router
    .route("/:projectId/tasks/:taskId/subtasks")
    .post(
        createSubTaskRules(),
        validate,
        roleBasedPermission([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]),
        createSubTask,
    );

router
    .route("/:projectId/subtasks/:subTaskId")
    .put(
        createSubTaskRules(),
        validate,
        roleBasedPermission(AvailableUserRoles),
        updateSubTask,
    )
    .delete(
        roleBasedPermission([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]),
        deleteSubTask,
    );

export default router;
