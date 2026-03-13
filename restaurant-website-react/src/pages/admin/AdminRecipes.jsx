import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ChefHat,
  Search,
  Plus,
  Trash2,
  Save,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { setRecipes, upsertRecipe } from "../../store/slices/recipesSlice";
import recipesService from "../../services/recipesService";
import ingredientsService from "../../services/ingredientsService";
import productsService from "../../services/productsService";
import { showNotification } from "../../store/slices/notificationSlice";

const AdminRecipes = () => {
  const dispatch = useDispatch();
  const recipes = useSelector((state) => state.recipes.recipes);

  const [products, setProducts] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [recipeIngredients, setRecipeIngredients] = useState([]);
  const [saving, setSaving] = useState(false);
  const [existingRecipeId, setExistingRecipeId] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [productsRes, recipesRes, ingRes] = await Promise.all([
        productsService.fetchProducts(),
        recipesService.getRecipes(),
        ingredientsService.getIngredients(),
      ]);
      setProducts(productsRes || []);
      dispatch(setRecipes(recipesRes.recipes || []));
      setIngredients(ingRes.ingredients || []);
    } catch {
      dispatch(
        showNotification({ message: "Failed to load data", type: "error" }),
      );
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const recipeMap = {};
  recipes.forEach((r) => {
    const pid = r.productId?._id || r.productId;
    if (pid) recipeMap[pid] = r;
  });

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.category || "").toLowerCase().includes(search.toLowerCase()),
  );

  const handleSelectProduct = async (product) => {
    setSelectedProduct(product);
    const pid = product._id || product.id;
    const existing = recipeMap[pid];
    if (existing) {
      setExistingRecipeId(existing.id || existing._id);
      setRecipeIngredients(existing.ingredients.map((i) => ({ ...i })));
    } else {
      setExistingRecipeId(null);
      setRecipeIngredients([]);
    }
  };

  const addIngredientRow = () => {
    setRecipeIngredients([
      ...recipeIngredients,
      { ingredientId: "", ingredientName: "", unit: "", quantityRequired: 1 },
    ]);
  };

  const updateRow = (idx, field, value) => {
    const rows = [...recipeIngredients];
    rows[idx] = { ...rows[idx], [field]: value };
    if (field === "ingredientId") {
      const ing = ingredients.find((i) => (i._id || i.id) === value);
      if (ing) {
        rows[idx].ingredientName = ing.name;
        rows[idx].unit = ing.unit;
      }
    }
    setRecipeIngredients(rows);
  };

  const removeRow = (idx) => {
    setRecipeIngredients(recipeIngredients.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    if (!selectedProduct) return;
    const validRows = recipeIngredients.filter(
      (r) => r.ingredientId && r.quantityRequired > 0,
    );
    setSaving(true);
    try {
      const res = await recipesService.saveRecipe({
        productId: selectedProduct._id || selectedProduct.id,
        ingredients: validRows,
      });
      dispatch(upsertRecipe(res.recipe));
      dispatch(
        showNotification({
          message: "Recipe saved successfully!",
          type: "success",
        }),
      );
      loadData();
    } catch (err) {
      dispatch(
        showNotification({
          message: err.message || "Failed to save recipe",
          type: "error",
        }),
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-md">
          <ChefHat className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl lg:text-4xl font-bold text-primary">
            Recipes
          </h1>
          <p className="text-sm text-dark-gray">
            Define ingredient usage per dish — enables automatic stock deduction
            on orders
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Product List */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search dishes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
              />
            </div>
          </div>
          <div className="overflow-y-auto max-h-[500px] divide-y divide-gray-50">
            {loading ? (
              <div className="p-8 text-center text-dark-gray text-sm">
                Loading dishes...
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="p-8 text-center text-dark-gray text-sm">
                No dishes found
              </div>
            ) : (
              filteredProducts.map((product) => {
                const pid = product._id || product.id;
                const hasRecipe = !!recipeMap[pid];
                const isSelected =
                  selectedProduct?._id === product._id ||
                  selectedProduct?.id === product.id;
                return (
                  <button
                    key={pid}
                    onClick={() => handleSelectProduct(product)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 ${isSelected ? "bg-primary/5 border-l-4 border-primary" : ""}`}
                  >
                    <img
                      src={productsService.getImageUrl(product)}
                      alt={product.name}
                      className="w-10 h-10 rounded-lg object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                    <div className="w-10 h-10 rounded-lg bg-gray-100 items-center justify-center hidden">
                      <ChefHat className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-dark text-sm truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-dark-gray">
                        {product.category}
                      </p>
                    </div>
                    {hasRecipe ? (
                      <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-gray-300 shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Recipe Editor */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          {!selectedProduct ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <ChefHat className="w-14 h-14 text-gray-200 mb-4" />
              <p className="font-medium text-dark-gray">
                Select a dish to edit its recipe
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Recipes define which ingredients are used when a dish is ordered
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-semibold text-dark">
                    {selectedProduct.name}
                  </h2>
                  <p className="text-xs text-dark-gray">
                    {selectedProduct.category} ·{" "}
                    {existingRecipeId ? "Editing recipe" : "No recipe yet"}
                  </p>
                </div>
                <button
                  onClick={addIngredientRow}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Ingredient
                </button>
              </div>

              {recipeIngredients.length === 0 ? (
                <div className="text-center py-8 text-dark-gray text-sm">
                  <p>
                    No ingredients yet. Click "Add Ingredient" to start defining
                    this recipe.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 mb-5">
                  {recipeIngredients.map((row, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-12 gap-2 items-end"
                    >
                      <div className="col-span-6">
                        {idx === 0 && (
                          <label className="block text-xs text-dark-gray mb-1">
                            Ingredient
                          </label>
                        )}
                        <select
                          value={row.ingredientId}
                          onChange={(e) =>
                            updateRow(idx, "ingredientId", e.target.value)
                          }
                          className="w-full px-2 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm bg-white"
                        >
                          <option value="">Select...</option>
                          {ingredients.map((ing) => (
                            <option
                              key={ing._id || ing.id}
                              value={ing._id || ing.id}
                            >
                              {ing.name} ({ing.unit})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-3">
                        {idx === 0 && (
                          <label className="block text-xs text-dark-gray mb-1">
                            Qty Required
                          </label>
                        )}
                        <input
                          type="number"
                          min="0.001"
                          step="0.001"
                          value={row.quantityRequired}
                          onChange={(e) =>
                            updateRow(
                              idx,
                              "quantityRequired",
                              parseFloat(e.target.value) || 0,
                            )
                          }
                          className="w-full px-2 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                        />
                      </div>
                      <div className="col-span-2">
                        {idx === 0 && (
                          <label className="block text-xs text-dark-gray mb-1">
                            Unit
                          </label>
                        )}
                        <input
                          type="text"
                          value={row.unit}
                          readOnly
                          className="w-full px-2 py-2 rounded-xl border border-gray-100 bg-gray-50 text-sm text-dark-gray"
                        />
                      </div>
                      <div className="col-span-1 flex justify-end">
                        <button
                          onClick={() => removeRow(idx)}
                          className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white font-medium shadow-sm hover:shadow-md transition-all disabled:opacity-60"
                >
                  <Save className="w-4 h-4" />
                  {saving ? "Saving..." : "Save Recipe"}
                </button>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-dark-gray hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminRecipes;
