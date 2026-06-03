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

    // ⚠️ مهم: تحويل cart إلى productName مثل كودك القديم
    let productName = "";

    if (Array.isArray(body.products)) {
      productName = body.products
        .map(p => `${p.name} x${p.qty}`)
        .join(" | ");
    }

    const payload = {
      firstName: body.firstName || "",
      lastName: body.lastName || "",
      phone: body.phone || "",
      address: body.address || "",
      shipping: 200,
      total: body.total || 0,
      productName: productName
    };

    const response = await fetch(URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const text = await response.text();

    return res.status(200).json({
      ok: true,
      google_response: text
    });

  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: err.message
    });
  }
}
