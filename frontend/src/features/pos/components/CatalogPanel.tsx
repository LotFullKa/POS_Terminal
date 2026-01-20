import { Box } from "@mui/material";
import { ProductGrid } from "./ProductGrid";
import { ProductEditor } from "./ProductEditor";

export function CatalogPanel() {
  return (
    <Box sx={{ p: 2, display: "grid", gap: 2 }}>
      <Box>
        <ProductEditor />
      </Box>
      <ProductGrid />
    </Box>
  );
}
