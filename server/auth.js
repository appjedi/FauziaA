
const jwt = require('jsonwebtoken');
const { dbAuth } = require("./dao/dao");
const refreshTokens = [];
function auth(refreshToken) {
    if (refreshToken == null) return { status: 401 }
    if (!refreshTokens.includes(refreshToken)) return { status: 403 }
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return { status: 403 }
        const accessToken = generateAccessToken({ name: user.name })
        return { status: 200, accessToken: accessToken }
    })
}

function logout(serverToken) {
    refreshTokens = refreshTokens.filter(token => token !== serverToken)
    return { status: 204 }
}

async function login(username, password) {
    // Authenticate User
    console.log("auth.login", username, password);
    const user = await dbAuth(username, password);
    console.log("after", user);
    if (user.status !== 1) {
        return [{ message: user.message, status: user.status, id: 0, level: 0 }];
    }
    console.log("process.env.REFRESH_TOKEN_SECRET", process.env.REFRESH_TOKEN_SECRET);
    const accessToken = generateAccessToken(user);
    const secret = process.env.REFRESH_TOKEN_SECRET;

    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET)
    refreshTokens.push(refreshToken)
    return [{ message: "auth", status: 1, id: 1, level: 1 }];
}

function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15s' })
}

module.exports = { auth, logout, login }