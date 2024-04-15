import { Router } from "express";
const router = Router();

router.get('/', (req, res) => {
    res.send("Movie App Website!");
});

export default router;


