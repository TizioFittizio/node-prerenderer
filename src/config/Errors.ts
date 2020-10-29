export class NotInitializedError extends Error {

    public readonly status = 500;

}

export class MissingValueError extends Error {

    public readonly status = 400;

}

export class InvalidValueError extends Error {

    public readonly status = 400;

}

export class WrongCredentialsError extends Error {

    public readonly status = 401;

}

export class NotFoundError extends Error {

    public readonly status = 404;

}

export class InvalidOperationError extends Error {

    public readonly status = 400;

}

export class ForbiddenOperationError extends Error {

    public readonly status = 403;

}

export class RemoteOperationError extends Error {

    public readonly status = 500;

}