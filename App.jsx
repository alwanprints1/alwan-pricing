import React, { useState } from "react";

// ==========================================
// 1. البيانات الأساسية وأسعار الخامات
// ==========================================
const INITIAL_PRICES = {
  paperTypes: [
    { id: "couche_150", name: "كوشيه 150 جرام", pricePerSheet: 2.5 },
    { id: "couche_300", name: "كوشيه 300 جرام", pricePerSheet: 4.5 },
    { id: "bond_80", name: "ورق بوند 80 جرام", pricePerSheet: 1.2 },
    { id: "duplex_350", name: "دوبلكس 350 جرام", pricePerSheet: 5.0 },
    { id: "sticker_paper", name: "ستيكر ورقي", pricePerSheet: 3.5 },
    { id: "flex_banner", name: "فلكس / بنر (للمتر المربع)", pricePerSheet: 80.0 },
  ],
  finishingOptions: [
    { id: "lamination_matt", name: "سلفان مط (للوجه)", unitPrice: 0.5 },
    { id: "lamination_gloss", name: "سلفان لامع (للوجه)", unitPrice: 0.4 },
    { id: "die_cutting", name: "قص / بيمة (تكسير)", unitPrice: 0.2 },
    { id: "spot_uv", name: "يو في موضع (Spot UV)", unitPrice: 1.5 },
    { id: "foil_stamp", name: "بصمة (ذهبي/فضي)", unitPrice: 2.0 },
    { id: "folding", name: "طبق / طوي", unitPrice: 0.1 },
  ],
  printCostPerImpression: 0.15,
  setupCost: 50.0,
};

