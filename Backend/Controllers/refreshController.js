import { assignNewAccessToken } from "../services/UserLogic.js";

export const handleRefresh = async (req, res) => {
  try {
    if (!req?.cookies?.jwt)
      return res.status(401).json({ err: "missing cookie" });

    const refreshToken = req.cookies.jwt;
    const accessToken = await assignNewAccessToken(refreshToken);
    
    return res.status(200).json({ accessToken });
  } catch (err) {
    return res.status(err.statusCode).json({ err: err.message });
  }
};
