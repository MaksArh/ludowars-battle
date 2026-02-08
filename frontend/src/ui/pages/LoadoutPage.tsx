import { useEffect } from 'react';
import { Box, Typography, Button, Card, CardActionArea, CardContent, Chip, Stack, Grid } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { useInventoryStore } from '@/store/inventoryStore';
import { getItemById } from '@/config/shopItems';
import { ROUTES } from '@/config/constants';
import { audioService } from '@/services/AudioService';
import { useNavigateWithSound } from '@/hooks';
import { PageHeader } from '@/ui/components';

export function LoadoutPage() {
  const navigateTo = useNavigateWithSound();
  const {
    weapons, armor, perks,
    equippedWeapon, equippedArmor, equippedPerks,
    equipWeapon, equipArmor, togglePerk,
    loadInventory,
  } = useInventoryStore();

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  const ownedWeapons = weapons.map((id) => getItemById(id)).filter(Boolean);
  const ownedArmor = armor.map((id) => getItemById(id)).filter(Boolean);
  const ownedPerks = perks.map((id) => getItemById(id)).filter(Boolean);

  const handleEquip = (equipFn: (id: string) => void) => (id: string) => {
    audioService.playSFX('equip');
    equipFn(id);
  };

  const SelectCard = ({ item, selected, onSelect }: { item: NonNullable<ReturnType<typeof getItemById>>; selected: boolean; onSelect: () => void }) => (
    <Card sx={{ border: selected ? 2 : 0, borderColor: 'primary.main' }}>
      <CardActionArea onClick={onSelect}>
        <CardContent sx={{ py: 1.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography>{item.name}</Typography>
            {selected && <Chip label="Equipped" size="small" color="primary" />}
          </Box>
          {item.stats && (
            <Typography variant="caption" color="text.secondary">
              {item.stats.damage && `DMG:${item.stats.damage} `}
              {item.stats.fireRate && `Rate:${item.stats.fireRate}/s`}
              {item.stats.defense && `DEF:+${item.stats.defense}%`}
            </Typography>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );

  return (
    <Box sx={{ p: 3, maxWidth: 1000, mx: 'auto' }}>
      <PageHeader title="Loadout" />

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Typography variant="h6" gutterBottom>Weapon</Typography>
          <Stack spacing={1}>
            {ownedWeapons.map((item) => (
              <SelectCard key={item!.id} item={item!} selected={equippedWeapon === item!.id} onSelect={() => handleEquip(equipWeapon)(item!.id)} />
            ))}
          </Stack>
        </Grid>

        <Grid item xs={12} md={4}>
          <Typography variant="h6" gutterBottom>Armor</Typography>
          <Stack spacing={1}>
            {ownedArmor.map((item) => (
              <SelectCard key={item!.id} item={item!} selected={equippedArmor === item!.id} onSelect={() => handleEquip(equipArmor)(item!.id)} />
            ))}
          </Stack>
        </Grid>

        <Grid item xs={12} md={4}>
          <Typography variant="h6" gutterBottom>Perks (max 2)</Typography>
          <Stack spacing={1}>
            {ownedPerks.length === 0 ? (
              <Typography color="text.secondary">No perks. Visit shop!</Typography>
            ) : (
              ownedPerks.map((item) => (
                <SelectCard key={item!.id} item={item!} selected={equippedPerks.includes(item!.id)} onSelect={() => handleEquip(togglePerk)(item!.id)} />
              ))
            )}
          </Stack>
        </Grid>
      </Grid>

      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Button variant="contained" size="large" startIcon={<PlayArrowIcon />} onClick={() => navigateTo(ROUTES.MATCHMAKING)} sx={{ px: 6, py: 1.5 }}>
          Find Match
        </Button>
      </Box>
    </Box>
  );
}
