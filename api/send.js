export default async function handler(req, res) {

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if(req.method === "OPTIONS") return res.status(200).end();
  if(req.method !== "POST") return res.status(405).json({ok:false});

  try {

    // 🔐 الرابط مخفي داخل ENV
    const GOOGLE_URL = process.env.GOOGLE_SCRIPT_URL;

    const body = req.body;

    const payload = {
      firstName: body.firstName,
      lastName: body.lastName,
      phone: body.phone,
      address: body.address,
      shipping: body.shipping,
      total: body.total,
      products: body.products
    };

    const response = await fetch(GOOGLE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const text = await response.text();

    return res.status(200).json({
      ok: true,
      message: "sent",
      google: text
    });

  } catch(err){
    return res.status(500).json({
      ok: false,
      error: err.message
    });
  }
}
