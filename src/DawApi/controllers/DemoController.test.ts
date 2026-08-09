import { sayHello, SUCCESS_MSG } from './DemoController';

// Asserted as literals on purpose: importing the controller's own OK/BAD_REQUEST
// would make these pass whatever those constants happened to be set to.

function mockRes() {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
}

describe('DemoController', () => {
    it('returns a greeting for a valid name', () => {
        const req: any = { params: { name: 'world' } };
        const res = mockRes();

        sayHello(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: SUCCESS_MSG + 'world' });
    });

    it('returns an error when the name triggers a failure', () => {
        const req: any = { params: { name: 'make_it_fail' } };
        const res = mockRes();

        sayHello(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });
});
