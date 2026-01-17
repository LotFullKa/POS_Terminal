import { Button, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import { usePosStore } from "../store";

export function ProductGrid() {
  const products = usePosStore((s) => s.products);
  const page = usePosStore((s) => s.page);
  const addToCurrent = usePosStore((s) => s.addToCurrent);

  const filteredProducts = products.filter((p) => p.page === page);

  if (products.length === 0) {
    return (
      <Typography sx={{ color: "text.secondary", p: 2, textAlign: "center" }}>
        Нет продуктов. Добавьте их через "Редактировать меню"
      </Typography>
    );
  }

  if (filteredProducts.length === 0) {
    return (
      <Typography sx={{ color: "text.secondary", p: 2, textAlign: "center" }}>
        Нет продуктов в этой категории
      </Typography>
    );
  }

  return (
    <Grid container spacing={1.2} sx={{ mt: 1 }}>
      {filteredProducts.map((product) => (
        <Grid key={product.id} size={{ xs: 6, sm: 4, md: 3, lg: 2 }}>
          <Button
            fullWidth
            variant="contained"
            sx={{ height: 72, textTransform: "none", fontWeight: 700 }}
            onClick={() => addToCurrent(product)}
          >
            <Typography sx={{ fontSize: "0.9rem", fontWeight: 700 }}>
              {product.name}
            </Typography>
          </Button>
        </Grid>
      ))}
    </Grid>
  );
}
