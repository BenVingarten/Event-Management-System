
export const handleGetUserInvites = async (req ,res) => {
    try {
        const { userEmail } = req;
        const userInvites = await getInvites(userEmail);
        return userInvites;
    } catch (err) {
        return res.status(err.statusCode).json({ err: err.message });
    }
};