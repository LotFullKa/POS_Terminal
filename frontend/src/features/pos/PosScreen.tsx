import { Box } from "@mui/material";
import { TopBar } from "./components/TopBar";
import { CartPanel } from "./components/CartPanel";
import { CatalogPanel } from "./components/CatalogPanel";

export function PosScreen() {
  return (
    <Box
      sx={{
        height: "100vh",
        display: "grid",
        gridTemplateColumns: "360px 1fr",
        bgcolor: "background.default",
      }}
    >
      <Box sx={{ borderRight: "1px solid", borderColor: "divider" }}>
        <CartPanel />
      </Box>

      <Box sx={{ display: "grid", gridTemplateRows: "64px 1fr" }}>
        <Box sx={{ borderBottom: "1px solid", borderColor: "divider" }}>
          <TopBar />
        </Box>

        <Box sx={{ overflow: "auto" }}>
          <CatalogPanel />
        </Box>
      </Box>
    </Box>
  );
}
