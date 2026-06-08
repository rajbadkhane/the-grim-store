"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Edit3, FolderPlus, ImagePlus, Loader2, Plus, Search, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";

type Category = {
  id: string;
  name: string;
  slug: string;
  image?: string;
  banner?: string;
  product_count?: number;
};

type SubCategory = {
  id: string;
  name: string;
  slug: string;
  category_id: string;
};

const blankCategory = { name: "", slug: "", image: "", banner: "" };
const blankSubCategory = { name: "", slug: "", categoryId: "" };

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [categoryModal, setCategoryModal] = useState<Category | null | "new">(null);
  const [subModal, setSubModal] = useState<SubCategory | null | "new">(null);

  async function load() {
    try {
      setLoading(true);
      await api.get("/auth/me");
      const [categoryRes, subRes] = await Promise.all([api.get("/products/categories"), api.get("/products/subcategories")]);
      setCategories(categoryRes.data.categories ?? []);
      setSubCategories(subRes.data.subCategories ?? []);
    } catch (error: any) {
      if (error.response?.status === 401) router.push("/login");
      else toast.error(error.response?.data?.message ?? "Unable to load categories");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const value = query.toLowerCase();
    return categories.filter((category) => `${category.name} ${category.slug}`.toLowerCase().includes(value));
  }, [categories, query]);

  async function deleteCategory(category: Category) {
    if (!confirm(`Delete category "${category.name}"?`)) return;
    try {
      await api.delete(`/products/categories/${category.id}`);
      toast.success("Category deleted");
      load();
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? "Unable to delete category");
    }
  }

  async function deleteSubCategory(subCategory: SubCategory) {
    if (!confirm(`Delete subcategory "${subCategory.name}"?`)) return;
    try {
      await api.delete(`/products/subcategories/${subCategory.id}`);
      toast.success("Subcategory deleted");
      load();
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? "Unable to delete subcategory");
    }
  }

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-black uppercase tracking-widest text-indigo-600">Catalog</p>
          <h2 className="mt-2 text-3xl font-black text-slate-950">Categories</h2>
          <p className="mt-1 text-sm text-slate-500">Manage storefront categories and subcategories used by products.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => setSubModal("new")} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 shadow-sm hover:bg-slate-50">
            <FolderPlus size={18} /> Add Subcategory
          </button>
          <button onClick={() => setCategoryModal("new")} className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-black text-white shadow-sm hover:bg-indigo-500">
            <Plus size={18} /> Add Category
          </button>
        </div>
      </div>

      <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex w-full max-w-md items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-400">
            <Search size={18} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search categories" className="ml-2 w-full bg-transparent text-sm text-slate-800" />
          </label>
          <span className="text-sm font-bold text-slate-500">{filtered.length} categories</span>
        </div>

        {loading ? (
          <div className="grid min-h-52 place-items-center text-slate-500">
            <Loader2 className="mb-2 animate-spin" /> Loading categories
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((category) => {
              const children = subCategories.filter((item) => item.category_id === category.id);
              return (
                <article key={category.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                  <div className="relative h-32 bg-slate-100">
                    {category.banner || category.image ? (
                      <img src={category.banner || category.image} alt={category.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="grid h-full place-items-center text-slate-400">
                        <ImagePlus />
                      </div>
                    )}
                    <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-black text-slate-700 shadow-sm">
                      {category.product_count ?? 0} products
                    </span>
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-black text-slate-950">{category.name}</h3>
                        <p className="text-sm text-slate-500">/{category.slug}</p>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => setCategoryModal(category)} aria-label="Edit category" className="rounded-xl p-2 text-slate-500 hover:bg-indigo-50 hover:text-indigo-700">
                          <Edit3 size={17} />
                        </button>
                        <button onClick={() => deleteCategory(category)} aria-label="Delete category" className="rounded-xl p-2 text-slate-500 hover:bg-red-50 hover:text-red-600">
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {children.length ? children.map((item) => (
                        <span key={item.id} className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                          {item.name}
                          <button onClick={() => setSubModal(item)} aria-label={`Edit ${item.name}`} className="text-slate-400 hover:text-indigo-600">
                            <Edit3 size={12} />
                          </button>
                          <button onClick={() => deleteSubCategory(item)} aria-label={`Delete ${item.name}`} className="text-slate-400 hover:text-red-600">
                            <X size={12} />
                          </button>
                        </span>
                      )) : <p className="text-sm text-slate-400">No subcategories yet.</p>}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {categoryModal && (
        <CategoryModal
          category={categoryModal === "new" ? null : categoryModal}
          onClose={() => setCategoryModal(null)}
          onSaved={() => {
            setCategoryModal(null);
            load();
          }}
        />
      )}
      {subModal && (
        <SubCategoryModal
          subCategory={subModal === "new" ? null : subModal}
          categories={categories}
          onClose={() => setSubModal(null)}
          onSaved={() => {
            setSubModal(null);
            load();
          }}
        />
      )}
    </div>
  );
}

function CategoryModal({ category, onClose, onSaved }: { category: Category | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState(category ? { name: category.name, slug: category.slug, image: category.image ?? "", banner: category.banner ?? "" } : blankCategory);
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!form.name.trim()) {
      toast.error("Category name is required");
      return;
    }
    setSaving(true);
    try {
      if (category) await api.patch(`/products/categories/${category.id}`, form);
      else await api.post("/products/categories", form);
      toast.success(category ? "Category updated" : "Category created");
      onSaved();
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? "Unable to save category");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={category ? "Edit Category" : "Add Category"} onClose={onClose}>
      <div className="grid gap-4">
        <Field label="Name" value={form.name} onChange={(value) => setForm((current) => ({ ...current, name: value }))} required />
        <Field label="Slug" value={form.slug} onChange={(value) => setForm((current) => ({ ...current, slug: value }))} placeholder="auto-generated if blank" />
        <Field label="Image URL" value={form.image} onChange={(value) => setForm((current) => ({ ...current, image: value }))} />
        <Field label="Banner URL" value={form.banner} onChange={(value) => setForm((current) => ({ ...current, banner: value }))} />
      </div>
      <ModalActions onClose={onClose} onSave={save} saving={saving} label={category ? "Save Category" : "Create Category"} />
    </Modal>
  );
}

function SubCategoryModal({ subCategory, categories, onClose, onSaved }: { subCategory: SubCategory | null; categories: Category[]; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState(subCategory ? { name: subCategory.name, slug: subCategory.slug, categoryId: subCategory.category_id } : { ...blankSubCategory, categoryId: categories[0]?.id ?? "" });
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!form.name.trim() || !form.categoryId) {
      toast.error("Name and category are required");
      return;
    }
    setSaving(true);
    try {
      if (subCategory) await api.patch(`/products/subcategories/${subCategory.id}`, form);
      else await api.post("/products/subcategories", form);
      toast.success(subCategory ? "Subcategory updated" : "Subcategory created");
      onSaved();
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? "Unable to save subcategory");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={subCategory ? "Edit Subcategory" : "Add Subcategory"} onClose={onClose}>
      <div className="grid gap-4">
        <Field label="Name" value={form.name} onChange={(value) => setForm((current) => ({ ...current, name: value }))} required />
        <Field label="Slug" value={form.slug} onChange={(value) => setForm((current) => ({ ...current, slug: value }))} placeholder="auto-generated if blank" />
        <label className="text-sm font-bold text-slate-700">
          Parent Category <span className="text-red-500">*</span>
          <select value={form.categoryId} onChange={(event) => setForm((current) => ({ ...current, categoryId: event.target.value }))} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900">
            <option value="">Select category</option>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
        </label>
      </div>
      <ModalActions onClose={onClose} onSave={save} saving={saving} label={subCategory ? "Save Subcategory" : "Create Subcategory"} />
    </Modal>
  );
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4">
      <div className="w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <h3 className="text-xl font-black text-slate-950">{title}</h3>
          <button onClick={onClose} aria-label="Close" className="rounded-xl p-2 text-slate-500 hover:bg-slate-100">
            <X />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function ModalActions({ onClose, onSave, saving, label }: { onClose: () => void; onSave: () => void; saving: boolean; label: string }) {
  return (
    <div className="mt-6 flex justify-end gap-3">
      <button onClick={onClose} className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-black text-slate-700">Cancel</button>
      <button onClick={onSave} disabled={saving} className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-black text-white disabled:opacity-60">
        {saving && <Loader2 className="animate-spin" size={18} />} {label}
      </button>
    </div>
  );
}

function Field({ label, value, onChange, required, placeholder }: { label: string; value: string; onChange: (value: string) => void; required?: boolean; placeholder?: string }) {
  return (
    <label className="text-sm font-bold text-slate-700">
      {label} {required && <span className="text-red-500">*</span>}
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900" />
    </label>
  );
}
