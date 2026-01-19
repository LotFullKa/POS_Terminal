import { useEffect, useState } from "react";
import { Box, IconButton, Tooltip, Button } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import ReceiptIcon from "@mui/icons-material/Receipt";
import { TopBar } from "./components/TopBar";
import { CartPanel } from "./components/CartPanel";
import { CatalogPanel } from "./components/CatalogPanel";
import { OrdersPage } from "./components/OrdersPage";
import { usePosStore } from "./store";
import { useAuthStore } from "./authStore";

type Page = "pos" | "orders";

export function PosScreen() {
  const [currentPage, setCurrentPage] = useState<Page>("pos");
  const loadCategories = usePosStore((s) => s.loadCategories);
  const loadProducts = usePosStore((s) => s.loadProducts);
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const isAdmin = useAuthStore((s) => s.isAdmin);

  useEffect(() => {
    loadCategories();
    loadProducts();
  }, [loadCategories, loadProducts]);

  if (currentPage === "orders") {
    return <OrdersPage onBack={() => setCurrentPage("pos")} />;
  }

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
        <Box sx={{ borderBottom: "1px solid", borderColor: "divider", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <TopBar />
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 2 }}>
            {isAdmin() && (
              <Tooltip title="Заказы по датам">
                <Button
                  startIcon={<ReceiptIcon />}
                  onClick={() => setCurrentPage("orders")}
                  size="small"
                >
                  Заказы
                </Button>
              </Tooltip>
            )}
            <Tooltip title={`${user?.username} (${user?.role === 'admin' ? 'Администратор' : 'Пользователь'})`}>
              <span style={{ fontSize: "0.875rem", color: "#666" }}>{user?.username}</span>
            </Tooltip>
            <Tooltip title="Выйти">
              <IconButton onClick={logout} size="small">
                <LogoutIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Box sx={{ overflow: "auto" }}>
          <CatalogPanel />
        </Box>
      </Box>
    </Box>
  );
}
