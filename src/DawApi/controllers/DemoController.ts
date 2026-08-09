import { Request, Response, Router } from 'express';
import { Logger } from '../logger';

export const SUCCESS_MSG = 'hello ';

/**
 * The two codes this API actually returns. A whole dependency for these was
 * more than they were worth; the sampler route already writes its statuses as
 * numeric literals.
 */
export const OK = 200;
export const BAD_REQUEST = 400;

export function sayHello(req: Request, res: Response) {
    try {
        const { name } = req.params;
        if (name === 'make_it_fail') {
            throw Error('User triggered failure');
        }
        Logger.Info(SUCCESS_MSG + name);
        return res.status(OK).json({
            message: SUCCESS_MSG + name,
        });
    } catch (err) {
        Logger.Err(err);
        return res.status(BAD_REQUEST).json({
            error: err instanceof Error ? err.message : String(err),
        });
    }
}

/** Mounted at /api/say-hello — was an @overnightjs @Controller decorator. */
export const demoRouter = Router();
demoRouter.get('/:name', sayHello);

export default demoRouter;
