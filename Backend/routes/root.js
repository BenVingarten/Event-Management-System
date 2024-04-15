import { Router } from 'express';

const router = Router();

router.get('/', (request, response) => {
    response.send({msg: "Hello welcome to the root page"});
});

export default router;