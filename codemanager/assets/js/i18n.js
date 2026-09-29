const translations = {
  en: {
    workspace:"WORKSPACE", allItems:"All items",
    workspaceSubtitle:"Organize reusable code and projects locally.",
    newFolder:"New Folder", newCode:"New Code",
    searchPlaceholder:"Search codes, folders, languages...",
    filter:"Filter", sort:"Sort", newest:"Newest", oldest:"Oldest", az:"A-Z", za:"Z-A", lines:"lines", folder:"Folder", copy:"Copy", selectAll:"Select all", clearAll:"Clear all", download:"Download", backupRecursive:"Selecting a folder includes all nested folders and codes.", selectSomething:"Select at least one item.", backupSuccess:"Backup downloaded.", tabHint:"Tab = 4 spaces", codeLabel:"Code",
    backup:"Backup", import:"Import", select:"Select", selected:"selected", selectVisible:"Select visible", clearSelection:"Clear selection", deleteSelected:"Delete selected", moveSelected:"Move selected", moveTo:"Move to", move:"Move", home:"Home", bulkDeleteConfirm:"Delete selected items? Folders include all nested items.",
    totalCodes:"Total Codes", folders:"Folders", languages:"Languages",
    empty:"Nothing here yet", emptyFolder:"This folder is empty",
    createFolder:"Create Folder", editFolder:"Edit Folder",
    createCode:"Create Code", editCode:"Edit Code",
    title:"Title", description:"Description", language:"Language", code:"Code",
    cancel:"Cancel", save:"Save", create:"Create", close:"Close",
    rename:"Rename", renamed:"Renamed.", renamePrompt:"Enter a new name:", moved:"Item moved.", moveInvalid:"This move is not allowed.", storageUnavailable:"Local storage is unavailable. Changes could not be saved.", backupLanguages:"Select by language", noLanguages:"No languages yet.", view:"View", edit:"Edit", delete:"Delete",
    requiredTitle:"Title is required.", requiredLanguage:"Language is required.",
    folderCreated:"Folder created.", folderUpdated:"Folder updated.",
    codeCreated:"Code created.", codeUpdated:"Code updated.",
    deleted:"Item deleted.", deleteConfirm:"Delete this item? This action cannot be undone.",
    noResults:"No matching results.", items:"items", root:"Home",
    copied:"Code copied!", copy:"Copy", clipboardFailed:"Clipboard is unavailable.", invalidData:"Invalid data.",
    importSuccess:"Backup imported successfully.", importFailed:"Import failed.",
    replacePrompt:"Existing data was found. Replace it with this backup?"
  },
  fa: {
    workspace:"محیط کار", allItems:"همه موارد",
    workspaceSubtitle:"کدها و پروژه‌های قابل استفاده مجدد را به‌صورت محلی مدیریت کنید.",
    newFolder:"پوشه جدید", newCode:"کد جدید",
    searchPlaceholder:"جستجوی کد، پوشه، زبان...",
    filter:"فیلتر", sort:"مرتب‌سازی", newest:"جدیدترین", oldest:"قدیمی‌ترین", az:"الف-ی", za:"ی-الف", lines:"خط", folder:"پوشه", copy:"کپی", selectAll:"انتخاب همه", clearAll:"پاک کردن انتخاب", download:"دانلود", backupRecursive:"با انتخاب پوشه، همه پوشه‌ها و کدهای تو در تو هم در پشتیبان قرار می‌گیرند.", selectSomething:"حداقل یک مورد را انتخاب کنید.", backupSuccess:"پشتیبان دانلود شد.", tabHint:"Tab = چهار فاصله", codeLabel:"کد",
    backup:"پشتیبانگیری", import:"بازیابی", select:"انتخاب", selected:"انتخاب‌شده", selectVisible:"انتخاب موارد قابل مشاهده", clearSelection:"پاک کردن انتخاب", deleteSelected:"حذف انتخاب‌شده‌ها", moveSelected:"جابه‌جایی انتخاب‌شده‌ها", moveTo:"انتقال به", move:"انتقال", home:"خانه", bulkDeleteConfirm:"موارد انتخاب‌شده حذف شوند؟ پوشه‌ها همراه همه زیرمواردشان حذف می‌شوند.",
    totalCodes:"تعداد کدها", folders:"پوشه‌ها", languages:"زبان‌ها",
    empty:"هنوز چیزی وجود ندارد", emptyFolder:"این پوشه خالی است",
    createFolder:"ساخت پوشه", editFolder:"ویرایش پوشه",
    createCode:"ساخت کد", editCode:"ویرایش کد",
    title:"عنوان", description:"توضیحات", language:"زبان", code:"کد",
    cancel:"لغو", save:"ذخیره", create:"ساختن", close:"بستن",
    rename:"تغییر نام", renamed:"نام تغییر کرد.", renamePrompt:"نام جدید را وارد کنید:", moved:"آیتم جابه‌جا شد.", moveInvalid:"این جابه‌جایی مجاز نیست.", storageUnavailable:"ذخیره‌سازی محلی در دسترس نیست و تغییرات ذخیره نشد.", backupLanguages:"انتخاب بر اساس زبان", noLanguages:"هنوز زبانی وجود ندارد.", view:"مشاهده", edit:"ویرایش", delete:"حذف",
    requiredTitle:"عنوان الزامی است.", requiredLanguage:"زبان الزامی است.",
    folderCreated:"پوشه ساخته شد.", folderUpdated:"پوشه ویرایش شد.",
    codeCreated:"کد ساخته شد.", codeUpdated:"کد ویرایش شد.",
    deleted:"آیتم حذف شد.", deleteConfirm:"این آیتم حذف شود؟ این عملیات قابل بازگشت نیست.",
    noResults:"نتیجه‌ای پیدا نشد.", items:"مورد", root:"خانه",
    copied:"کد کپی شد!", copy:"کپی", clipboardFailed:"دسترسی به کلیپ‌بورد ممکن نیست.", invalidData:"داده نامعتبر است.",
    importSuccess:"پشتیبان با موفقیت وارد شد.", importFailed:"بازیابی ناموفق بود.",
    replacePrompt:"داده‌ای از قبل وجود دارد. با این پشتیبان جایگزین شود?"
  },
  ar: {
    workspace:"مساحة العمل", allItems:"كل العناصر",
    workspaceSubtitle:"نظّم الأكواد والمشاريع القابلة لإعادة الاستخدام محليًا.",
    newFolder:"مجلد جديد", newCode:"كود جديد",
    searchPlaceholder:"ابحث في الأكواد والمجلدات واللغات...",
    filter:"تصفية", sort:"ترتيب", newest:"الأحدث", oldest:"الأقدم", az:"أ-ي", za:"ي-أ", lines:"أسطر", folder:"مجلد", copy:"نسخ", selectAll:"تحديد الكل", clearAll:"مسح التحديد", download:"تنزيل", backupRecursive:"اختيار مجلد يشمل جميع المجلدات والأكواد المتداخلة.", selectSomething:"اختر عنصرًا واحدًا على الأقل.", backupSuccess:"تم تنزيل النسخة الاحتياطية.", tabHint:"Tab = 4 مسافات", codeLabel:"الكود",
    backup:"نسخة احتياطية", import:"استيراد", select:"تحديد", selected:"محدد", selectVisible:"تحديد العناصر الظاهرة", clearSelection:"مسح التحديد", deleteSelected:"حذف المحدد", moveSelected:"نقل المحدد", moveTo:"نقل إلى", move:"نقل", home:"الرئيسية", bulkDeleteConfirm:"حذف العناصر المحددة؟ ستُحذف المجلدات مع جميع العناصر المتداخلة.",
    totalCodes:"إجمالي الأكواد", folders:"المجلدات", languages:"اللغات",
    empty:"لا توجد عناصر بعد", emptyFolder:"هذا المجلد فارغ",
    createFolder:"إنشاء مجلد", editFolder:"تعديل المجلد",
    createCode:"إنشاء كود", editCode:"تعديل الكود",
    title:"العنوان", description:"الوصف", language:"اللغة", code:"الكود",
    cancel:"إلغاء", save:"حفظ", create:"إنشاء", close:"إغلاق",
    rename:"إعادة تسمية", renamed:"تم تغيير الاسم.", renamePrompt:"أدخل الاسم الجديد:", moved:"تم نقل العنصر.", moveInvalid:"لا يمكن إجراء هذا النقل.", storageUnavailable:"التخزين المحلي غير متاح ولم يتم حفظ التغييرات.", backupLanguages:"تحديد حسب اللغة", noLanguages:"لا توجد لغات بعد.", view:"عرض", edit:"تعديل", delete:"حذف",
    requiredTitle:"العنوان مطلوب.", requiredLanguage:"اللغة مطلوبة.",
    folderCreated:"تم إنشاء المجلد.", folderUpdated:"تم تحديث المجلد.",
    codeCreated:"تم إنشاء الكود.", codeUpdated:"تم تحديث الكود.",
    deleted:"تم حذف العنصر.", deleteConfirm:"حذف هذا العنصر؟ لا يمكن التراجع عن هذا الإجراء.",
    noResults:"لا توجد نتائج مطابقة.", items:"عناصر", root:"الرئيسية",
    copied:"تم نسخ الكود!", copy:"نسخ", clipboardFailed:"الحافظة غير متاحة.", invalidData:"بيانات غير صالحة.",
    importSuccess:"تم استيراد النسخة الاحتياطية بنجاح.", importFailed:"فشل الاستيراد.",
    replacePrompt:"توجد بيانات بالفعل. هل تريد استبدالها بهذه النسخة الاحتياطية؟"
  }
};

let current = "en";

function setLanguage(lang) {
  current = translations[lang] ? lang : "en";
  document.documentElement.lang = current;
  document.documentElement.dir = current === "en" ? "ltr" : "rtl";
  try { localStorage.setItem("code-manager-language", current); } catch {}
  return current;
}

function getLanguage() {
  try { return localStorage.getItem("code-manager-language") || "en"; } catch { return "en"; }
}

function t(key) {
  return translations[current]?.[key] ?? translations.en[key] ?? key;
}

function applyI18n() {
  document.querySelectorAll("[data-i18n]").forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
  document.querySelectorAll("[data-i18n-title]").forEach(el => {
    el.title = t(el.dataset.i18nTitle);
  });
}
