import axios from "axios";
export const sendForgotPassWordEmail = async (to, subject, html) => {
    return axios.post("https://api.brevo.com/v3/smtp/email", {
        sender: {
            name: "D-Chat",
            email: process.env.EMAIL_FROM,
        },
        to: [{ email: to }],
        subject,
        htmlContent: html,
    }, {
        headers: {
            "api-key": process.env.BREVO_API_KEY,
            "Content-Type": "application/json",
        },
        timeout: 10000,
    });
};
export const sendFreindRequestEmail = async (to, subject, html) => {
    try {
        const response = await axios.post("https://api.brevo.com/v3/smtp/email", {
            sender: {
                name: "D-Chat",
                email: process.env.EMAIL_FROM,
            },
            to: [
                {
                    email: to,
                },
            ],
            subject,
            htmlContent: html,
        }, {
            headers: {
                "api-key": process.env.BREVO_API_KEY,
                "Content-Type": "application/json",
            },
            timeout: 10000,
        });
        return response.data;
    }
    catch (error) {
        console.error("Friend request email error:", error.response?.data || error.message);
        throw new Error("Failed to send friend request email");
    }
};
