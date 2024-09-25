const adminAuth = (req,res,next)=>{
    const user=req.user;
    if(!user) return res.status(401).json({ message: 'User Data Not Found' });
    else if(user.role!=='Admin') return res.status(401).json({ message: "User isn't a Admin" });

    next();
}

export default adminAuth