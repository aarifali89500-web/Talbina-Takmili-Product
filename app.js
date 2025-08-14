// Firebase (no build, direct modules)
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-analytics.js";
import { getFirestore, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDVWFxU3AlndO-ihXA8GudYEtovWTytcIs",
  authDomain: "takmili-talbina-product.firebaseapp.com",
  projectId: "takmili-talbina-product",
  storageBucket: "takmili-talbina-product.firebasestorage.app",
  messagingSenderId: "459890564026",
  appId: "1:459890564026:web:ab997b5346eaf00ca39b83",
  measurementId: "G-WF0JLFBMNL"
};

const app = initializeApp(firebaseConfig);
try { getAnalytics(app); } catch(e){ /* analytics optional on http */ }
const db = getFirestore(app);

// ---- i18n strings ----
const I = {
  hi:{title:"Takmeeli Talbina",subtitle:"सुन्नत सेहत का तोहफ़ा",noReturn:"रिटर्न नहीं होगा • 7% ऑनलाइन/कैश डिस्काउंट • वजन: 250 ग्राम",
      products:"Products / उत्पाद",hadith:"Hadith / हदीस",certs:"Certificates / प्रमाण पत्र",recipe:"Recipe / विधि",
      videos:"Videos",contact:"Contact",upi:"UPI: (आप बाद में admin में जोड़ें)",share:"Share",
      noReturnShort:"No Returns • 7% Online/Cash Discount",large:"Large ₹",small:"Small ₹",
      order:"WhatsApp पर ऑर्डर",details:"Details",install:"Install App",admin:"Admin"},
  ur:{title:"تکمیلی تلبینہ",subtitle:"سنت صحت کا تحفہ",noReturn:"واپسی نہیں • 7% آن لائن/نقد رعایت • وزن: 250 گرام",
      products:"Products / پروڈکٹس",hadith:"Hadith / حدیث",certs:"Certificates / سرٹیفکیٹس",recipe:"Recipe / ترکیب",
      videos:"Videos",contact:"رابطہ",upi:"یو پی آئی: (بعد میں ایڈمن میں شامل کریں)",share:"شیئر",
      noReturnShort:"No Returns • 7% Online/Cash Discount",large:"Large ₹",small:"Small ₹",
      order:"واٹس ایپ پر آرڈر",details:"تفصیل",install:"ایپ انسٹال",admin:"ایڈمن"},
  en:{title:"Takmeeli Talbina",subtitle:"Sunnah gift of health",noReturn:"No returns • 7% online/cash discount • Weight: 250g",
      products:"Products",hadith:"Hadith",certs:"Certificates",recipe:"Recipe",
      videos:"Videos",contact:"Contact",upi:"UPI: (add later in admin)",share:"Share",
      noReturnShort:"No Returns • 7% Online/Cash Discount",large:"Large ₹",small:"Small ₹",
      order:"Order on WhatsApp",details:"Details",install:"Install App",admin:"Admin"}
};
const $ = s=>document.querySelector(s);
const $$ = s=>document.querySelectorAll(s);

const langSel = $("#langSel");
const setLang = (L)=>{
  localStorage.setItem("lang",L);
  Object.entries(I[L]).forEach(([k,v])=>{
    $$(`[data-i="${k}"]`).forEach(n=>n.textContent=v);
  });
  renderProducts(L);
};
langSel.value = localStorage.getItem("lang") || "hi";
setLang(langSel.value);
langSel.addEventListener("change", e=> setLang(e.target.value));

// ---- Load & render products from Firestore ----
const productTpl = $("#productTpl");
const productList = $("#productList");

async function renderProducts(L="hi"){
  productList.innerHTML = "Loading...";
  try{
    const q = query(collection(db,"products"), orderBy("created","desc"));
    const snap = await getDocs(q);
    productList.innerHTML = "";
    if (snap.empty){ productList.innerHTML = "<p class='muted'>No products yet.</p>"; return; }
    snap.forEach(doc=>{
      const p = doc.data();
      const el = productTpl.content.cloneNode(true);
      el.querySelector(".pimg").src = p.imageUrl || "assets/placeholder.jpg";
      const name = p[`name_${L}`] || p.name_en || p.name_hi || p.name_ur || "Talbina";
      el.querySelector(".pname").textContent = name;
      el.querySelector(".pLarge").textContent = p.priceLarge;
      el.querySelector(".pSmall").textContent = p.priceSmall;
      el.querySelector(".pWeight").textContent = p.weight || "250g";

      const desc = (p[`benefits_${L}`]||"") + (p[`illness_${L}`]? ` • ${p[`illness_${L}`]}` : "");
      el.querySelector(".pdesc").textContent = desc;

      // details block (recipe + hadith)
      const details = [];
      if (p[`recipe_${L}`]) details.push(`<strong>Recipe:</strong> ${p[`recipe_${L}`]}`);
      if (p.hadith) details.push(`<strong>Hadith:</strong> ${p.hadith}`);
      el.querySelector(".detailsTxt").innerHTML = details.join("<br>");

      // WhatsApp order button
      const wbtn = el.querySelector(".wbtn");
      const qty = el.querySelector(".qty");
      wbtn.addEventListener("click", ()=>{
        const qn = Math.max(1, parseInt(qty.value||"1",10));
        const msg = encodeURIComponent(`Order: ${name}\nQty: ${qn}\nLarge ₹${p.priceLarge} / Small ₹${p.priceSmall}\nWeight: ${p.weight||"250g"}`);
        const phone = "919997007267"; // 99 9700 7267 -> with country code
        window.open(`https://wa.me/${phone}?text=${msg}`,"_blank");
      });

      productList.appendChild(el);
    });
  }catch(err){
    console.error(err);
    productList.innerHTML = "<p class='muted'>Failed to load products.</p>";
  }
}

// CTA WhatsApp/email default
$("#waCTA").href = "https://wa.me/919997007267?text=" + encodeURIComponent("Assalamualaikum, I want to order Talbina.");
$("#emailCTA").href = "mailto:talbinatakmili@gmail.com";

// Web Share
$("#shareBtn").addEventListener("click", async ()=>{
  const shareData = {
    title: "Takmeeli Talbina",
    text: "Sunnah-based healthy Talbina — benefits, recipe, and order online.",
    url: location.href
  };
  if (navigator.share) await navigator.share(shareData);
  else window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareData.text+" "+shareData.url)}`,"_blank");
});

// PWA install prompt
let deferredPrompt;
window.addEventListener("beforeinstallprompt",(e)=>{
  e.preventDefault(); deferredPrompt = e;
  const b = document.getElementById("btnInstall");
  b.classList.remove("hidden");
  b.onclick = async ()=>{
    b.disabled = true;
    await deferredPrompt.prompt();
    deferredPrompt = null; b.classList.add("hidden");
  };
});

// Service worker register
if ("serviceWorker" in navigator){
  navigator.serviceWorker.register("sw.js");
}