export default function App() {
  const [jobTitle, setJobTitle] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [productType, setProductType] = useState("كروت شخصية / بروشور");
  const [width, setWidth] = useState(10);
  const [height, setHeight] = useState(15);
  const [quantity, setQuantity] = useState(1000);
  const [selectedPaper, setSelectedPaper] = useState("couche_300");
  const [selectedFinishings, setSelectedFinishings] = useState([]);
  const [profitMargin, setProfitMargin] = useState(35);
  const [notes, setNotes] = useState("");

  const [basePrices, setBasePrices] = useState(INITIAL_PRICES);
  const [activeTab, setActiveTab] = useState("calculator");
  const [savedOrders, setSavedOrders] = useState([]);

  const calculatePricing = () => {
    const areaSqMeters = (width * height) / 10000;
    const paperObj = basePrices.paperTypes.find((p) => p.id === selectedPaper);
    const paperUnitPrice = paperObj ? paperObj.pricePerSheet : 2.0;

    const itemsPerSheet = Math.max(1, Math.floor(0.35 / (areaSqMeters || 0.01)));
    const totalSheetsNeeded = Math.ceil(quantity / itemsPerSheet);
    const totalPaperCost = totalSheetsNeeded * paperUnitPrice;

    const totalPrintCost = basePrices.setupCost + quantity * basePrices.printCostPerImpression;

    let totalFinishingCost = 0;
    selectedFinishings.forEach((finishId) => {
      const finishObj = basePrices.finishingOptions.find((f) => f.id === finishId);
      if (finishObj) {
        totalFinishingCost += quantity * finishObj.unitPrice;
      }
    });

    const directCost = totalPaperCost + totalPrintCost + totalFinishingCost;
    const profitAmount = directCost * (profitMargin / 100);
    const totalPrice = directCost + profitAmount;
    const unitPrice = quantity > 0 ? totalPrice / quantity : 0;

    return {
      totalPaperCost: Math.round(totalPaperCost),
      totalPrintCost: Math.round(totalPrintCost),
      totalFinishingCost: Math.round(totalFinishingCost),
      directCost: Math.round(directCost),
      profitAmount: Math.round(profitAmount),
      totalPrice: Math.round(totalPrice),
      unitPrice: unitPrice.toFixed(2),
    };
  };

  const results = calculatePricing();

  const toggleFinishing = (id) => {
    if (selectedFinishings.includes(id)) {
      setSelectedFinishings(selectedFinishings.filter((item) => item !== id));
    } else {
      setSelectedFinishings([...selectedFinishings, id]);
    }
  };

  const sendQuoteViaWhatsApp = () => {
    if (!customerPhone) {
      alert("برجاء إدخال رقم واتساب العميل أولاً!");
      return;
    }

    let formattedPhone = customerPhone.replace(/\D/g, "");
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "20" + formattedPhone.substring(1);
    }

    const paperName = basePrices.paperTypes.find((p) => p.id === selectedPaper)?.name;
    const finishingsList = selectedFinishings
      .map((fId) => basePrices.finishingOptions.find((f) => f.id === fId)?.name)
      .join(" - ") || "بدون تشطيب إضافي";

    const message = 
`مرحباً أ/ *${customerName || "العميل العزيز"}* 🌺
تحية طيبة من *مطبعة ألوان* 🎨

تفاصيل عرض السعر الخاص بطلبكم:
----------------------------------
📄 *الطلب:* ${jobTitle || productType}
📐 *المقاس:* ${width} × ${height} سم
🔢 *الكمية:* ${quantity} قطعة
نوع الخامة:* ${paperName}
✨ *التشطيب:* ${finishingsList}
----------------------------------
💰 *إجمالي السعر:* *${results.totalPrice} جنيه*
سعر القطعة:* ${results.unitPrice} جنيه

نشرف بخدمتكم دائماً! لأي استفسار أو لتأكيد الطلب يرجى الرد على هذه الرسالة.`;

    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleConvertToProduction = () => {
    if (!jobTitle || !customerName) {
      alert("برجاء إدخال اسم العميل وعنوان الطلب أولاً!");
      return;
    }

    const newOrder = {
      id: "ORD-" + Math.floor(100000 + Math.random() * 900000),
      date: new Date().toLocaleDateString("ar-EG"),
      customerName,
      customerPhone,
      jobTitle,
      productType,
      dimensions: `${width}×${height} سم`,
      quantity,
      paper: basePrices.paperTypes.find((p) => p.id === selectedPaper)?.name,
      finishings: selectedFinishings.map(
        (fId) => basePrices.finishingOptions.find((f) => f.id === fId)?.name
      ),
      costDetails: results,
      status: "قيد الانتظار (جديد)",
      notes,
    };

    setSavedOrders([newOrder, ...savedOrders]);
    alert(`تم تحويل الطلب رقم (${newOrder.id}) إلى سيستم الإنتاج بنجاح!`);
  };

  return (
    <div dir="rtl" className="min-h-screen bg-slate-100 font-sans p-4 md:p-8 text-slate-800">
      <header className="max-w-6xl mx-auto bg-white rounded-2xl shadow-sm p-5 mb-6 flex flex-wrap justify-between items-center border border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
            أ
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">حاسبة تسعير مطبعة ألوان</h1>
            <p className="text-xs text-slate-500">السيستم الداخلي للتسعير والواتساب وأوامر الشغل</p>
          </div>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl gap-1 mt-3 sm:mt-0">
          <button
            onClick={() => setActiveTab("calculator")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === "calculator" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            حاسبة التسعير
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
              activeTab === "orders" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            أوامر الإنتاج
            {savedOrders.length > 0 && (
              <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                {savedOrders.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === "settings" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            إعدادات التكاليف
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto">
        {activeTab === "calculator" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
                بيانات مواصفات الطلب والعميل
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">اسم العميل</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="مثال: أستاذ أحمد"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">رقم الواتساب</label>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="01012345678"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">اسم/وصف الشغلانة</label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="مثال: بروشور A4"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">نوع المنتج</label>
                  <select
                    value={productType}
                    onChange={(e) => setProductType(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-blue-500"
                  >
                    <option>كروت شخصية / بروشور</option>
                    <option>علب ومغلفات</option>
                    <option>كتالوجات وكتب</option>
                    <option>ستيكر وملصقات</option>
                    <option>بنر وفلكس أووت دور</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">المقاس (سم)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={width}
                      onChange={(e) => setWidth(Number(e.target.value))}
                      placeholder="عرض"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-center"
                    />
                    <span className="text-slate-400">×</span>
                    <input
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(Number(e.target.value))}
                      placeholder="طول"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-center"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">الكمية المطلوبة</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">خامة الورق / المادة</label>
                <select
                  value={selectedPaper}
                  onChange={(e) => setSelectedPaper(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-blue-500"
                >
                  {basePrices.paperTypes.map((paper) => (
                    <option key={paper.id} value={paper.id}>
                      {paper.name} ({paper.pricePerSheet} ج.م / الفرخ)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">خيارات التشطيب والتجهيز</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {basePrices.finishingOptions.map((finish) => (
                    <button
                      key={finish.id}
                      type="button"
                      onClick={() => toggleFinishing(finish.id)}
                      className={`p-2.5 rounded-lg border text-xs font-medium transition text-right flex justify-between items-center ${
                        selectedFinishings.includes(finish.id)
                          ? "bg-blue-50 border-blue-500 text-blue-700"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <span>{finish.name}</span>
                      {selectedFinishings.includes(finish.id) && <span>✓</span>}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">ملاحظات التشغيل والإنتاج</label>
                <textarea
                  rows="2"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="ملاحظات التسليم أو الألوان..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-blue-500"
                ></textarea>
              </div>
            </div>

            <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-md flex flex-col justify-between space-y-6">
              <div>
                <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-4">
                  <h3 className="text-lg font-bold">ملخص التسعير</h3>
                  <span className="text-xs bg-blue-500/20 text-blue-300 px-2.5 py-1 rounded-full border border-blue-500/30">
                    داخلي
                  </span>
                </div>

                <div className="space-y-3 text-sm text-slate-300">
                  <div className="flex justify-between">
                    <span>تكلفة الخامة/الورق:</span>
                    <span className="font-mono text-white">{results.totalPaperCost} ج.م</span>
                  </div>
                  <div className="flex justify-between">
                    <span>تكلفة الطباعة والزنكات:</span>
                    <span className="font-mono text-white">{results.totalPrintCost} ج.م</span>
                  </div>
                  <div className="flex justify-between">
                    <span>تكلفة التشطيبات:</span>
                    <span className="font-mono text-white">{results.totalFinishingCost} ج.م</span>
                  </div>
                  <div className="pt-2 border-t border-slate-800 flex justify-between font-semibold text-slate-200">
                    <span>إجمالي التكلفة المباشرة:</span>
                    <span className="font-mono">{results.directCost} ج.م</span>
                  </div>
                </div>

                <div className="mt-6 p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
                  <div className="flex justify-between text-xs font-semibold mb-2">
                    <span>هامش الربح المطلوب:</span>
                    <span className="text-blue-400 font-bold">{profitMargin}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={profitMargin}
                    onChange={(e) => setProfitMargin(Number(e.target.value))}
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>ربح: {results.profitAmount} ج.م</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800 space-y-3">
                  <div className="bg-blue-600 p-4 rounded-xl text-center">
                    <span className="block text-xs text-blue-100">السعر النهائي للعميل</span>
                    <span className="text-3xl font-black font-mono tracking-tight">{results.totalPrice}</span>
                    <span className="text-xs text-blue-200 mr-1">جنيه مصري</span>
                  </div>

                  <div className="bg-slate-800 p-3 rounded-xl text-center flex justify-between items-center px-4">
                    <span className="text-xs text-slate-400">سعر القطعة الواحدة:</span>
                    <span className="text-sm font-bold font-mono text-blue-300">{results.unitPrice} ج.م</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-4">
                <button
                  onClick={sendQuoteViaWhatsApp}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl transition shadow-lg text-sm flex items-center justify-center gap-2"
                >
                  <span>💬 إرسال عرض السعر للعميل (واتساب)</span>
                </button>

                <button
                  onClick={handleConvertToProduction}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition text-xs"
                >
                  ⚡ تحويل لـ أمر إنتاج (ورشة)
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "orders" && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-4 border-b pb-3">سجل أوامر الإنتاج الجارية</h2>
            {savedOrders.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <p>لا توجد أوامر إنتاج محولة حتى الآن.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-sm">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b">
                    <tr>
                      <th className="p-3">رقم الطلب</th>
                      <th className="p-3">العميل</th>
                      <th className="p-3">اسم الشغلانة</th>
                      <th className="p-3">المقاس والكمية</th>
                      <th className="p-3">السعر الإجمالي</th>
                      <th className="p-3">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {savedOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-50">
                        <td className="p-3 font-mono font-bold text-blue-600">{order.id}</td>
                        <td className="p-3">
                          <div>{order.customerName}
