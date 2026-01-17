import {
  Box, Paper, Typography, List, ListItem, ListItemText,
  IconButton, Divider, Button, ToggleButton, ToggleButtonGroup,
  TextField
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import InfoIcon from "@mui/icons-material/Info";
import { usePosStore } from "../store";
import { OrderCard } from "./OrderCard";
import { EndDayButton } from "./EndDayButton";
import { useState } from "react";

const money = (n: number) => new Intl.NumberFormat("ru-RU").format(n);

export function CartPanel() {
  const statusFilter = usePosStore((s) => s.statusFilter);
  const setStatusFilter = usePosStore((s) => s.setStatusFilter);

  const orders = usePosStore((s) => s.orders);
  const currentOrderId = usePosStore((s) => s.currentOrderId);
  const selectOrder = usePosStore((s) => s.selectOrder);

  const newOrder = usePosStore((s) => s.newOrder);
  const setOrderStatus = usePosStore((s) => s.setOrderStatus);
  const setOrderName = usePosStore((s) => s.setOrderName);
  const setOrderComment = usePosStore((s) => s.setOrderComment);
  const toggleOrderPaid = usePosStore((s) => s.toggleOrderPaid);

  const incLine = usePosStore((s) => s.incLine);
  const decLine = usePosStore((s) => s.decLine);
  const cancelOrder = usePosStore((s) => s.cancelOrder);

  const [viewOrder, setViewOrder] = useState<string | null>(null);

  const current = currentOrderId ? orders[currentOrderId] : null;

  const currentLines = current ? Object.values(current.lines) : [];
  const total = currentLines.reduce((sum, l) => sum + l.price * l.qty, 0);

  const filteredOrders = Object.values(orders)
    .filter((o) => o.status === statusFilter)
    .sort((a, b) => b.createdAt - a.createdAt);

  return (
    <Box sx={{ height: "100vh", p: 2, display: "grid", gridTemplateRows: "auto 1fr auto", gap: 2 }}>
      {/* Текущий заказ */}
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <Typography variant="h6" sx={{ flex: 1 }}>
            Текущий заказ
          </Typography>
          <Button variant="contained" onClick={() => newOrder()}>
            Новый
          </Button>
        </Box>

        {current && (
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              size="small"
              label="Название заказа"
              value={current.name}
              onChange={(e) => setOrderName(current.id, e.target.value)}
              sx={{ mb: 1 }}
            />
            <TextField
              fullWidth
              size="small"
              label="Комментарий"
              value={current.comment}
              onChange={(e) => setOrderComment(current.id, e.target.value)}
              multiline
              rows={2}
            />
          </Box>
        )}

        <Divider sx={{ mb: 1 }} />

        <List dense sx={{ maxHeight: 260, overflow: "auto" }}>
          {currentLines.map((l) => (
            <ListItem
              key={l.productId}
              secondaryAction={
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <IconButton onClick={() => decLine(l.productId)}><RemoveIcon /></IconButton>
                  <Typography sx={{ minWidth: 24, textAlign: "center" }}>{l.qty}</Typography>
                  <IconButton onClick={() => incLine(l.productId)}><AddIcon /></IconButton>
                </Box>
              }
            >
              <ListItemText
                primary={l.name}
                secondary={`${money(l.price)} × ${l.qty} = ${money(l.price * l.qty)}`}
              />
            </ListItem>
          ))}
          {currentLines.length === 0 && (
            <Typography sx={{ color: "text.secondary", p: 1 }}>
              Добавь товары справа
            </Typography>
          )}
        </List>

        <Divider sx={{ my: 1 }} />

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            p: 1,
            borderRadius: 1,
            cursor: current ? "pointer" : "default",
            bgcolor: current?.isPaid ? "success.light" : "transparent",
            transition: "background-color 0.2s",
            "&:hover": current ? { bgcolor: current.isPaid ? "success.main" : "action.hover" } : {},
          }}
          onClick={() => current && toggleOrderPaid(current.id)}
        >
          <Typography sx={{ flex: 1, fontWeight: 700 }}>
            {current?.isPaid ? "✓ Оплачено" : "Итого"}
          </Typography>
          <Typography sx={{ fontWeight: 800 }}>{money(total)}</Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
          <Button
            fullWidth
            variant="outlined"
            color="error"
            onClick={() => current && cancelOrder(current.id)}
            disabled={!current}
          >
            Отменить
          </Button>

          <Button
            fullWidth
            variant="contained"
            onClick={() => current && setOrderStatus(current.id, "HANDOFF")}
            disabled={!current || !current.isPaid}
          >
            Отдать
          </Button>
        </Box>
      </Paper>

      {/* Список заказов */}
      <Paper variant="outlined" sx={{ p: 2, overflow: "auto" }}>
        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 700 }}>
          {statusFilter === "NEW" ? "Новые" : "К выдаче"}
        </Typography>

        <List dense>
          {filteredOrders.map((o) => (
            <ListItem
              key={o.id}
              onClick={() => selectOrder(o.id)}
              sx={{
                cursor: "pointer",
                borderRadius: 1,
                bgcolor: o.id === currentOrderId ? "action.selected" : "transparent",
              }}
              secondaryAction={
                <IconButton
                  edge="end"
                  onClick={(e) => {
                    e.stopPropagation();
                    setViewOrder(o.id);
                  }}
                >
                  <InfoIcon />
                </IconButton>
              }
            >
              <ListItemText
                primary={o.name}
                secondary={new Date(o.createdAt).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
              />
            </ListItem>
          ))}
          {filteredOrders.length === 0 && (
            <Typography sx={{ color: "text.secondary", p: 1 }}>
              Нет заказов
            </Typography>
          )}
        </List>
      </Paper>

      {/* Переключатель статуса и кнопка закрытия дня */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Paper variant="outlined" sx={{ p: 1 }}>
          <ToggleButtonGroup
            fullWidth
            exclusive
            value={statusFilter}
            onChange={(_, v) => v && setStatusFilter(v)}
          >
            <ToggleButton value="NEW">Новый чек</ToggleButton>
            <ToggleButton value="HANDOFF">Отдам</ToggleButton>
          </ToggleButtonGroup>
        </Paper>

        <EndDayButton />
      </Box>

      <OrderCard
        order={viewOrder ? orders[viewOrder] : null}
        open={!!viewOrder}
        onClose={() => setViewOrder(null)}
      />
    </Box>
  );
}
