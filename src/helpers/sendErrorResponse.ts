/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Response } from 'express';

export const sendErrorResponse = (err: Error, res: Response) => {
    // eslint-disable-next-line no-extra-parens
    const status = (err as any).status || 400;
    res.status(status).send(err.message);
};