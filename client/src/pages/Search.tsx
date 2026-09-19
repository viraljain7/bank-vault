import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Grid, InputAdornment, TextField, Typography } from '@mui/material';
import { Search } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { EmptyState } from '../components/ui/EmptyState';
import { ItemListSkeleton } from '../components/ui/Skeletons';
import { useVaultItems, useVaultMutations } from '../hooks/useVaultQueries';
import { useVault } from '../contexts/VaultContext';
import { BankAccountCard } from '../components/vault/BankAccountCard';
import { CardListItem } from '../components/vault/CardListItem';

/**
 * Global vault search. Searchable metadata (bank name, card brand, nickname,
 * last four digits) is stored unencrypted by design so searching never
 * requires decrypting every credential.
 */
export function SearchPage() {
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const navigate = useNavigate();
  const { phase } = useVault();
  const enabled = phase === 'unlocked';
  const mutations = useVaultMutations(enabled);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query.trim()), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const searching = debounced.length > 0;
  const { data, isLoading, isFetching } = useVaultItems(searching ? { q: debounced } : {}, enabled && searching);
  const results = data ?? [];

  return (
    <Box>
      <PageHeader title="Search" subtitle="Find credentials by bank, brand, nickname or last digits" />

      <Box >
        <TextField
          fullWidth
          placeholder="Try “HDFC”, “Visa”, “Personal” or “4821”..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          inputProps={{ 'aria-label': 'Search your vault' }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={20} />
              </InputAdornment>
            ),
          }}
          autoFocus
          sx={{
            '& .MuiOutlinedInput-root': {
              height: 48,
              bgcolor: 'background.paper',
              borderRadius: 1.5,
            },
          }}
        />
      </Box>

      <Box sx={{ mt: 3 }}>
        {!searching && (
          <Typography variant="body2" color="text.secondary">
            Your vault is searched by safe metadata only — encrypted secrets are never scanned.
          </Typography>
        )}

        {searching && (isLoading || isFetching) && <ItemListSkeleton count={2} />}

        {searching && !isLoading && !isFetching && results.length === 0 && (
          <EmptyState
            icon={<Search size={32} />}
            title="No matches"
            description={`Nothing found for “${debounced}”. Try a different bank, brand, nickname or last four digits.`}
          />
        )}

        {results.length > 0 && (
          <Grid container spacing={2.5}>
            {results.map((item) =>
              item.type === 'bank' ? (
                <Grid size={{ xs: 12, md: 6, lg: 4 }} key={item._id}>
                  <BankAccountCard
                    item={item}
                    onEdit={() => navigate(`/banks/${item._id}/edit`)}
                    onDelete={() => undefined}
                    onToggleFavorite={() =>
                      mutations.toggleFavorite.mutate({ id: item._id, favorite: !item.favorite })
                    }
                  />
                </Grid>
              ) : (
                <Grid size={{ xs: 12, md: 6, lg: 4 }} key={item._id}>
                  <CardListItem
                    item={item}
                    onEdit={() => navigate(`/cards/${item._id}/edit`)}
                    onDelete={() => undefined}
                    onToggleFavorite={() =>
                      mutations.toggleFavorite.mutate({ id: item._id, favorite: !item.favorite })
                    }
                    onOpen={() => navigate(`/cards/${item._id}`)}
                  />
                </Grid>
              ),
            )}
          </Grid>
        )}
      </Box>
    </Box>
  );
}