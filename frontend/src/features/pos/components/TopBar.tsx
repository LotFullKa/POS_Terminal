import { Box, Tabs, Tab, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { usePosStore } from "../store";
import { useState } from "react";

export function TopBar() {
  const page = usePosStore((s) => s.page);
  const setPage = usePosStore((s) => s.setPage);
  const categories = usePosStore((s) => s.categories);
  const addCategory = usePosStore((s) => s.addCategory);
  const updateCategory = usePosStore((s) => s.updateCategory);
  const deleteCategory = usePosStore((s) => s.deleteCategory);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState("");

  const value = categories.findIndex((c) => c.id === page);

  const handleAdd = () => {
    setEditingId(null);
    setCategoryName("");
    setDialogOpen(true);
  };

  const handleEdit = (id: string, label: string) => {
    setEditingId(id);
    setCategoryName(label);
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!categoryName.trim()) return;

    if (editingId) {
      updateCategory(editingId, categoryName);
    } else {
      addCategory(categoryName);
    }

    setDialogOpen(false);
    setCategoryName("");
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    if (confirm("Удалить эту категорию? Все продукты в ней также будут удалены.")) {
      deleteCategory(id);
    }
  };

  return (
    <>
      <Box sx={{ height: 64, display: "flex", alignItems: "center", px: 1.5, gap: 1 }}>
        <Tabs
          value={value}
          onChange={(_, idx) => setPage(categories[idx].id)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ flex: 1 }}
        >
          {categories.map((c) => (
            <Tab
              key={c.id}
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  {c.label}
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(c.id, c.label);
                    }}
                    sx={{ ml: 0.5, p: 0.3 }}
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
              }
            />
          ))}
        </Tabs>
        <IconButton onClick={handleAdd} color="primary">
          <AddIcon />
        </IconButton>
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
