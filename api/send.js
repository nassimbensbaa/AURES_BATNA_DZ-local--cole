export default async function handler(req, res) {

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false });
  }

  try {

    const URL = process.env.SCRIT;

    const body = req.body || {};

    // 🔥 تأكد من البيانات قبل الإرسال
    console.log("BODY FROM FRONT:", body);

    const payload = {
      firstName: body.firstName || "",
      lastName: body.lastName || "",
      phone: body.phone || "",
      address: body.address || "",
      shipping: body.shipping || 200,
      total: body.total || 0,
      products: body.products || [],
      productName: body.productName || ""
    };

    const response = await fetch(URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const text = await response.text();

    console.log("GOOGLE RESPONSE:", text);

    return res.status(200).json({
      ok: true,
      google: text
    });

  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: err.message
    });
  }
}
