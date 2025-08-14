import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { getStorage, ref as sRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-storage.js";

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
const auth = getAuth(app);
const db   = getFirestore(app);
const st   = getStorage(app);

const $ = s=>document.querySelector(s);
const loginForm = $("#loginForm");
const authBox = $("#authBox");
const adminBox = $("#adminBox");
const logoutBtn = $("#logoutBtn");

onAuthStateChanged(auth, (u)=>{
  if(u){ authBox.classList.add("hidden"); adminBox.classList.remove("hidden"); loadProducts(); }
  else { authBox.classList.remove("hidden"); adminBox.classList.add("hidden"); }
});

loginForm?.addEventListener("submit", async (e)=>{
  e.preventDefault();
  const email = $("#email").value.trim();
  const password = $("#password").value;
  try{
    await signInWithEmailAndPassword(auth,email,password);
  }catch(err){ alert(err.message); }
});

logoutBtn?.addEventListener("click", ()=> signOut(auth));

const prodForm = $("#prodForm");
const adminList = $("#adminList");
const tpl = $("#adminItemTpl");

async function uploadImageIfAny(){
  const f = document.getElementById("imageFile").files[0];
  if(!f) return null;
  const key = `products/${Date.now()}_${f.name}`;
  const r = sRef(st, key);
  await uploadBytes(r, f);
  return await getDownloadURL(r);
}

prodForm?.addEventListener("submit", async (e)=>{
  e.preventDefault();
  const data = Object.fromEntries(new FormData(prodForm).entries());
  try{
    const upUrl = await uploadImageIfAny();
    if (upUrl) data.imageUrl = upUrl;
    if (!data.imageUrl && !data.id) data.imageUrl = ""; // optional

    if (data.id){
      const id = data.id; delete data.id;
      await updateDoc(doc(db,"products",id), data);
      alert("Updated");
    }else{
      data.created = serverTimestamp();
      await addDoc(collection(db,"products"), data);
      alert("Saved");
    }
    prodForm.reset(); loadProducts();
  }catch(err){ alert(err.message); }
});

async function loadProducts(){
  adminList.innerHTML = "Loading...";
  const snap = await getDocs(collection(db,"products"));
  adminList.innerHTML = "";
  snap.forEach(d=>{
    const p = d.data();
    const el = tpl.content.cloneNode(true);
    el.querySelector(".thumb").src = p.imageUrl || "assets/placeholder.jpg";
    el.querySelector(".nm").textContent = p.name_en || p.name_hi || p.name_ur || "(no name)";
    el.querySelector(".lg").textContent = "₹"+(p.priceLarge||"-");
    el.querySelector(".smP").textContent = "₹"+(p.priceSmall||"-");
    el.querySelector(".wt").textContent = p.weight||"";
    // edit
    el.querySelector(".edit").addEventListener("click", ()=>{
      prodForm.reset();
      for (const [k,v] of Object.entries(p)){
        const inp = prodForm.querySelector(`[name="${k}"]`);
        if (inp) inp.value = v;
      }
      prodForm.querySelector("[name=id]").value = d.id;
      window.scrollTo({top:0,behavior:"smooth"});
    });
    // delete
    el.querySelector(".del").addEventListener("click", async ()=>{
      if (confirm("Delete product?")){ await deleteDoc(doc(db,"products",d.id)); loadProducts(); }
    });
    adminList.appendChild(el);
  });
}
