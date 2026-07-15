import { OK, BAD_REQUEST } from 'http-status-codes';
import { DemoController } from './DemoController';

function mockRes() {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
}

describe('DemoController', () => {
    it('returns a greeting for a valid name', () => {
        const controller = new DemoController();
        const req: any = { params: { name: 'world' } };
        const res = mockRes();

        (controller as any).sayHello(req, res);

        expect(res.status).toHaveBeenCalledWith(OK);
        expect(res.json).toHaveBeenCalledWith({ message: DemoController.SUCCESS_MSG + 'world' });
    });

    it('returns an error when the name triggers a failure', () => {
        const controller = new DemoController();
        const req: any = { params: { name: 'make_it_fail' } };
        const res = mockRes();

        (controller as any).sayHello(req, res);

        expect(res.status).toHaveBeenCalledWith(BAD_REQUEST);
    });
});
