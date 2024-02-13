import express from "express";

const frontendRouter = express.Router();

frontendRouter.get("/web-servers/:serverName", async (req, res) => {});

export default frontendRouter;
