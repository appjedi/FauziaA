import mongoose from 'mongoose';
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
    id: String,
    amount: Number,
    status: Number,
    paid: String,
    posted: String
}, { collection: 'donations' });
const DonationData = mongoose.model('DonationData', donationSchema);

const updateUser = async (userId: string, password1: string, password2: string, lastName: string, firstName: string, email: string, roleId: number, status: number) => {
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
        console.log(resp);
        return user;
    } catch (e) {
        console.log(e);
        return { status: -1 };
    }
    return { status: -1 };;

}
const addDonation = async (userId: string, amount: number) => {
    try {
        const user = await getUserById(userId);
        const id = new Date().getTime();
        const donation = {
            id: id,
            userId: userId,
            amount: amount,
            status: 0,
            paid: null
        }
        console.log("donation:", donation)
        // user.donations.push({ id: id, amount: amount, status: 0, paid: "" });
        const resp = await DonationData.create(donation);
        console.log("addDonation.RESP:", resp);
        return id;
    } catch (e) {
        console.log(e);
        return -1;
    }
    return 1;
}
const getUsers = async (id: string) => {

    console.log("from dao: " + id);
    const data = await UserData.find({});
    console.log("found", data);
    const users = [];
    for (let u of data) {
        console.log("U:", u);
        const user = { userId: u._id, username: u.email, lastName: u.lastName, firstName: u.firstName, email: u.email, password: "******", roleId: 1, status: 1 }

        users.push(user);
    }

    console.log("USERS", users);
    return users;
}
const getUserById = async (id: string) => {
    console.log("ID: ", id)
    const user = await UserData.findById(id);
    console.log("DATA:", user);
    if (user) {
        return user;
    } else {
        null;
    }
}
const getUserByEmail = async (email: string) => {

    const data = await UserData.find({ email: email });
    if (data) {
        const u = data[0];
        const user = [{ userId: u._id, username: u.email, lastName: u.lastName, firstName: u.firstName, email: u.email, password: "******", roleId: 1, status: 1 }]
        return user;
    } else {
        const user = [{ userId: "NF", username: email, lastName: "", firstName: "", email: "", password: "", roleId: 0, status: 0 }]
    }
}
const dbAuth = async (username: string, password: string) => {
    const data = await UserData.find({ email: username });
    if (!data) {
        return { status: -1, message: "Not Found" }
    }
    if (data[0].password !== password) {
        return { status: -2, message: "Invalid password" }
    }
    const user = { name: data[0].email, status: 1, message: "Authenticated", userId: data[0]._id };
    console.log("dbAuth", user);
    return user;

}
export { updateUser, getUsers, dbAuth, addDonation, getUserByEmail };
