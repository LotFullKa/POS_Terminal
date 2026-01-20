import { Box, Select, MenuItem, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, FormControl, InputLabel, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { usePosStore } from "../store";
import { useAuthStore } from "../authStore";
import { useState } from "react";

export function TopBar() {
  const page = usePosStore((s) => s.page);
  const setPage = usePosStore((s) => s.setPage);
  const categories = usePosStore((s) => s.categories);
  const addCategory = usePosStore((s) => s.addCategory);
  const updateCategory = usePosStore((s) => s.updateCategory);
  const deleteCategory = usePosStore((s) => s.deleteCategory);
  const isAdmin = useAuthStore((s) => s.isAdmin());

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [categoryName, setCategoryName] = useState("");

  const handleAdd = () => {
    setEditingId(null);
    setCategoryName("");
    setDialogOpen(true);
  };

  const handleEdit = (id: number, name: string) => {
    setEditingId(id);
    setCategoryName(name);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!categoryName.trim()) return;

    try {
      if (editingId) {
        await updateCategory(editingId, categoryName);
      } else {
        const slug = categoryName.toLowerCase().replace(/\s+/g, '-');
        await addCategory(categoryName, slug);
      }

      setDialogOpen(false);
      setCategoryName("");
      setEditingId(null);
    } catch {
      alert("Ошибка при сохранении категории");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Удалить эту категорию? Все продукты в ней также будут удалены.")) {
      try {
        await deleteCategory(id);
      } catch {
        alert("Ошибка при удалении категории");
      }
    }
  };

  return (
    <>
      <Box sx={{ height: 64, display: "flex", alignItems: "center", px: 2, gap: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Меню
        </Typography>

        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Категория</InputLabel>
          <Select
            value={page}
            label="Категория"
            onChange={(e) => setPage(e.target.value)}
            size="small"
          >
            <MenuItem value="all">Все</MenuItem>
            {categories.map((c) => (
              <MenuItem key={c.id} value={c.slug}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                  <span>{c.name}</span>
                  {isAdmin && (
                    <Box sx={{ display: "flex", gap: 0.5, ml: 2 }}>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(c.id, c.name);
                        }}
                        sx={{ p: 0.3 }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      {categories.length > 1 && (
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(c.id);
                          }}
                          sx={{ p: 0.3 }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  )}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {isAdmin && (
          <IconButton onClick={handleAdd} color="primary" size="small">
            <AddIcon />
          </IconButton>
        )}
      </Box>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>{editingId ? "Редактировать категорию" : "Новая категория"}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Название категории"
            fullWidth
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSave()}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Отмена</Button>
          <Button onClick={handleSave} variant="contained" disabled={!categoryName.trim()}>
            {editingId ? "Сохранить" : "Добавить"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
