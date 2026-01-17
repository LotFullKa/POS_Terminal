import { Box, Paper, Typography } from "@mui/material";
import { ProductGrid } from "./ProductGrid";
import { ProductEditor } from "./ProductEditor";

export function CatalogPanel() {
  return (
    <Box sx={{ p: 2, display: "grid", gap: 2 }}>
      <Box>
        <ProductEditor />
      </Box>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <Typography variant="h6" sx={{ flex: 1 }}>Меню</Typography>
        </Box>
        <ProductGrid />
      </Paper>
    </Box>
  );
}
