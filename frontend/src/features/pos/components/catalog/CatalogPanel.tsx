import { Box, Typography, Paper, Button } from "@mui/material";
import Grid from "@mui/material/Grid";
import { ProductGrid } from "./ProductGrid";
import { usePosStore } from "../../store";
import { useState, useRef, useEffect } from "react";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";

export function CatalogPanel() {
  const products = usePosStore((s) => s.products);
  const categories = usePosStore((s) => s.categories);
  const addToCurrent = usePosStore((s) => s.addToCurrent);

  // Разделяем категории на основные и добавки
  const addonCategories = categories.filter((c) => c.is_addon);

  // Получаем продукты-добавки
  const addonProducts = products.filter((p) =>
    p.is_active && addonCategories.some((c) => c.id === p.category_id)
  );

  // Состояние для высоты секции добавок (в пикселях)
  const [addonHeight, setAddonHeight] = useState(200);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const newHeight = containerRect.bottom - e.clientY;

      // Ограничиваем минимальную и максимальную высоту
      const minHeight = 150;
      const maxHeight = containerRect.height - 200;

      setAddonHeight(Math.max(minHeight, Math.min(maxHeight, newHeight)));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  return (
    <Box
      ref={containerRef}
      sx={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}
    >
      {/* Основные продукты - занимают оставшееся пространство */}
      <Box sx={{ flex: 1, overflow: "auto", p: 2, minHeight: 200 }}>
        <ProductGrid />
      </Box>

      {/* Добавки - изменяемая секция внизу */}
      {addonProducts.length > 0 && (
        <>
          {/* Перетаскиваемый разделитель */}
          <Box
            onMouseDown={handleMouseDown}
            sx={{
              height: 8,
              bgcolor: isDragging ? "primary.main" : "divider",
              cursor: "ns-resize",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: isDragging ? "none" : "background-color 0.2s",
              "&:hover": {
                bgcolor: "primary.light",
              },
              userSelect: "none",
            }}
          >
            <DragIndicatorIcon
              sx={{
                fontSize: 20,
                color: isDragging ? "primary.contrastText" : "text.secondary",
                transform: "rotate(90deg)"
              }}
            />
          </Box>

          <Paper
            elevation={3}
            sx={{
              height: addonHeight,
              overflow: "auto",
              p: 2,
              bgcolor: "background.paper",
              borderTop: 2,
              borderColor: "divider",
              display: "flex",
              flexDirection: "column"
            }}
          >
            <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 700, flexShrink: 0 }}>
              Добавки
            </Typography>
            <Box sx={{ overflow: "auto" }}>
              <Grid container spacing={1}>
                {addonProducts.map((product) => (
                  <Grid key={product.id} size={{ xs: 12, sm: 6, md: 3 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      sx={{
                        minHeight: 56,
                        height: "auto",
                        py: 1,
                        textTransform: "none",
                        fontWeight: 600,
                        whiteSpace: "normal",
                        wordWrap: "break-word",
                        borderWidth: 2,
                        "&:hover": {
                          borderWidth: 2,
                        }
                      }}
                      onClick={() => addToCurrent(product)}
                    >
                      <Typography sx={{ fontSize: "0.85rem", fontWeight: 600 }}>
                        {product.name}
                      </Typography>
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Paper>
        </>
      )}
    </Box>
  );
}
