import { useState, useEffect } from 'react';
import { Box, Tabs, Tab, Card, CardContent, Typography, Button, Grid, Chip, Snackbar, Alert, CircularProgress } from '@mui/material';
import { useUserStore } from '@/store/userStore';
import { useInventoryStore } from '@/store/inventoryStore';
import { getItemsByCategory } from '@/config/shopItems';
import { purchaseItem } from '@/services/shopService';
import { ShopItem, ItemCategory } from '@/types/shop';
import { audioService } from '@/services/AudioService';
import { PageHeader, CoinsChip } from '@/ui/components';
import { RARITY_COLORS } from '@/ui/theme';

const CATEGORIES: { label: string; value: ItemCategory }[] = [
  { label: 'Weapons', value: 'weapons' },
  { label: 'Armor', value: 'armor' },
  { label: 'Perks', value: 'perks' },
  { label: 'Cosmetics', value: 'cosmetics' },
];

export function ShopPage() {
  const user = useUserStore((s) => s.user);
  const { hasItem, loadInventory } = useInventoryStore();

  const [tab, setTab] = useState<ItemCategory>('weapons');
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [snack, setSnack] = useState<{ open: boolean; msg: string; ok: boolean }>({ open: false, msg: '', ok: true });

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  const handleBuy = async (item: ShopItem) => {
    if (!user || user.coins < item.price) return;
    audioService.playSFX('ui_click');
    setPurchasing(item.id);
    const result = await purchaseItem(item.id);
    audioService.playSFX(result.success ? 'pickup' : 'ui_error');
    setSnack({ open: true, msg: result.success ? `Purchased ${item.name}!` : result.error || 'Failed', ok: result.success });
    setPurchasing(null);
  };

  const handleTabChange = (_: React.SyntheticEvent, value: ItemCategory) => {
    audioService.playSFX('ui_click');
    setTab(value);
  };

  const items = getItemsByCategory(tab);

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <PageHeader title="Shop" rightElement={<CoinsChip coins={user?.coins ?? 0} />} />

      <Tabs value={tab} onChange={handleTabChange} sx={{ mb: 3 }} variant="fullWidth">
        {CATEGORIES.map((c) => (
          <Tab key={c.value} value={c.value} label={c.label} />
        ))}
      </Tabs>

      <Grid container spacing={2}>
        {items.map((item) => {
          const owned = hasItem(item.id);
          const canAfford = (user?.coins || 0) >= item.price;

          return (
            <Grid item xs={12} sm={6} md={4} key={item.id}>
              <Card sx={{ height: '100%', borderLeft: 4, borderColor: RARITY_COLORS[item.rarity], opacity: owned ? 0.7 : 1 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="h6">{item.name}</Typography>
                    <Chip label={item.rarity} size="small" sx={{ bgcolor: RARITY_COLORS[item.rarity], color: '#fff', textTransform: 'capitalize' }} />
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{item.description}</Typography>

                  {item.stats && (
                    <Box sx={{ mb: 2 }}>
                      {item.stats.damage && <Typography variant="caption" display="block">Damage: {item.stats.damage}</Typography>}
                      {item.stats.fireRate && <Typography variant="caption" display="block">Fire Rate: {item.stats.fireRate}/s</Typography>}
                      {item.stats.defense && <Typography variant="caption" display="block">Defense: +{item.stats.defense}%</Typography>}
                      {item.stats.speedModifier && item.stats.speedModifier !== 1 && <Typography variant="caption" display="block">Speed: {Math.round(item.stats.speedModifier * 100)}%</Typography>}
                    </Box>
                  )}

                  {item.perkEffect && (
                    <Typography variant="caption" color="primary" display="block" sx={{ mb: 2 }}>
                      Effect: {item.perkEffect.replace(/_/g, ' ')}
                    </Typography>
                  )}

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" color={item.isDefault ? 'text.secondary' : 'warning.main'}>
                      {item.isDefault ? 'Free' : `${item.price}`}
                    </Typography>
                    {owned ? (
                      <Chip label="Owned" color="success" />
                    ) : (
                      <Button variant="contained" disabled={!canAfford || purchasing === item.id} onClick={() => handleBuy(item)}>
                        {purchasing === item.id ? <CircularProgress size={20} /> : 'Buy'}
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert severity={snack.ok ? 'success' : 'error'} onClose={() => setSnack({ ...snack, open: false })}>{snack.msg}</Alert>
      </Snackbar>
    </Box>
  );
}
