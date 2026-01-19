import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useState } from "react";
import { usePosStore } from "../store";
import { useAuthStore } from "../authStore";
import type { Product } from "../types";

type ProductFormData = {
  name: string;
  price: string;
  category_id: string;
};

export function ProductEditor() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    price: "",
    category_id: "",
  });

  const products = usePosStore((s) => s.products);
  const categories = usePosStore((s) => s.categories);
  const addProduct = usePosStore((s) => s.addProduct);
  const updateProduct = usePosStore((s) => s.updateProduct);
  const deleteProduct = usePosStore((s) => s.deleteProduct);
  const isAdmin = useAuthStore((s) => s.isAdmin());

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setEditingId(null);
    setFormData({ name: "", price: "", category_id: String(categories[0]?.id ?? "") });
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      category_id: String(product.category_id),
    });
  };

  const handleSave = async () => {
    const price = parseFloat(formData.price);
    const category_id = parseInt(formData.category_id);
    if (!formData.name || isNaN(price) || price < 0 || isNaN(category_id)) return;

    try {
      if (editingId) {
        await updateProduct(editingId, {
          name: formData.name,
          price,
          category_id,
        });
      } else {
        await addProduct({
          name: formData.name,
          price,
          category_id,
        });
      }

      setEditingId(null);
      setFormData({ name: "", price: "", category_id: String(categories[0]?.id ?? "") });
    } catch {
      alert("Ошибка при сохранении продукта");
    }
  };

  const handleDelete = async (id: number | string) => {
    if (confirm("Удалить этот продукт?")) {
      try {
        await deleteProduct(id);
      } catch {
        alert("Ошибка при удалении продукта");
      }
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<EditIcon />}
        onClick={handleOpen}
        sx={{ mb: 2 }}
      >
        Редактировать меню
      </Button>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Редактирование меню</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3, mt: 1 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              {editingId ? "Редактировать продукт" : "Добавить продукт"}
            </Typography>
            <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
              <TextField
                size="small"
                label="Название"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                sx={{ flex: 2 }}
              />
              <TextField
                size="small"
                label="Цена"
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                sx={{ flex: 1 }}
              />
              <FormControl size="small" sx={{ flex: 1 }}>
                <InputLabel>Категория</InputLabel>
                <Select
                  value={formData.category_id}
                  label="Категория"
                  onChange={(e) =>
                    setFormData({ ...formData, category_id: e.target.value })
                  }
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat.id} value={String(cat.id)}>
                      {cat.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={!formData.name || !formData.price}
              >
                {editingId ? "Сохранить" : <AddIcon />}
              </Button>
              {editingId && (
                <Button
                  variant="outlined"
                  onClick={() => {
                    setEditingId(null);
                    setFormData({ name: "", price: "", category_id: String(categories[0]?.id ?? "") });
                  }}
                >
                  Отмена
                </Button>
              )}
            </Box>
          </Box>

          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Список продуктов
          </Typography>
          <List sx={{ maxHeight: 400, overflow: "auto" }}>
            {products.map((product) => (
              <ListItem
                key={product.id}
                secondaryAction={
                  <Box>
                    <IconButton
                      edge="end"
                      onClick={() => handleEdit(product)}
                      sx={{ mr: 1 }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      onClick={() => handleDelete(product.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                }
              >
                <ListItemText
                  primary={product.name}
                  secondary={`${product.price} ₽ • ${
                    categories.find((c) => c.id === product.category_id)?.name ?? "Без категории"
                  }`}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Закрыть</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
