export default async function handler(req, res) {

  // ===== CORS =====
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "POST only" });
  }

  try {

    const URL = process.env.SCRIT;

    if (!URL || !URL.includes("script.google.com")) {
      console.error("❌ Invalid SCRIT:", URL);
      return res.status(500).json({
        ok: false,
        error: "SCRIT is missing or invalid"
      });
    }

    const body = req.body || {};

    // ===== دعم السلة كاملة =====
    const cart = Array.isArray(body.products) ? body.products : [];

    const payload = {
      firstName: body.firstName || "",
      lastName: body.lastName || "",
      phone: body.phone || "",
      address: body.address || "",

      // السلة كاملة بدل منتج واحد
      products: cart.map(p => ({
        name: p.name || "",
        price: Number(p.price) || 0,
        qty: Number(p.qty) || 1,
        subtotal: (Number(p.price) || 0) * (Number(p.qty) || 1)
      })),

      shipping: Number(body.shipping) || 200,
      total: Number(body.total) || 0,

      createdAt: new Date().toISOString()
    };

    console.log("📤 Sending payload:", payload);

    const response = await fetch(URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const text = await response.text();

    console.log("📥 Google response:", text);

    let result;
    try {
      result = JSON.parse(text);
    } catch {
      result = { ok: false, error: "Invalid JSON from Google Script", raw: text };
    }

    if (result.ok === true) {
      return res.status(200).json({
        ok: true,
        message: "تم إرسال الطلب بنجاح",
        data: result
      });
    }

    return res.status(500).json({
      ok: false,
      error: result.error || "Google Script error",
      data: result
    });

  } catch (err) {
    console.error("❌ Server error:", err);

    return res.status(500).json({
      ok: false,
      error: err.message || "Server error"
    });
  }
}
