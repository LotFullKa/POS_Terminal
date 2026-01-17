import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  Typography,
  Divider,
  Box,
} from "@mui/material";
import type { Order } from "../types";

const money = (n: number) => new Intl.NumberFormat("ru-RU").format(n);

type Props = {
  order: Order | null;
  open: boolean;
  onClose: () => void;
};

export function OrderCard({ order, open, onClose }: Props) {
  if (!order) return null;

  const lines = Object.values(order.lines);
  const total = lines.reduce((sum, l) => sum + l.price * l.qty, 0);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{order.name}</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Создан: {new Date(order.createdAt).toLocaleString("ru-RU")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Статус: {order.status === "NEW" ? "Новый" : "К выдаче"}
          </Typography>
          {order.comment && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Комментарий: {order.comment}
            </Typography>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 700 }}>
          Позиции заказа
        </Typography>

        {lines.length === 0 ? (
          <Typography color="text.secondary">Заказ пуст</Typography>
        ) : (
          <List dense>
            {lines.map((l) => (
              <ListItem key={l.productId}>
                <ListItemText
                  primary={l.name}
                  secondary={`${money(l.price)} × ${l.qty} = ${money(l.price * l.qty)}`}
                />
              </ListItem>
            ))}
          </List>
        )}

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Итого
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            {money(total)}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Закрыть</Button>
      </DialogActions>
    </Dialog>
  );
}
