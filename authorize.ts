import jwt from "jsonwebtoken"
import context from "./Entites/AppDbContext"
import { User } from "./Entites/User";

const authorize = async (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Bearer <token>

  if (!token)
    return res.status(401).json({ message: 'Unauthorized' });

  try {
    // Verify the JWT token
    const decoded = jwt.verify(token, 'fantastic-and-cool-key');
    const repoUser = context.getRepository(User)
    const user = await repoUser.findOneBy({id: decoded.id})
    const isBlocked = user?.isBlocked ?? true
    if(isBlocked)
      return res.status(401).json({ message: 'Unauthorized' });
    // If everything is fine, proceed to the next middleware or endpoint handler
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};


const checkAdmin = async (req, res, next) => {
  const repoUser = context.getRepository(User)
  const user = await repoUser.findOneBy({id: req.user.id})
  if(!user.isAdmin) return res.status(401).send();
  next()
}

export {checkAdmin}
export default authorize;