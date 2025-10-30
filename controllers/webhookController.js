import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

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

export const handleWebhookEvent = async (req, res) => {
  if (!verifyRequestSignature(req)) {
    console.warn("Invalid signature on incoming webhook");
    return res.sendStatus(401);
  }

  const body = req.body;
  res.sendStatus(200); // Always respond 200 fast

  try {
    if (body.object === "whatsapp_business_account") {
      body.entry?.forEach((entry) => {
        entry.changes?.forEach((change) => {
          const value = change.value;
          const field = change.field;

          if (value?.messages) {
            value.messages.forEach((message) => {
              const from = message.from;
              const msgBody = message.text?.body;
              console.log("📩 Incoming message:", msgBody, "from:", from);
            });
          }

          if (value?.statuses) {
            value.statuses.forEach((status) => {
              console.log("📬 Message status update:", status.status);
            });
          }

          if (field === "message_template_status_update") {
            console.log("📄 Template update:", value);
          }
        });
      });
    }
  } catch (err) {
    console.error("Error processing webhook:", err);
  }
};
