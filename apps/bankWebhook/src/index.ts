import express from "express";
import db from "@repo/db/client";

const app = express();

app.post("/hdfcWebhook", async (req, res) => {
  const paymentInformation = {
    token: req.body.token,
    userId: req.body.userId,
    amount: req.body.amount,
  };

  try {
    await db.$transaction([
      db.balance.update({
        where: {
          userId: paymentInformation.userId,
        },
        data: {
          amount: {
            increment: paymentInformation.amount,
          },
        },
      }),

      db.onRampTransaction.update({
        where: {
          token: paymentInformation.token,
        },
        data: {
          status: "Success",
        },
      }),
    ]);

    res.status(200).json({
      msg: "captured",
    });
  } catch (error) {
    console.log(error);

    res.status(411).json({
      msg: "Error while processing webhook",
    });
  }
});
