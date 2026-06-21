import client from "../config/twilio.js";

const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

// SEND PHONE OTP
const sendPhoneOtp = async (phoneNumber) => {
  try {
    console.log(`Sending OTP to this number ${phoneNumber}.`);
    if (!phoneNumber) throw new Error("Phone Number is required.");
    return await client.verify.v2.services(serviceSid).verifications.create({
      to: phoneNumber,
      channel: "sms",
    });
  } catch (error) {
    console.error(`Error: ${error.message}`);
    return { status: "error", message: error.message };
  }
};

// VERIFY PHONE OTP
const verifyPhoneOtp = async (phoneNumber, otp) => {
  try {
    console.log(`Verify OTP to this number ${phoneNumber} : ${otp}`);
    return await client.verify.v2
      .services(serviceSid)
      .verificationChecks.create({
        to: phoneNumber,
        code: otp,
      });
  } catch (error) {
    console.error(`Error: ${error.message}`);
    return { status: "error", message: error.message };
  }
};

export { sendPhoneOtp, verifyPhoneOtp };
