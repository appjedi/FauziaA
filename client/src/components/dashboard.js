import React, { useState, useEffect } from "react";

const Dashboard = ({ token }) => {
    const [amount, setAmount] = useState(0);
    const [profile, setProfile] = useState({ lastName: "", firstName: "" });
    const [donations, setDonations] = useState([]);
    useEffect(() => {
        getProfile();
        getDonations();
    }, []);
    const amountHandler = (e) => {
        setAmount(e.target.value);
        console.log("setAmount", e.target.value);
    };

    const getProfile = async () => {
        console.log("TOKEN", token);
        const q = "query {profile }";
        const response = await fetch('http://localhost:3000/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-access-token': `${token}`
            },
            body: JSON.stringify({
                query: q,
            }),
        });
        const responseText = await response.text();
        console.log("responseText", responseText);
        const responseData = JSON.parse(responseText);
        //donations = JSON.parse(responseData.data)
        const profile = JSON.parse(responseData.data.profile);
        console.log("responseData", profile)
        setProfile(profile);
    }
    const getDonations = async () => {
        const q = "query {donations }";
        console.log("getTodos.TOKEN:", q);
        const response = await fetch('http://localhost:3000/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-access-token': `${token}`
            },
            body: JSON.stringify({
                query: q,
            }),
        });
        const responseText = await response.text();
        console.log("responseText", responseText);
        const responseData = JSON.parse(responseText);
        const donations = JSON.parse(responseData.data.donations)
        console.log("responseData", donations)
        setDonations(donations);
    }
    const donate = async () => {

        //const amount = prompt("Amount: ");
        const q = `mutation{
                donate(amount: ${amount})
            }`
        console.log("Q:", q)
        const response = await fetch('http://localhost:3000/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-access-token': `${token}`
            },
            body: JSON.stringify({
                query: q,
            }),
        });
        const responseText = await response.text();
        console.log("responseText", responseText);
        const url = responseText.split("url:")[1].split('"}}')[0];
        const responseData = JSON.parse(responseText);
        window.open(url);
        // const s = JSON.parse(responseData.data.donate);
        console.log("responseData", url, responseData.data.donate)
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
            <p><button onClick={donate}>Donate</button></p>
            <p>
                {donations ? listDonations : ""
                }
            </p>
        </div>)
}
export default Dashboard;