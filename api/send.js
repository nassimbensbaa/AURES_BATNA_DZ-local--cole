function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sheet1");
    const data = JSON.parse(e.postData.contents);
    const fullName = ((data.firstName || "") + " " + (data.lastName || "")).trim();
    const orderNumber = "CMD-" + (1000 + sheet.getLastRow());
    const phone = formatPhone(data.phone);

    let productsText = "";
    let total = 0;

    if (data.products && data.products.length) {
      for (let i = 0; i < data.products.length; i++) {
        const p = data.products[i];
        const subTotal = p.price * p.qty;
        total += subTotal;
        productsText += p.name + " : الكمية " + p.qty + " - " + formatPrice(p.price) + " × " + p.qty + " = " + formatPrice(subTotal) + " دج";
        if (i < data.products.length - 1) productsText += "\n";
      }
    }

    sheet.appendRow([
      orderNumber, new Date(), fullName, phone, data.address || "",
      data.shipping || 200, formatPrice(total), productsText
    ]);

    const row = sheet.getLastRow();
    const range = sheet.getRange(row, 7);
    range.setWrap(true);
    range.setVerticalAlignment("middle");
    range.setHorizontalAlignment("center");
    sheet.setRowHeight(row, 60);

    return ContentService.createTextOutput(JSON.stringify({
      ok: true,
      orderNumber: orderNumber
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      ok: false,
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ✅ دالة جلب المنتجات من ورقة STOCK
function doGet() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("STOCK");
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({
        error: "ورقة STOCK غير موجودة"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return ContentService.createTextOutput(JSON.stringify({
        products: []
      })).setMimeType(ContentService.MimeType.JSON);
    }

    const products = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const name = row[0];      // اسم المنتج
      const price = row[1];     // السعر
      const qty = row[2];       // الكمية المتاحة
      const image = row[3];     // رابط الصورة
      const oldPrice = row[4];  // السعر القديم (اختياري)

      // ✅ تخطي المنتجات المحذوفة أو التي ليس لها اسم
      if (!name || (qty !== undefined && qty === 0 && !name)) continue;

      products.push({
        name: String(name),
        price: Number(price) || 0,
        qty: Number(qty) || 0,
        image: image || "",
        oldPrice: oldPrice ? Number(oldPrice) : null
      });
    }

    return ContentService.createTextOutput(JSON.stringify({
      products: products
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ===== helpers =====
function formatPhone(phone) {
  phone = (phone || "").replace(/\D/g, "");
  if (phone.length === 10) {
    return phone.replace(/(\d{4})(\d{2})(\d{2})(\d{2})/, "$1 $2 $3 $4");
  }
  return phone;
}

function formatPrice(num) {
  num = Number(num || 0);
  return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}
