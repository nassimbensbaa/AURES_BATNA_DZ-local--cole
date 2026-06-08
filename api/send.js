export default async function handler(req, res) {
  // إعدادات CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // معالجة طلب OPTIONS
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // ========================
  // ✅ جلب المنتجات من Google Sheets (GET)
  // ========================
  if (req.method === "GET" && req.url === "/api/products") {
    try {
      const GOOGLE_URL = process.env.GOOGLE_SCRIPT_URL;
      
      if (!GOOGLE_URL) {
        return res.status(500).json({ 
          error: "❌ لم يتم تعيين رابط Google Script في المتغيرات البيئية" 
        });
      }

      const response = await fetch(GOOGLE_URL);
      const data = await response.json();
      
      return res.status(200).json(data);
    } catch (err) {
      console.error("خطأ في جلب المنتجات:", err);
      return res.status(500).json({ 
        error: "❌ خطأ في الاتصال بـ Google Sheets: " + err.message 
      });
    }
  }

  // ========================
  // ✅ إرسال الطلب إلى Google Sheets (POST)
  // ========================
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const GOOGLE_URL = process.env.GOOGLE_SCRIPT_URL;
    
    if (!GOOGLE_URL) {
      return res.status(500).json({ 
        ok: false, 
        error: "❌ لم يتم تعيين رابط Google Script" 
      });
    }

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
      message: "تم إرسال الطلب بنجاح",
      google: text
    });

  } catch (err) {
    console.error("خطأ في إرسال الطلب:", err);
    return res.status(500).json({
      ok: false,
      error: err.message
    });
  }
}
