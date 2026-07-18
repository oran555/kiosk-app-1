"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import AdminProductCard from "@/components/AdminProductCard";
import Notification from "@/components/Notification";

type Product = {  
  id: string;
  name: string;
  price: number;
  is_available: boolean;
  image_url: string | null;
  category_id: string | null;
};

type Category = {
  id: string;
  name: string;
  display_order: number;
};

export default function MenuPage() {
 const router = useRouter();
const [products, setProducts] = useState<Product[]>([]);
const [showAdd, setShowAdd] = useState(false);
const [isAdding, setIsAdding] = useState(false);
const [newImage, setNewImage] = useState<File | null>(null);
const [newName, setNewName] = useState("");
const [newPrice, setNewPrice] = useState("");
const [editingProduct, setEditingProduct] = useState<Product | null>(null);
const [editName, setEditName] = useState("");
const [editPrice, setEditPrice] = useState("");
const [editAvailable, setEditAvailable] = useState(true);
const [editImage, setEditImage] = useState<File | null>(null);
const [categories, setCategories] = useState<Category[]>([]);
const [newCategory, setNewCategory] = useState("");
const [editCategory, setEditCategory] = useState("");
const [showCategoryAdd, setShowCategoryAdd] = useState(false);
const imagePreview = newImage
  ? URL.createObjectURL(newImage)
  : null;
const [notification, setNotification] = useState<{
  message: string;
  type: "success" | "error" | "warning" | "info";
} | null>(null);

useEffect(() => {
  const modalOpen =
    editingProduct ||
    showAdd ||
    showCategoryAdd;

  if (modalOpen) {
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";
  }

  return () => {
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";
  };
}, [editingProduct, showAdd, showCategoryAdd]);

 async function loadProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("name");

  if (error) {
    console.error(error);
    return;
  }

  setProducts(data || []);
}

  async function loadCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("display_order");

  if (error) {
    console.error(error);
    return;
  }

  setCategories(data || []);
}


  useEffect(() => {
  async function loadData() {
    await Promise.all([
      loadProducts(),
      loadCategories(),
    ]);
  }

  loadData();
}, []);
 
   async function addProduct() {
  try {
    setIsAdding(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    console.log("Current user:", user);

    if (!newName.trim()) {
  showNotification(
  "נא להכניס שם המוצר",
  "warning"
);
  return;
}

 if (!newPrice) {
   showNotification(
    "נא להכניס מחיר למוצר" ,
    "warning"
);
    return;
  }

if (Number(newPrice) <= 0) {
  showNotification(
    "נא להכניס מחיר תקין" ,
    "warning"
);
  return;
}

    let imageUrl: string | null = null;

    if (newImage) {
      const extension = newImage.name.split(".").pop();
      const fileName = `${crypto.randomUUID()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(fileName, newImage);

      if (uploadError) {
        console.error(uploadError);
        alert(JSON.stringify(uploadError));
        return;
      }

      const { data } = supabase.storage
        .from("product-images")
        .getPublicUrl(fileName);

      imageUrl = data.publicUrl;
    }

    const { error } = await supabase
      .from("products")
      .insert({
        name: newName,
        price: Number(newPrice),
        is_available: true,
        image_url: imageUrl,
        category_id: newCategory || null,
      });

    if (error) {
      console.error(error);
      showNotification(
  "שגיאה בהוספת מוצר",
  "error"
);
      return;
    }

    setNewName("");
    setNewPrice("");
    setNewImage(null);
    setNewCategory("");
    setShowAdd(false);

    await loadProducts();
  } catch (error) {
    console.error(error);
    showNotification(
"איראה שגיעה בלתי צפויה",
  "error"
);
  } finally {
    setIsAdding(false);
  }
}

async function addCategory() {
  if (!newCategory.trim()) return;

  const { error } = await supabase
    .from("categories")
    .insert({
      name: newCategory,
      display_order: categories.length + 1,
    });

  if (error) {
    console.error(error);
    showNotification(
  "שגיאה בהוספת קטגוריה",
  "error"
);
    return;
  }

  setNewCategory("");
  loadCategories();
}

async function saveProduct() {
  if (!editingProduct) return;

  let imageUrl = editingProduct.image_url;

  if (editImage) {
    const extension = editImage.name.split(".").pop();
    const fileName = `${Date.now()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(fileName, editImage);

    if (uploadError) {
      console.error(uploadError);
      alert("שגיאה בהעלאת התמונה");
      return;
    }

    const { data } = supabase.storage
      .from("product-images")
      .getPublicUrl(fileName);

    imageUrl = data.publicUrl;
  }

  const { error } = await supabase
    .from("products")
    .update({
      name: editName,
      price: Number(editPrice),
      is_available: editAvailable,
      image_url: imageUrl,
     category_id: editCategory || null,
    })
    .eq("id", editingProduct.id);

  if (error) {
    console.error(error);
    alert("שגיאה בעדכון המוצר");
    return;
  }

  setEditingProduct(null);
  loadProducts();
}
 async function deleteProduct(id: string) {

  const confirmDelete = confirm(
    "האם אתה בטוח שברצונך למחוק את המוצר?"
  );

  if (!confirmDelete) return;


  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id);


    if (error) {
    console.error(error);
    showNotification(
  "שגיאה במחיקת המוצר",
  "error"
);
    return;
  }


  loadProducts();
}
async function deleteCategory(categoryId: string) {
  const confirmed = confirm(
    "למחוק את הקטגוריה?\n\nכל המוצרים בקטגוריה יעברו ל'ללא קטגוריה'."
  );

  if (!confirmed) return;

  await supabase
    .from("products")
    .update({ category_id: null })
    .eq("category_id", categoryId);

  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", categoryId);

  if (error) {
    alert("שגיאה במחיקת הקטגוריה");
    return;
  }

  loadCategories();
  loadProducts();
}

function showNotification(
  message: string,
  type: "success" | "error" | "warning" | "info"
) {
  setNotification({
    message,
    type,
  });

  setTimeout(() => {
    setNotification(null);
  }, 3000);
}

 return (
  
  <main className="min-h-screen bg-slate-100 p-8">
    <div className="mb-10 flex items-center justify-between">
      
{notification && (
  <Notification
    message={notification.message}
    type={notification.type}
    onClose={() => setNotification(null)}
  />
)}
  <div>

    <h1 className="text-4xl font-bold tracking-tight text-slate-900">
      ניהול מוצרים
    </h1>

    <p className="mt-2 text-slate-500">
      עריכה וניהול של תפריט הקיוסק
    </p>

  </div>

  <div className="flex gap-3">

    <button
      onClick={() => setShowAdd(true)}
      className="
        rounded-xl
        bg-slate-900
        px-5
        py-3
        font-semibold
        text-white
        transition
        hover:bg-slate-800
      "
    >
      מוצר חדש
    </button>
     <button
    onClick={() => setShowCategoryAdd(true)}
    className="
      rounded-xl
      bg-slate-900
      px-5
      py-3
      font-semibold
      text-white
      hover:bg-slate-800
    "
  >
     קטגוריה חדשה
  </button>
    <button
      onClick={() => router.push("/kiosk")}
      className="
        rounded-xl
        border
        border-slate-300
        bg-white
        px-5
        py-3
        font-semibold
        text-slate-700
        transition
        hover:bg-slate-50
      "
    >
      לוח הזמנות
    </button>
{showCategoryAdd && (
   <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-4">
    <div className="flex min-h-full items-center justify-center">
      <div className="w-full max-w-xl rounded-3xl bg-white p-8 shadow-2xl">

      <h2 className="mb-5 text-2xl font-bold text-slate-900">
        קטגוריות
      </h2>


      {/* Existing categories */}
      <div className="mb-6">

        <h3 className="mb-3 text-sm font-semibold text-slate-500">
          קטגוריות קיימות
        </h3>

        <div className="flex flex-wrap gap-3">

          {categories.map((category) => (
          <div
  key={category.id}
  className="
    flex
    items-center
    gap-2
    rounded-full
    border
    border-slate-300
    bg-slate-50
    px-4
    py-2
    text-sm
    font-medium
    text-slate-700
  "
>
  <span>
    {category.name}
  </span>

  <button
    onClick={() => deleteCategory(category.id)}
    className="
      text-red-500
      hover:text-red-700
      font-bold
    "
  >
    ✕
  </button>

</div>
          ))}

        </div>

      </div>


      {/* Add category */}
      <input
        value={newCategory}
        onChange={(e) => setNewCategory(e.target.value)}
        placeholder="שם הקטגוריה"
        className="mb-5 w-full rounded-xl border border-slate-300 px-4 py-3 text-black"
      />


      <div className="flex gap-3">

        <button
          onClick={() => {
            addCategory();
            setShowCategoryAdd(false);
          }}
          className="flex-1 rounded-xl bg-slate-900 py-3 font-semibold text-white"
        >
          הוסף
        </button>

        <button
          onClick={() => {
            setShowCategoryAdd(false);
            setNewCategory("");
          }}
          className="flex-1 rounded-xl border border-slate-300 py-3 font-semibold text-black"
        >
          ביטול
        </button>

      </div>

    </div>

  </div>
  </div>
)}

  </div>

</div>

  

  {showAdd && (
  <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-4">
    <div className="flex min-h-full items-center justify-center">
      <div className="w-full max-w-xl rounded-3xl bg-white p-8 shadow-2xl">

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">
          מוצר חדש
        </h2>

        <p className="mt-1 text-slate-500">
          הוסף מוצר חדש לתפריט
        </p>
      </div>

      <input
        value={newName}
        onChange={(e) => setNewName(e.target.value)}
        placeholder="שם המוצר"
       className="mb-4 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900"
      />

      <input
        type="number"
        value={newPrice}
        onChange={(e) => setNewPrice(e.target.value)}
        placeholder="מחיר"
     className="mb-4 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900"
      />

    <div className="mt-8 border-t border-slate-200 pt-6">
 

 
</div>

  <label className="block cursor-pointer rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center hover:bg-slate-100 ">
  <div className="mb-6">

  <input
    type="file"
    accept="image/*"
    onChange={(e) =>
      setNewImage(e.target.files?.[0] || null)
    }
    className="
      w-full
      rounded-xl
      border
      border-slate-300
      bg-white
      p-3
      text-slate-700
      file:mr-4
      file:rounded-lg
      file:border-0
      file:bg-slate-900
      file:px-4
      file:py-2
      file:text-white
      file:cursor-pointer
      hover:file:bg-slate-800
    "
  />

  {imagePreview && (
  <div className="mt-4">

    <p className="mb-2 text-sm font-medium text-slate-700">
      תצוגה מקדימה
    </p>

    <img
      src={imagePreview}
      alt="Preview"
      className="
        h-40
        w-full
        rounded-xl
        border
        border-slate-300
        object-cover
      "
    />

    <p className="mt-2 text-sm text-slate-500">
      {newImage?.name}
    </p>

  </div>
)}

</div>

</label>

      <div className="flex gap-3">

        <button
  onClick={addProduct}
  disabled={isAdding}
  className="
    flex-1
    rounded-xl
    bg-slate-900
    py-3
    font-semibold
    text-white
    transition
    hover:bg-slate-800
    disabled:opacity-50
    disabled:cursor-not-allowed
  "
>
  {isAdding ? "מוסיף..." : "שמור"}
</button>

        <button
          onClick={() => {
            setShowAdd(false);
            setNewName("");
            setNewPrice("");
            setNewImage(null);
            setNewCategory("");
          }}
          className="flex-1 rounded-xl border border-slate-300 bg-white py-3 font-semibold text-slate-700 hover:bg-slate-50"
        >
          ביטול
        </button>

      </div>

    </div>
  </div>
  </div>
)}

 {editingProduct && (
 <div
  className="
    fixed
    inset-0
    z-50
    overflow-y-auto
    bg-black/50
    p-4
  "
>
  <div className="flex min-h-full items-center justify-center">
  <div className="w-full max-w-xl rounded-3xl bg-white p-8 shadow-2xl">
     <div className="mb-6">
  <h2 className="text-3xl font-bold text-slate-900">
    עריכת מוצר
  </h2>

  <p className="mt-1 text-slate-500">
    עדכן את פרטי המוצר
  </p>
</div>
 <label className="mb-6 flex items-center gap-3 text-black">
        <input
          type="checkbox"
          checked={editAvailable}
          onChange={(e) =>
            setEditAvailable(e.target.checked)
          }
        />
        המוצר זמין במלאי
      </label>
      <input
        value={editName}
        onChange={(e) => setEditName(e.target.value)}
        placeholder="שם המוצר"
       className="mb-4 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-slate-500"
      />

      <input
        type="number"
        value={editPrice}
        onChange={(e) => setEditPrice(e.target.value)}
        placeholder="מחיר"
        className="mb-4 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-slate-500"
      />

      <select
        value={editCategory}
        onChange={(e) => setEditCategory(e.target.value)}
        className="mb-4 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-slate-500"
      >
        <option value="">ללא קטגוריה</option>

       
      </select>

{editingProduct?.image_url ? (
<Image
  src={editingProduct.image_url}
  alt={editingProduct.name}
  width={600}
  height={300}
  className="mb-4 h-48 w-full rounded-xl border object-cover"
/>
) : (
  <div className="mb-4 flex h-48 items-center justify-center rounded-xl border-2 border-dashed border-slate-300 text-slate-400">
    אין תמונה
  </div>
)}

<input
    type="file"
    accept="image/*"
  onChange={(e) =>
    setEditImage(e.target.files?.[0] || null)
  }
  className="mb-6 w-full rounded-xl border border-dashed border-slate-300 p-4 text-slate-600"
/>

     

      <div className="flex gap-3">
        <button
          onClick={saveProduct}
          className="flex-1 rounded-xl bg-slate-900 py-3 font-semibold text-white transition hover:bg-slate-800"
        >
          שמור
        </button>

        <button
          onClick={() => {
            setEditingProduct(null);
            setEditImage(null);
          }}
          className="flex-1 rounded-xl border border-slate-300 bg-white py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          ביטול
        </button>
      </div>
    </div>
  </div>
   </div>
)}

   <div className="mx-auto max-w-7xl px-8 pb-10">

  {categories.map((category) => {
    const categoryProducts = products.filter(
      (product) => product.category_id === category.id
    );

    if (categoryProducts.length === 0) return null;

    return (
      <section key={category.id} className="mb-12">

        <h2 className="mb-6 text-3xl font-bold text-slate-900">
          {category.name}
        </h2>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

          {categoryProducts.map((product) => (
            <AdminProductCard
              key={product.id}
              product={product}
              onEdit={() => {
                setEditingProduct(product);
                setEditName(product.name);
                setEditPrice(product.price.toString());
                setEditAvailable(product.is_available);
                setEditCategory(product.category_id ?? "");
                setEditImage(null);
              }}
              onDelete={() => deleteProduct(product.id)}
            />
          ))}

        </div>

      </section>
    );
  })}
{products.filter((product) => !product.category_id).length > 0 && (
  <section className="mb-12">

    <h2 className="mb-6 text-3xl font-bold text-slate-900">
      ללא קטגוריה
    </h2>

    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

      {products
        .filter((product) => !product.category_id)
        .map((product) => (
          <AdminProductCard
            key={product.id}
            product={product}
            onEdit={() => {
              setEditingProduct(product);
              setEditName(product.name);
              setEditPrice(product.price.toString());
              setEditAvailable(product.is_available);
              setEditCategory("");
              setEditImage(null);
            }}
            onDelete={() => deleteProduct(product.id)}
          />
        ))}

    </div>

  </section>
)}
</div>
  </main>
);
}