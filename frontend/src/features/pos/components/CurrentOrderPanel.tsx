import {
  Box, Typography, List, ListItem, ListItemText,
  IconButton, Divider, Button, TextField
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { usePosStore } from "../store";
import { useRef } from "react";

const money = (n: number) => new Intl.NumberFormat("ru-RU").format(n);

export function CurrentOrderPanel() {
  const orders = usePosStore((s) => s.orders);
  const currentOrderId = usePosStore((s) => s.currentOrderId);

  const setOrderName = usePosStore((s) => s.setOrderName);
  const setOrderComment = usePosStore((s) => s.setOrderComment);
  const toggleOrderPaid = usePosStore((s) => s.toggleOrderPaid);
  const moveToQueueAndCreateNew = usePosStore((s) => s.moveToQueueAndCreateNew);

  const incLine = usePosStore((s) => s.incLine);
  const decLine = usePosStore((s) => s.decLine);
  const cancelOrder = usePosStore((s) => s.cancelOrder);

  const orderNameInputRef = useRef<HTMLInputElement>(null);
  const orderCommentInputRef = useRef<HTMLInputElement>(null);

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      orderCommentInputRef.current?.focus();
    }
  };

  const handleMoveToQueue = () => {
    if (!current) return;
    moveToQueueAndCreateNew();
    setTimeout(() => {
      orderNameInputRef.current?.focus();
      orderNameInputRef.current?.select();
    }, 0);
  };

  const current = currentOrderId ? orders[currentOrderId] : null;
  const currentLines = current ? Object.values(current.lines) : [];
  const total = currentLines.reduce((sum, l) => sum + l.price * l.qty, 0);
  const isHandedOff = current?.status === "HANDOFF";

  return (
    <Box sx={{ p: 2, display: "flex", flexDirection: "column", height: "100%" }}>
      {current && (
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            size="small"
            label="Название заказа"
            value={current.name}
            onChange={(e) => setOrderName(current.id, e.target.value)}
            onKeyDown={handleNameKeyDown}
            inputRef={orderNameInputRef}
            disabled={isHandedOff}
            sx={{ mb: 1 }}
          />
          <TextField
            fullWidth
            size="small"
            label="Комментарий"
            value={current.comment}
            onChange={(e) => setOrderComment(current.id, e.target.value)}
            inputRef={orderCommentInputRef}
            disabled={isHandedOff}
            multiline
            rows={2}
          />
        </Box>
      )}

      <Divider sx={{ mb: 1 }} />

      <List dense sx={{ flex: 1, overflow: "auto" }}>
        {currentLines.map((l) => (
          <ListItem
            key={l.productId}
            secondaryAction={
              !isHandedOff && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <IconButton onClick={() => decLine(Number(l.productId))}><RemoveIcon /></IconButton>
                  <Typography sx={{ minWidth: 24, textAlign: "center" }}>{l.qty}</Typography>
                  <IconButton onClick={() => incLine(Number(l.productId))}><AddIcon /></IconButton>
                </Box>
              )
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
          cursor: current && !isHandedOff ? "pointer" : "default",
          bgcolor: current?.isPaid ? "success.light" : "transparent",
          transition: "background-color 0.2s",
          "&:hover": current && !isHandedOff ? { bgcolor: current.isPaid ? "success.main" : "action.hover" } : {},
        }}
        onClick={() => current && !isHandedOff && toggleOrderPaid(current.id)}
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
          disabled={!current || isHandedOff}
        >
          Удалить
        </Button>

        <Button
          fullWidth
          variant="contained"
          onClick={handleMoveToQueue}
          disabled={!current || !current.isPaid || isHandedOff}
        >
          В очередь
        </Button>
      </Box>
    </Box>
  );
}
