const messages = {
    ACCOUNT: {
        REGISTERED: {
            value: 'ACCOUNT.REGISTERED',
            message: "Your account is registered! Check your email for further instructions."
        },
        CREATED: "User registered successfully!",
        FINISH_REG: "You have to finish your registration first. Check your email for further instructions.",
        FORGOT_PASSWORD: "Check your email for further instructions.",
        ACTIVATED: "Your account has been activated!",
        ACTIVATE_ACC: "Your account has to be activated first.",
        NO_ACC: "No account found. Please register a new account!",
        ALREADY_ACTIVE: "Your account has been already activated.",
        NO_EXIST: "Sorry! Account doesn\'t exist.",
        ALREADY_DEACTIVE: "Account is already deactivated.",
        DEACTIVATED: "Your account has been deactivated.",
        DELETED: "Your account has been deleted.",
        ACT_MAIL: "Activation mail has been sent.",
    },
    PROJECT: {
        ACCESS: "You gave the user access to a project.",
        REMOVE_ACCESS: "You removed the user access to a project.",
        HAS_ACCESS: "User already has access to that project.",
        DELETED: "Project has been deleted successfully.",
        USER_ADDED: "User has been added to project",
        DOES_NOT_EXIST: "Project doesn\'t exist!",
        NO_EMPTY_NAME: "Project name cannot be empty.",
        ROLE_CHANGED: "You have changed role of this project member successfully.",
        MEMBER_DELETED: "Project member has been removed successfully.",
    },
    TASK: {
        DELETED: "Task has been deleted successfully.",
        ADDED: "You have successfully created new task.",
        NOT_FOUND: "Can\'t find the task",
    },
    WIDGETS: {
        NOT_DELETED: "Widget not deleted!",
        DELETED: "Task widget deleted!",
        NOT_UPDATED: "Task widget not updated!",
        NO_WIDGETS: "There is no widgets in this project.",
        NO_SUCH_WIDGET: "There is no such widget in this project.",
        WIDGET_DELETED: "Widget has been deleted successfully.",
    },
    USER: {
        DELETED: "User has been deleted successfully.",
        REMOVED_PROJECT:"You have been removed from selected project successfully.",
        DELETE_AVATAR: "You have deleted avatar succesfully.",
        AVATAR_NOT_UPLOADED: "Your avatar has not been uploaded due their size."
    },
    OTHER: {
        NO_CHANGES: "No new changes",
        PASSWORD_CHANGED: "Password successfully changed",
        DELETE_NOT_ALLOWED:"You are not allowed to delete someone else profile.",
        NOT_ALLOWED: "You don\'t have permission for that action.",
        CHANGE_NOT_ALLOWED: "You are not allowed to change other user profiles.",
        NOT_ALLOWED_USER: "You are not allowed to get other users.",
        SUCCESS: 'Success',
        DOES_NOT_EXIST: 'Doesn\'t exist.'
    },
    VALIDATION: {
        FILL_FIELDS: "Please fill in all fields.",
        EXISTS: "Sorry! Email already exists. Please use another one.",
        FOLDER_NAME_INC: "Name of folder is incorrect.",
        EMAIL_INC: "Sorry. You\'ve entered incorrect format of email address.",
        NOT_EMPTY: "Full name can\'t be empty",
        NO_MATCH: "Passwords don\'t match",
        PASSWORD_MISSING: "Password missing",
        WRONG_CREDENTIALS: "Wrong credentials!",
        DOES_NOT_EXIST: "Sorry. Email doesn\'t exist. Please register account.",
        TITLE_EMPTY: "Title cannot be empty. Please provide title.",
        INCORRECT_PASSWORD: "Password incorrect!",
    },
    
}
export default messages;