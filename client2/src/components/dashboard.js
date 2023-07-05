import React, { useState, useEffect } from "react";
import { getProfile, donate, getDonations, nicedate } from '../services/server';

const Dashboard = ({ token }) => {
    const [amount, setAmount] = useState(0);
    const [profile, setProfile] = useState({ lastName: "", firstName: "" });
    const [donations, setDonations] = useState([]);
    useEffect(() => {
        init();
    }, []);
    const init = async () => {
        const profile = await getProfile();
        setProfile(profile);

        const donations = await getDonations();
        setDonations(donations);
    }

    const amountHandler = (e) => {
        setAmount(e.target.value);
        console.log("setAmount", e.target.value);
    };

    const donateHandler= async () => {
        //const amount = prompt("Amount: ");
        const url = await donate(amount);
        window.open(url);
        // const s = JSON.parse(responseData.data.donate);
    }

    const donationsList = donations.map((row) =>
        <tr key={row.id}>
            <td>${row.amount}</td><td>{nicedate(row.id)}</td>
        </tr>
    );
    
    return (
        <div>
            <h1>Welcome {profile.firstName}</h1>
            <p><input type="text" name="amount" id="amount" value={amount} onChange={amountHandler} placeholder="donation amount" /></p>
            <p><button onClick={donateHandler}>Donate</button></p>
            <p>
                {donations ? <table border='1'><tr><th>Amount</th><th>Date</th></tr>{donationsList}</table> : ""
                }
            </p>
        </div>
    )
}
export default Dashboard;