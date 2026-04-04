export class AppError extends Error {
    constructor(message: string, public status: number) {
        super(message);
    }
}
export class NotFoundError extends AppError {
    constructor(message = 'Not found') {
        super(message, 404);
    }
}
export class ForbiddenError extends AppError {
    constructor(message = 'Forbidden') {
        super(message, 403);
    }
}