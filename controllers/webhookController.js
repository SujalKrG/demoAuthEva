
import crypto from "crypto";
import fetch  from "node-fetch";
import dotenv from "dotenv";
dotenv.config();


console.log(process.env.WABA_APP_SECRET);
console.log(process.env.WABA_VERIFY_TOKEN);
console.log(process.env.WABA_ACCESS_TOKEN);
console.log(process.env.WABA_PHONE_NUMBER_ID);



export const getVerificationEndPoint = (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token) {
    if (mode === "subscribe" && token === process.env.WABA_VERIFY_TOKEN) {
      console.log("WEBHOOK_VERIFIED");
      return res.status(200).send(challenge);
    } else {
      return res.sendStatus(403);
    }
  }
  res.sendStatus(400);
};
function verifyRequestSignature(req) {
  const signature = req.get("x-hub-signature-256") || "";
  if (!signature || !req.rawBody) return false;

  const expectedSig =
    "sha256=" +
    crypto
      .createHmac("sha256", process.env.WABA_APP_SECRET)
      .update(req.rawBody)
      .digest("hex");
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSig)
  );
}

export const receiveWebhook = async (req, res) => {
  if (!verifyRequestSignature(req)) {
    console.warn("Invalid signature on incoming webhook");
    return res.sendStatus(401);
  }

  const body = req.body;

  // Always respond 200 quickly to acknowledge receipt
  res.sendStatus(200);

  // Process incoming message(s) asynchronously
  try {
    if (body.object === "whatsapp_business_account") {
      body.entry?.forEach((entry) => {
        const changes = entry.changes || [];
        changes.forEach((change) => {
          const value = change.value || {};
          // Example: incoming messages
          if (value.messages) {
            value.messages.forEach((message) => {
              console.log("Incoming message:", message);
            });
          }

          // message status updates
          if (value.statuses) {
            value.statuses.forEach((status) => {
              console.log("Message status update:", status);
              // update DB status
            });
          }

          // template status updates
          if (change.field === "message_template_status_update") {
            console.log("Template status change:", value);
          }
        });
      });
    } else {
      console.log("Ignored webhook object:", body.object);
    }
  } catch (err) {
    console.error("Error processing webhook:", err);
  }
};
