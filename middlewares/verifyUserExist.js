const {users} = require("../database/models")

const verifyUserExist = async(req, res, next) => {
    const {email} = await req.body

    if(!email) return res.json({success: false})

    const user = await users.findOne({where:{
        email: email,
    }})

    if(!user) return res.json({success: false})

    req.user = user

    next()
}

module.exports = verifyUserExist