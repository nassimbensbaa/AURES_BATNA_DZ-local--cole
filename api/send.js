function doPost(e) {
  try {

    const sheet = SpreadsheetApp
      .getActiveSpreadsheet()
      .getSheetByName("Sheet1");

    let data = {};

    // استقبال JSON من Vercel API
    if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    }

    const fullName = ((data.firstName || "") + " " + (data.lastName || "")).trim();

    // تحويل السلة إذا موجودة
    let productsText = "";

    if (Array.isArray(data.products)) {
      productsText = data.products.map(p =>
        `${p.name} x${p.qty} = ${(p.price * p.qty)} DA`
      ).join(" | ");
    } else {
      productsText = data.productName || "";
    }

    sheet.appendRow([
      new Date(),            // التاريخ
      fullName,              // الاسم الكامل
      data.phone || "",      // الهاتف
      data.address || "",    // العنوان
      data.shipping || 50,   // التوصيل
      data.total || 0,       // المجموع
      productsText          // المنتجات
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {

    return ContentService
      .createTextOutput(JSON.stringify({
        ok: false,
        error: err.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/* اختبار */
function doGet() {
  return ContentService.createTextOutput("OK WORKING ✔");
}
