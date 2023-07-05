import React, { useState, useEffect } from "react";
import { getProfile,donate, getDonations } from './server';

const Dashboard = ({ token }) => {
    const [amount, setAmount] = useState(0);
    const [profile, setProfile] = useState({ lastName: "", firstName: "" });
    const [donations, setDonations] = useState([]);
    useEffect(() => {
        init();
    }, []);
    const amountHandler = (e) => {
        setAmount(e.target.value);
        console.log("setAmount", e.target.value);
    };
    const init = async () => {
        const profile = await getProfile();
        setProfile(profile);

        const donations = await getDonations();
        setDonations(donations);
    }
    
    const Donate_Click = async () => {

        //const amount = prompt("Amount: ");
        const url = await donate(amount);
        window.open(url);
        // const s = JSON.parse(responseData.data.donate);
        console.log("responseData", url)
    }

    const listDonations = donations.map((row) =>
        <li key={row.id}>
            ${row.amount} on {nicedate(row.id)}
        </li>
    );
    function nicedate(id) {
        const dt = new Date(parseInt(id));
        return dt.toUTCString()
    }
    return (
        <div>
            <h1>Welcome {profile.firstName}</h1>
            <p><input type="text" name="amount" id="amount" value={amount} onChange={amountHandler} placeholder="donation amount" /></p>
            <p><button onClick={Donate_Click}>Donate</button></p>
            <p>
                {donations ? listDonations : ""
                }
            </p>
        </div>)
}
export default Dashboard;