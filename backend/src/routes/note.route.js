import { Router } from "express";
import {
    listNotes,
    createNote,
    getNote,
    updateNote,
    deleteNote,
} from "../controllers/note.controller.js";
import { createNoteRules } from "../validators/validator.js";
import { validate } from "../middlewares/validator.middleware.js";
import {
    verifyJWT,
    roleBasedPermission,
} from "../middlewares/auth.middleware.js";
import { UserRolesEnum, AvailableUserRoles } from "../utils/constants.js";

const router = Router();
router.use(verifyJWT);

router
    .route("/:projectId")
    .get(roleBasedPermission(AvailableUserRoles), listNotes)
    .post(
        roleBasedPermission([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]),
        createNoteRules(),
        validate,
        createNote,
    );

router
    .route("/:projectId/notes/:noteId")
    .get(roleBasedPermission(AvailableUserRoles), getNote)
    .put(
        roleBasedPermission([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]),
        createNoteRules(),
        validate,
        updateNote,
    )
    .delete(
        roleBasedPermission([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]),
        deleteNote,
    );

export default router;
