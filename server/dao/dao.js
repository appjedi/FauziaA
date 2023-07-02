var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/FauziaA');
var Schema = mongoose.Schema;

var userDataSchema = new Schema({
    email: { type: String, required: true },
    password: String,
    lastName: String,
    firstName: String,
    status: Number,
    roleid: Number,
    donations: []
}, { collection: 'users' });
var UserData = mongoose.model('UserData', userDataSchema);
const donationSchema = new Schema({
    userId: String,
    amount: Number,
    status: Number,
    paid: String
})
const DonationData = mongoose.model('DonationData', donationSchema);

const updateUser = async (userId, password1, password2, lastName, firstName, email, roleId, status) => {
    try {
        const user = {
            email: email,
            password: password1,
            lastName: lastName,
            firstName: firstName,
            roleId: roleId,
            status: status
        }
        console.log("Update User:", user)
        const resp = await UserData.create(user);
    } catch (e) {
        console.log(e);
        return -1;
    }
    return 1;

}
const addDonation = async (userId, amount) => {
    try {
        const donation = {
            userId: userId,
            amount: amount,
            status: 0,
            paid: null
        }
        console.log("donation:", donation)
        const resp = await DonationData.create(donation);
    } catch (e) {
        console.log(e);
        return -1;
    }
    return 1;
}
const getUsers = async (id) => {

    console.log("from dao: " + id);
    const data = await UserData.find({});
    console.log("found", data);
    const users = [];
    for (let u of data) {
        console.log("U:", u);
        const user = { userId: u._id, username: u.email, lastName: u.fullname, firstName: u.fullname, email: u.email, password: "******", roleId: 1, status: 1 }

        users.push(user);
    }

    console.log("USERS", users);
    return users;
}
const getUserById = async (id) => {
    console.log("ID: ", id)
    const u = await UserData.findById(id);
    console.log("DATA:", u);
    if (u) {
        console.log("USER", u)
        const user = [{ userId: u._id, username: u.email, lastName: u.fullname, firstName: u.fullname, email: u.email, password: "******", roleId: 1, status: 1 }]
        return user;
    } else {
        const user = [{ userId: "NF", username: email, lastName: "", firstName: "", email: "", password: "", roleId: 0, status: 0 }]
    }
}
const getUserByEmail = async (email) => {

    const data = await UserData.find({ email: email });
    if (data) {
        const u = data[0];
        const user = [{ userId: u._id, username: u.email, lastName: u.fullname, firstName: u.fullname, email: u.email, password: "******", roleId: 1, status: 1 }]
        return user;
    } else {
        const user = [{ userId: "NF", username: email, lastName: "", firstName: "", email: "", password: "", roleId: 0, status: 0 }]
    }
}
const dbAuth = async (username, password) => {
    const data = await UserData.find({ email: username });
    if (!data) {
        return { status: -1, message: "Not Found" }
    }
    if (data[0].password !== password) {
        return { status: -2, message: "Invalid password" }
    }
    const user = { name: data[0].email, status: 1, message: "Authenticated" };
    console.log("dbAuth", user);
    return user;

}
module.exports = { updateUser, getUsers, dbAuth, addDonation, getUserByEmail }