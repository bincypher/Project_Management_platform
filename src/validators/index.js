import { body } from 'express-validator';

const userRegisterValidator = () => {
    return [
        body('username').trim().notEmpty().withMessage('Username is required').isLowercase().withMessage('Username must be in lowercase').isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
        
        body('email').trim().isEmail().withMessage('Email is not valid').notEmpty().withMessage('Email is required'),
        
        body('password').trim().notEmpty().withMessage('Password is required').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),

        body("fullname").optional().trim()
    ];
 }

const userloginValidator = () => {
    return [
        body('email').optional().trim().isEmail().withMessage('Email is not valid'),

        body('username').optional().trim().isLowercase().withMessage('Username must be in lowercase'),

        body('password').trim().notEmpty().withMessage('Password is required')
        ];
};

const userChangeCurrentPasswordValidator = () => {
    return [
        body('currentPassword').trim().notEmpty().withMessage('Current password is required').isLength({ min: 6 }).withMessage('Current password must be at least 6 characters long'),
        body('newPassword').trim().notEmpty().withMessage('New password is required').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long')
    ];
};

const userForgotPasswordRequestValidator = () => {
    return [
        body('email').trim().isEmail().withMessage('Email is not valid').notEmpty().withMessage('Email is required')
    ];
};

const userResetForgotPasswordValidator = () => {
    return [
        body('newPassword').trim().notEmpty().withMessage('New password is required').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long')
    ];
}

export {
    userRegisterValidator,
    userloginValidator,
    userChangeCurrentPasswordValidator,
    userForgotPasswordRequestValidator,
    userResetForgotPasswordValidator
}
