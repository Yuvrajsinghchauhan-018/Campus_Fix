const checkApproved = (req, res, next) => {
  if (req.user && req.user.role === 'maintainer') {
    if (req.user.approvalStatus !== 'approved') {
      return res.status(403).json({ 
        success: false, 
        error: 'Your account is pending approval or rejected. Contact administration.' 
      });
    }
  }
  next();
};

module.exports = { checkApproved };
