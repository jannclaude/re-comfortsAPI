const jwt = require('jsonwebtoken');
const secret = "ComfortAPI";


module.exports.createAccessToken = (user) => {
	const data = {
		id: user._id,
		email: user.email,
		isAdmin: user.isAdmin,
		isUser: user.isUser
	};

	return jwt.sign(data, secret, {});
};


module.exports.verify = (req, res, next) => {
	console.log(req.headers.authorization);
	let token = req.headers.authorization;

	if(typeof token == 'undefined'){
		return res.send({ auth: "Failed. No Token!" });
	} else {
		token = token.slice(7, token.length);

		jwt.verify(token, secret, function(err, decodedToken){
			if(err){
				return res.send({
					auth: "Failed",
					message: err.message
				});
			} else {
				console.log(decodedToken);
				req.user = decodedToken
				next()
			}
		})
	}
}


module.exports.verifyAdmin = (req, res, next) => {
	if(req.user.isAdmin){
		next()
	} else {
		return res.send({
			auth: "Failed",
			message: "Action Forbidden!"
		})
	}
}

module.exports.verifyUser = (req, res, next) => {
	if(req.user.isUser){
		next()
	} else {
		return res.send({
			auth: "Failed",
			message: "Action Forbidden!"
		})
	}
}